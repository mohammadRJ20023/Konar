from django.urls import path, include
from . import views



app_name = 'blog'
urlpatterns = [
    path("list", views.Article_List_View, name="list"),
    path('detail', views.Article_Detail_View, name="detail")
]
