from django.urls import path
from .import views


app_name = 'music'

urlpatterns = [
    path("detail/<slug:slug>", views.Track_Detail_View, name="detail"),
    path("Artist/<slug:slug>", views.Artist_Detail_View, name ="artist"),
    path("traks", views.Track_List_View.as_view(), name="list"),
    path("albums", views.Album_List_View.as_view(),name="album_list"),
    path("album/<slug:slug>", views.Album_detail_View, name ="album_detail"),
    
]
