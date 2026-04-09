from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.views.decorators.csrf import csrf_exempt
import json
import requests

from .models import Trip, TripMatch, Event, EventRegistration, update_trip_matched_flags
from .serializers import TripSerializer, TripMatchSerializer, EventSerializer, EventRegistrationSerializer

TELEGRAM_BOT_TOKEN = "8485064756:AAHdOcJNEfZFkIYy97vSiVRqWNOlLT2e-xM"
TELEGRAM_CHAT_ID = "-5010584294" 

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

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def notify_share(request):
    """
    POST /api/admin/notify-share/
    Body JSON:
    {
      "tripId": 1,
      "contactingUser": "Mario Rossi",
      "contactingPhone": "+393331234567",
      "contactedUser": "Luca Bianchi",
      "contactedPhone": "+393339876543",
      "departure": "Milano",
      "arrival": "Bergamo",
      "date": "2025-12-17",
      "time": "08:30"
    }
    """
    try:
        data = json.loads(request.body)
    except Exception:
        return Response({"status": "error", "message": "Invalid JSON"}, status=status.HTTP_400_BAD_REQUEST)

    trip_info = (
        f"📢 Nuovo contatto WhatsApp\n"
        f"Chi contatta: {data.get('contactingUser')} ({data.get('contactingPhone')})\n"
        f"Chi viene contattato: {data.get('contactedUser')} ({data.get('contactedPhone')})\n"
        f"Viaggio: {data.get('departure')} → {data.get('arrival')}\n"
        f"Data: {data.get('date')} {data.get('time')}"
    )

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {"chat_id": TELEGRAM_CHAT_ID, "text": trip_info}

    try:
        requests.post(url, json=payload)
    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({"status": "ok"})


# ─── Events ───────────────────────────────────────────────────────────

class EventListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/events/   → lista pubblica (solo eventi attivi)
    POST /api/events/   → crea evento (solo admin)
    """
    serializer_class = EventSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        if self.request.method == 'GET':
            return Event.objects.filter(is_active=True)
        return Event.objects.all()


class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/events/<slug>/       → dettaglio evento (pubblico)
    PUT    /api/events/<slug>/       → modifica evento (admin)
    DELETE /api/events/<slug>/       → elimina evento (admin)
    """
    serializer_class = EventSerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        if self.request.method == 'GET':
            return Event.objects.filter(is_active=True)
        return Event.objects.all()


class EventByIdView(generics.RetrieveUpdateDestroyAPIView):
    """
    Admin operations by ID:
    GET/PUT/DELETE /api/events/by-id/<pk>/
    """
    serializer_class = EventSerializer
    permission_classes = [IsAdminUser]
    queryset = Event.objects.all()


class EventRegistrationCreateView(generics.CreateAPIView):
    """
    POST /api/events/register/  → registrazione pubblica a un evento
    """
    serializer_class = EventRegistrationSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        registration = serializer.save()
        # Notifica Telegram
        try:
            event = registration.event
            role_label = "Conducente" if registration.role == 'driver' else "Passeggero"
            seats_info = f"\nPosti: {registration.available_seats}" if registration.available_seats else ""
            note_info = f"\nNote: {registration.note}" if registration.note else ""

            message = (
                f"🎫 Nuova registrazione evento\n"
                f"Evento: {event.title}\n"
                f"Ruolo: {role_label}\n"
                f"Contatto: {registration.contact}\n"
                f"Partenza: {registration.departure_city}\n"
                f"Data: {registration.event_date}"
                f"{seats_info}"
                f"{note_info}"
            )

            url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
            payload = {"chat_id": TELEGRAM_CHAT_ID, "text": message}
            requests.post(url, json=payload, timeout=5)
        except Exception as e:
            print(f"Telegram notification failed: {e}")


class EventRegistrationListView(generics.ListAPIView):
    """
    GET /api/events/<slug>/registrations/ → lista registrazioni (admin)
    """
    serializer_class = EventRegistrationSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        slug = self.kwargs.get('slug')
        return EventRegistration.objects.filter(event__slug=slug).select_related('event')
