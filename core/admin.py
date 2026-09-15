from django.contrib import admin
from .models import AppStat


@admin.register(AppStat)
class AppStatsAdmin(admin.ModelAdmin):
    list_display = ("title", "user_count", "song_count", "genre_count", "artist_count")
