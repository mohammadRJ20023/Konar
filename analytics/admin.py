from django.contrib import admin
from .models import Visit,UserActivity




@admin.register(Visit)
class VisitAdmin(admin.ModelAdmin):
    
    list_display = ("user", "path", "ip", "device", "os", "browser", "created_at")
    
    search_fields =  ("user", "path", "ip", "device", "os", "browser")
    
    list_filter = ( "device", "os", "browser")
    
@admin.register(UserActivity)
class UserActivityAdmin(admin.ModelAdmin):

    list_display = ("user", "action", "ip", "created_at",)

    list_filter = ( "action", "created_at",)

    search_fields = ( "user__username", "ip",)