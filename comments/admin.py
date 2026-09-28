from django.contrib import admin
from .models import Comment



@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    
    list_display = ('user', 'parent', 'content_type', 'object_id', 'created_at',)
