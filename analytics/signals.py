from django.contrib.auth.signals import user_logged_in, user_logged_out

from django.dispatch import receiver

from .models import UserActivity

@receiver(user_logged_in)
def user_login(sender, request, user, **kwargs ):
    
    ip = request.META.get("REMOTE_ADDR")

    
    UserActivity.objects.create(user=user, action="login", ip = ip)
    
    
@receiver(user_logged_out)
def user_logout(sender, request, user, **kwargs):
    
    ip = request.META.get("REMOTE_ADDR")

    UserActivity.objects.create(user=user, action="logout", ip = ip)
    