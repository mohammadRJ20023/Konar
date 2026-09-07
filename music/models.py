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