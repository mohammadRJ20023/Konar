from django.shortcuts import render
from music.models import Track, Genre, Album





def HomeView(request):
    
    music = Track.objects.order_by('-play_count')[:5]
    albums = Album.objects.order_by('-created_at')
    genre = Genre.objects.all()
    
    return render(request, "core/home.html", {"music":music, "genre":genre, "albums": albums})