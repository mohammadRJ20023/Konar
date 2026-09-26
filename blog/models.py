from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify



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
    image = models.ImageField(upload_to='images/blog')
    created_at = models.DateTimeField(auto_now_add=True)
    slug = models.SlugField(blank=True, null=True, allow_unicode=True)
    
    def save(self, *args, **kwargs):
            if not self.slug :
                self.slug = slugify(self.title, allow_unicode=True)
                
    def __str__(self):
        return self.title
    