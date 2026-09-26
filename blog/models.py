from django.db import models



class Category(models.Model):
    title = models.CharField(max_length=200)
    created_at = models.DateField(auto_now_add=True)
    
    def __str__(self):
        return self.title