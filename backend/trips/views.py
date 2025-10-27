from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import Trip
from .serializers import TripSerializer

from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import Trip
from .serializers import TripSerializer

class TripListCreateView(generics.ListCreateAPIView):
    """
    GET /api/trips - Admin only, returns all trips
    POST /api/trips - Any authenticated user can create a trip
    """
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Only admins can list all trips
        if self.request.user.is_admin:
            return Trip.objects.all().select_related('user')
        return Trip.objects.none()  # Non-admins get empty list
    
    def list(self, request, *args, **kwargs):
        # Only admins can list
        if not request.user.is_admin:
            return Response(
                {'message': 'Admin access required'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().list(request, *args, **kwargs)

class MyTripsView(generics.ListAPIView):
    """GET /api/trips/my - Returns current user's trips"""
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Trip.objects.filter(user=self.request.user).select_related('user')

@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def toggle_trip_match(request, pk):
    """PATCH /api/trips/:id/match - Toggle trip match status"""
    try:
        trip = Trip.objects.get(pk=pk)
        trip.is_matched = not trip.is_matched
        trip.save()
        serializer = TripSerializer(trip)
        return Response(serializer.data)
    except Trip.DoesNotExist:
        return Response(
            {'message': 'Trip not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )