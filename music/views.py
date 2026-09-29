from django.shortcuts import render, get_object_or_404, redirect
from .models import Track, Artist, Album
from comments.models import Comment
from core.models import AppStat
from comments.forms import CommentForm
from django.views.generic import ListView
from django.contrib.contenttypes.models import ContentType



def Track_Detail_View(request, slug):
    
    track = get_object_or_404(Track, slug=slug)
    track.play_count += 1
    track.save(update_fields=["play_count"])
    
    track_type = ContentType.objects.get_for_model(Track)
    
    
    if request.method == "POST":
        form = CommentForm(request.POST)
        parent_id = request.POST.get("parent")
        if form.is_valid():
            body = form.cleaned_data.get("body")
            
            comments =  Comment.objects.create(
                    user = request.user,
                    content_type = track_type,
                    object_id = track.id,
                    parent_id = parent_id or None,
                    body = body
                )
            return redirect("music:detail", slug=track.slug)       
        
    form = CommentForm()
    
    comments =  Comment.objects.filter(
        content_type = track_type,
        object_id = track.id
    ).order_by('-created_at')
    
    return render(request, "music/track_detail.html", {"track":track, 'comments':comments, 'form':form})


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
    
