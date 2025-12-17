from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser

from .models import Trip, TripMatch, update_trip_matched_flags
from .serializers import TripSerializer, TripMatchSerializer


class TripListCreateView(generics.ListCreateAPIView):
    """
    GET /api/trips/        - Tutti gli utenti autenticati vedono tutti i viaggi
    POST /api/trips/       - Qualsiasi utente autenticato può creare un viaggio
    """
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Tutti vedono tutti i viaggi
        return Trip.objects.all().select_related('user')

class MyTripsView(generics.ListAPIView):
    """
    GET /api/trips/my/  - viaggi dell'utente loggato
    """
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Trip.objects.filter(user=self.request.user).select_related('user')


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def toggle_trip_match(request, pk):
    """
    PATCH /api/trips/<id>/match/ - legacy: toggla solo il flag is_matched
    (puoi tenerlo per compat, ma la logica nuova usa TripMatch)
    """
    try:
        trip = Trip.objects.get(pk=pk)
    except Trip.DoesNotExist:
        return Response(
            {'message': 'Trip not found'},
            status=status.HTTP_404_NOT_FOUND
        )

    trip.is_matched = not trip.is_matched
    trip.save()
    serializer = TripSerializer(trip)
    return Response(serializer.data)


class TripDetailView(generics.RetrieveDestroyAPIView):
    """
    GET /api/trips/<id>/   - dettaglio viaggio
    DELETE /api/trips/<id>/ - cancellazione viaggio:
        - l'utente può cancellare solo i propri viaggi
        - l'admin può cancellare qualsiasi viaggio
    """
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Trip.objects.all().select_related('user')
        return Trip.objects.filter(user=user).select_related('user')


class TripMatchListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/trips/matches/              -> lista match (di default solo NON archiviati)
    POST /api/trips/matches/              -> crea nuovo match (admin)

    Body POST:
    {
      "driverTripId": 1,
      "passengerTripId": 5
    }
    """
    serializer_class = TripMatchSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        qs = TripMatch.objects.select_related(
            'driver_trip', 'passenger_trip',
            'driver_trip__user', 'passenger_trip__user'
        )
        include_archived = self.request.query_params.get('include_archived')
        if include_archived in ['1', 'true', 'True']:
            return qs
        return qs.filter(is_archived=False)


class TripMatchDeleteView(generics.DestroyAPIView):
    """
    DELETE /api/trips/matches/<pk>/ -> elimina definitivamente un match
    """
    serializer_class = TripMatchSerializer
    permission_classes = [IsAdminUser]
    queryset = TripMatch.objects.all()

    def perform_destroy(self, instance):
        driver_id = instance.driver_trip_id
        passenger_id = instance.passenger_trip_id
        super().perform_destroy(instance)
        # ricalcola is_matched sui due viaggi
        update_trip_matched_flags([driver_id, passenger_id])


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def archive_match(request, pk):
    """
    PATCH /api/trips/matches/<pk>/archive/ -> segna un match come archiviato
    (non lo cancella, ma sparisce dai match attivi)
    """
    try:
        match = TripMatch.objects.get(pk=pk)
    except TripMatch.DoesNotExist:
        return Response({'message': 'Match non trovato'}, status=status.HTTP_404_NOT_FOUND)

    match.is_archived = True
    match.save()

    update_trip_matched_flags([match.driver_trip_id, match.passenger_trip_id])

    serializer = TripMatchSerializer(match)
    return Response(serializer.data)
