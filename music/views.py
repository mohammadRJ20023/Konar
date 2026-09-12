from django.shortcuts import render, get_object_or_404
from .models import Track




def Track_Detail_View(request, slug):
    
    track = get_object_or_404(Track, slug=slug)
    track.play_count += 1
    track.save(update_fields=["play_count"])
    
    return render(request, "music/track_detail.html", {"track":track})
