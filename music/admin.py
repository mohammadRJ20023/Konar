from django.contrib import admin
from .models import Genre, Artist, Album, Song



admin.site.register(Genre)
admin.site.register(Artist)
admin.site.register(Album)

@admin.register(Song)
class SonAdmin(admin.ModelAdmin):
    list_display = ("title","artist","album","duration_display","play_count","created_at","slug",)

    readonly_fields = ("duration","created_at",)

   