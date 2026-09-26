from django.db import models
from django.contrib.auth.models import User





class Visit(models.Model):
    
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null= True, blank=True)
    ip = models.GenericIPAddressField(null=True, blank=True)
    path = models.CharField(max_length=500)
    user_agent = models.TextField(blank=True)
    browser= models.CharField(max_length=100 , null=True)
    device = models.CharField(max_length=100, null=True)
    os = models.CharField(max_length=100, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
class UserActivity(models.Model):
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    action = models.CharField(max_length=200)
    ip = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user}-{self.action}"