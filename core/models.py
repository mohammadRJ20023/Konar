from django.db import models
from django.contrib.auth.models import User
from music.models import Track




class AppStat(models.Model):
    
    title = models.CharField(max_length=100, editable=False, default="App Stats")
    user_count = models.PositiveIntegerField(null=True, blank=True)
    song_count = models.PositiveIntegerField(null=True, blank=True)
    
    def save(self, *args, **kwargs):
        if self.user_count is None or self.song_count is None:
            self.user_count = User.objects.all().count()
            self.song_count = Track.objects.all().count()
        super(AppStat, self).save()
    
    def __str__(self):
        
        return self.title