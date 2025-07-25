from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from allauth.account.models import EmailAddress
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.exceptions import TokenError


class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'detail': 'Username and password required'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=username, password=password)

        if user is None or not user.is_active:
            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not EmailAddress.objects.filter(user=user, verified=True).exists():
            return Response({'detail': 'Email address is not verified'}, status=status.HTTP_400_BAD_REQUEST)

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        response = Response({
            'refresh': str(refresh),
            'access': access_token,
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
            }
        })
        
        response.set_cookie(
            'jwt-auth',
            access_token,
            max_age=60 * 60,
            httponly=True,
            samesite='Lax',
            secure=False
        )
        
        response.set_cookie(
            'jwt-refresh-token',
            str(refresh),
            max_age=24 * 60 * 60,
            httponly=True,
            samesite='Lax',
            secure=False
        )
        
        return response

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        response = Response({"detail": "Successfully logged out."}, status=200)
        response.delete_cookie('jwt-auth')
        response.delete_cookie('jwt-refresh-token')
        return response