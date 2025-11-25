from rest_framework import serializers
from .models import Trip

class TripSerializer(serializers.ModelSerializer):
    userId = serializers.IntegerField(source='user.id', read_only=True)
    userName = serializers.SerializerMethodField()
    userEmail = serializers.EmailField(source='user.email', read_only=True)
    userPhone = serializers.CharField(source='user.phone', read_only=True)

    departureLocation = serializers.CharField(source='departure_location')
    arrivalLocation = serializers.CharField(source='arrival_location')
    arrivalTime = serializers.TimeField(source='arrival_time')
    recurringDays = serializers.JSONField(
        source='recurring_days',
        required=False,
        allow_null=True
    )

    availableSeats = serializers.IntegerField(
        source='available_seats',
        required=False,
        allow_null=True
    )
    rules = serializers.CharField(
        required=False,
        allow_blank=True
    )

    isMatched = serializers.BooleanField(source='is_matched', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    
    class Meta:
        model = Trip
        fields = [
            'id',
            'userId',
            'userName',
            'userEmail',
            'userPhone',
            'role',
            'departureLocation',
            'arrivalLocation',
            'date',
            'arrivalTime',
            'recurrence',
            'recurringDays',
            'availableSeats',
            'rules',
            'isMatched',
            'createdAt',
        ]
        read_only_fields = [
            'id',
            'userId',
            'userName',
            'userEmail',
            'userPhone',
            'isMatched',
            'createdAt',
        ]
    
    def get_userName(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip()
    
    def validate(self, attrs):
        """
        Validazione logica:
        - se role è driver/both → available_seats obbligatorio e > 0
        - se recurrence è custom → recurring_days non vuoto
        """
        role = attrs.get('role', getattr(self.instance, 'role', None))
        available_seats = attrs.get(
            'available_seats',
            getattr(self.instance, 'available_seats', None)
        )
        recurrence = attrs.get(
            'recurrence',
            getattr(self.instance, 'recurrence', None)
        )
        recurring_days = attrs.get(
            'recurring_days',
            getattr(self.instance, 'recurring_days', None)
        )

        is_driver = role in ['driver', 'both']

        if is_driver:
            if available_seats is None:
                raise serializers.ValidationError({
                    'availableSeats': 'Per i conducenti è obbligatorio indicare il numero di posti disponibili.'
                })
            if available_seats <= 0:
                raise serializers.ValidationError({
                    'availableSeats': 'Il numero di posti deve essere maggiore di 0.'
                })
        else:
            if 'available_seats' in attrs:
                attrs['available_seats'] = None
            if 'rules' in attrs:
                attrs['rules'] = ''

        if recurrence == 'custom':
            if not recurring_days:
                raise serializers.ValidationError({
                    'recurringDays': 'Per la ricorrenza personalizzata devi indicare almeno un giorno.'
                })

        return attrs
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
