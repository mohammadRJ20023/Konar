from django.db import models
from django.utils.text import slugify
from mutagen import File as MutagenFile



class Genre(models.Model):
    name = models.CharField(max_length=100 , unique=True)
    slug = models.SlugField(unique=True, blank=True , allow_unicode=True)
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name , allow_unicode=True)
        super(Genre, self).save()
    
    def __str__(self):
        
        return self.name
    
class Artist(models.Model):
    name = models.CharField(max_length=200, null=False, blank=False)
    bio = models.TextField(blank=False, null=False)
    image = models.ImageField(upload_to="images/Artists", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    slug = models.SlugField(unique=True, blank=True, allow_unicode=True)
    
    def save(self, *args, **kwargs):
        if not self.slug:
                    self.slug = slugify(self.name , allow_unicode=True)
        super(Artist, self).save()
        
    def __str__(self):
        return self.name

class Album(models.Model):
    title = models.CharField(max_length=200)
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE, related_name="albums")
    cover = models.ImageField(upload_to="images/Album")  
    release_date = models.DateField(null=True , blank=True)
    created_at = models.DateTimeField(auto_now_add=True) 
    slug = models.SlugField(unique=True, blank=True)
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.title}-{self.artist.name}" , allow_unicode=True)
        super(Album, self).save()    
    
    def __str__(self):
            return f"{self.title} - {self.artist.name}" 
    
    class Meta:
        
        ordering= ["-created_at"]
        

class Track(models.Model):
    title = models.CharField(max_length=500)
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE, related_name="songs")
    album = models.ForeignKey(Album, on_delete=models.SET_NULL, blank=True, null=True, related_name="songs")
    genre = models.ManyToManyField(Genre, related_name="songs")
    lyrics = models.TextField(null=True, blank=True)
    audio_file = models.FileField(null=False, blank=False, upload_to="songs/")
    cover = models.ImageField(null=False, blank=False, upload_to="images/Songs")
    duration = models.PositiveIntegerField(blank=True, null=True, editable=False)
    release_date = models.DateField(null=True, blank=True)
    play_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    slug = models.SlugField(blank=True,unique=True, allow_unicode=True)
    
    def save(self, *args, **kwargs):
        if not self.slug :
            self.slug = slugify(self.title, allow_unicode=True)
        super().save(*args, **kwargs)
        if self.audio_file and not self.duration:
            audio = MutagenFile(self.audio_file.path)
            if audio is not None and audio.info:
                self.duration = int(audio.info.length)
                super().save(update_fields=['duration'])
          
    
    def duration_display(self):
        
        if self.duration :
            minutes = self.duration // 60
            seconds = self.duration % 60
            return f"{minutes}:{seconds:02d}"    
        return "-"    
        
    def __str__(self):
        return f"{self.title} - {self.artist.name}"