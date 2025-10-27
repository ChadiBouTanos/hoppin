from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    # Frontend expects these exact field names
    firstName = serializers.CharField(source='first_name', read_only=True)
    lastName = serializers.CharField(source='last_name', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'firstName', 'lastName', 'phone', 'whatsapp_consent', 'is_admin']
        read_only_fields = ['id', 'is_admin']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    # Frontend sends camelCase
    firstName = serializers.CharField(source='first_name', write_only=True)
    lastName = serializers.CharField(source='last_name', write_only=True)
    whatsappConsent = serializers.BooleanField(source='whatsapp_consent', write_only=True, required=False)
    
    class Meta:
        model = User
        fields = ['email', 'password', 'firstName', 'lastName', 'phone', 'whatsappConsent']
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'],  # Use email as username
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            phone=validated_data.get('phone', ''),
            whatsapp_consent=validated_data.get('whatsapp_consent', False)
        )
        return user

class LoginResponseSerializer(serializers.Serializer):
    """Format the login response to match frontend expectations"""
    id = serializers.IntegerField()
    email = serializers.EmailField()
    firstName = serializers.CharField()
    lastName = serializers.CharField()
    phone = serializers.CharField()
    isAdmin = serializers.BooleanField()
    whatsappConsent = serializers.BooleanField()
    token = serializers.CharField()