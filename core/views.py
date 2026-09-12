from django.shortcuts import render
from music.models import Track, Genre





def HomeView(request):
    
    music = Track.objects.order_by('-play_count')[:5]
    genre = Genre.objects.all()
    
    return render(request, "core/home.html", {"music":music, "genre":genre})