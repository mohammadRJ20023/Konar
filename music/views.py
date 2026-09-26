from django.shortcuts import render, get_object_or_404
from .models import Track, Artist, Album
from core.models import AppStat
from django.views.generic import ListView



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

def Album_detail_View(reqeust, slug):
    
    album = get_object_or_404(Album.objects.prefetch_related("tracks"), slug=slug)
    context ={
        "album":album,
        "tracks": album.tracks.all()
    }
    
    return render(reqeust, "music/album_detail.html", context)

class Track_List_View(ListView):
    
    model = Track
    template_name = "music/track_list.html"
    paginate_by = 15
    queryset = Track.objects.all()
    context_object_name = "tracks"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["app_stats"]= AppStat.objects.first()
        return context
class Album_List_View(ListView):
    model = Album
    template_name = "music/album_list"
    paginate_by = 15
    queryset = Album.objects.all()
    context_object_name = "albums"
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["app_stats"] = AppStat.objects.first()
        return context
    
