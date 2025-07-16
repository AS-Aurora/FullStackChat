from django.shortcuts import render
from django.http import JsonResponse as JSONResponse

def ping(request):
    return JSONResponse({"message": "pong"})