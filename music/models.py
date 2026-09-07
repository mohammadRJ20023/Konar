from django.db import models
from django.utils.text import slugify



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
    slug = models.SlugField(unique=True, blank=True, allow_unicode=True)
    bio = models.TextField(blank=False, null=False)
    image = models.ImageField(upload_to="images/Artists", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        if not self.slug:
                    self.slug = slugify(self.name , allow_unicode=True)
        super(Artist, self).save()
        
    def __str__(self):
        return self.name

class Album(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE, related_name="albums")
    cover = models.ImageField(upload_to="images/Album")  
    release_date = models.DateField(null=True , blank=True)
    created_at = models.DateTimeField(auto_now_add=True)  
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.title}-{self.artist.name}" , allow_unicode=True)
        super(Artist, self).save()    
    
    def __str__(self):
            return f"{self.title} - {self.artist.name}" 
    
    class Meta:
        
        ordering= ["-created_at"]