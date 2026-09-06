from django.urls import path
from .import views

app_name = "accounts"

urlpatterns = [
    path("login", views.LoginView , name = "login"),
    path("register", views.RegisterView, name="register")
]