from django.urls import path
from .import views


app_name = 'music'

urlpatterns = [
    path("detail/<slug:slug>", views.Track_Detail_View, name="detail")
]
