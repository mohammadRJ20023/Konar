from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
from music.models import Track



class Category(models.Model):
    title = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title
    

class Article(models.Model):
    
    title = models.CharField(max_length=500, null=False, blank=False)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.ForeignKey(Category ,on_delete=models.SET_NULL, null=True, blank=True, related_name="articles")
    body = models.TextField()
    track =models.ForeignKey("music.Track", on_delete=models.CASCADE, null=True)
    quotes = models.TextField(null=True, blank=True)
    image = models.ImageField(upload_to='images/blog')
    created_at = models.DateTimeField(auto_now_add=True)
    view_count = models.PositiveBigIntegerField(default=0)
    reading_time = models.PositiveBigIntegerField(default=0)
    is_featured  = models.BooleanField(default=False)
    slug = models.SlugField(blank=True, null=True, allow_unicode=True)
    
    def save(self, *args, **kwargs):
            if not self.slug :
                self.slug = slugify(self.title, allow_unicode=True)
            super(Article, self).save()                
    def __str__(self):
        return self.title
    