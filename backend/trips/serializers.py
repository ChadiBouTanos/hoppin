from .models import Trip, TripMatch, update_trip_matched_flags
from rest_framework import serializers

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

    flexibilityBefore = serializers.IntegerField(
        source='flexibility_before_minutes',
        required=False,
        allow_null=True
    )
    flexibilityAfter = serializers.IntegerField(
        source='flexibility_after_minutes',
        required=False,
        allow_null=True
    )

    isMatched = serializers.BooleanField(source='is_matched', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    
    class Meta:
        model = Trip
        fields = [
            'id', 'userId', 'userName', 'userEmail', 'userPhone',
            'role', 'departureLocation', 'arrivalLocation',
            'date', 'arrivalTime', 'recurrence', 'recurringDays',
            'availableSeats', 'rules',            
            'flexibilityBefore', 'flexibilityAfter', 
            'isMatched', 'createdAt',
        ]
        read_only_fields = [
            'id', 'userId', 'userName', 'userEmail', 'userPhone',
            'isMatched', 'createdAt'
        ]
    
    def get_userName(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip()
    
    def validate(self, attrs):
        """
        Validazione logica:
        - se role è driver/both → available_seats obbligatorio e > 0
        - se recurrence è custom → recurring_days non vuoto
        - se è passenger → puliamo available_seats e rules
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

class TripMatchSerializer(serializers.ModelSerializer):
    """
    Serializer minimal per la UI:
    - lato frontend lavoriamo solo con gli ID (driverTripId, passengerTripId)
    - niente Trip annidati
    """
    driverTripId = serializers.PrimaryKeyRelatedField(
        source='driver_trip',
        queryset=Trip.objects.all()
    )
    passengerTripId = serializers.PrimaryKeyRelatedField(
        source='passenger_trip',
        queryset=Trip.objects.all()
    )

    isArchived = serializers.BooleanField(source='is_archived', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = TripMatch
        fields = [
            'id',
            'driverTripId',
            'passengerTripId',
            'isArchived',
            'createdAt',
        ]
        read_only_fields = ['id', 'isArchived', 'createdAt']

    def to_representation(self, instance):
        """
        Representation finale:
        driverTripId / passengerTripId come numeri, niente oggetti annidati.
        """
        rep = super().to_representation(instance)
        # PrimaryKeyRelatedField di default rende già il PK, quindi rep['driverTripId'] è l'id
        return rep

    def validate(self, attrs):
        driver: Trip = attrs['driver_trip']
        passenger: Trip = attrs['passenger_trip']

        # 1) Ruoli coerenti
        if driver.role not in ['driver', 'both']:
            raise serializers.ValidationError("Il viaggio selezionato come driver non è un conducente.")
        if passenger.role not in ['passenger', 'both']:
            raise serializers.ValidationError("Il viaggio selezionato come passeggero non è un passeggero.")

        # 2) Driver e passenger non devono essere lo stesso trip
        if driver.id == passenger.id:
            raise serializers.ValidationError("Driver e passeggero non possono essere lo stesso viaggio.")

        # 3) capacità: rispetto available_seats
        if driver.available_seats is not None and driver.available_seats > 0:
            active_matches = TripMatch.objects.filter(
                driver_trip=driver,
                is_archived=False
            ).count()
            if active_matches >= driver.available_seats:
                raise serializers.ValidationError("Questo conducente ha già raggiunto il numero massimo di passeggeri.")

        return attrs

    def create(self, validated_data):
        match = super().create(validated_data)

        # aggiorna flag is_matched per driver+passenger
        update_trip_matched_flags([match.driver_trip_id, match.passenger_trip_id])

        return match