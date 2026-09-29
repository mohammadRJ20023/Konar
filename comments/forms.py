from django import forms
from .models import Comment


class CommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ['body']
        widget = {
            'body':forms.TextInput(attrs={
                    "class" : "col-lg-12",
                    "placeholder" : "دیدگاه شما..."})
        }