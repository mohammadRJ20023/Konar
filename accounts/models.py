from django.db import models
from django.contrib.auth.models import User

# Create your models here.


class Profile(models.Model):
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    avatar = models.ImageField(upload_to="Profile/avatar", blank=True, null=True)
    phone_number = models.CharField(max_length=11, blank=False, null=False)
    
    def __str__(self):
        return self.user.username
    