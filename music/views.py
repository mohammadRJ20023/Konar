from django.shortcuts import render, get_object_or_404
from .models import Track, Artist




def Track_Detail_View(request, slug):
    
    track = get_object_or_404(Track, slug=slug)
    track.play_count += 1
    track.save(update_fields=["play_count"])
    
    return render(request, "music/track_detail.html", {"track":track})


def Artist_Detail_View(request, slug):
    
    artist = get_object_or_404(Artist.objects.prefetch_related("tracks", "albums"), slug=slug)
    
    context = {
        "artist": artist,
        "tracks": artist.tracks.all(),
        "albums": artist.albums.all()
    }
    
    return render(request, "music/artist_detail.html", context)

def Track_List_View(request):
    
    
    return render(request, "music/track_list.html")
