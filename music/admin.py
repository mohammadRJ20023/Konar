from django.contrib import admin
from .models import Genre, Artist, Album, Track



admin.site.register(Genre)
admin.site.register(Artist)
admin.site.register(Album)

@admin.register(Track)
class TrackAdmin(admin.ModelAdmin):
    list_display = ("title","artist","album","duration_display","play_count","created_at","slug",)

    readonly_fields = ("duration","created_at",)

   