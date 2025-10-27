from rest_framework import serializers
from .models import Trip

class TripSerializer(serializers.ModelSerializer):
    # Frontend expects camelCase
    userId = serializers.IntegerField(source='user.id', read_only=True)
    userName = serializers.SerializerMethodField()
    userEmail = serializers.EmailField(source='user.email', read_only=True)
    userPhone = serializers.CharField(source='user.phone', read_only=True)
    departureLocation = serializers.CharField(source='departure_location')
    arrivalLocation = serializers.CharField(source='arrival_location')
    arrivalTime = serializers.TimeField(source='arrival_time')
    recurringDays = serializers.JSONField(source='recurring_days', required=False, allow_null=True)
    isMatched = serializers.BooleanField(source='is_matched', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    
    class Meta:
        model = Trip
        fields = [
            'id', 'userId', 'userName', 'userEmail', 'userPhone',
            'role', 'departureLocation', 'arrivalLocation', 
            'date', 'arrivalTime', 'recurrence', 'recurringDays',
            'isMatched', 'createdAt'
        ]
        read_only_fields = ['id', 'userId', 'userName', 'userEmail', 'userPhone', 'isMatched', 'createdAt']
    
    def get_userName(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    
    def create(self, validated_data):
        # Map camelCase back to snake_case for model
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)