from django.shortcuts import render, redirect
from django.contrib.auth import login
from django.contrib.auth.models import User
from .forms import LoginForm, RegisterForm
from datetime import timedelta





def LoginView(request):
    
    if request.user.is_authenticated:
        return redirect("core:home")
    
    if request.method == "POST":
    
        form = LoginForm(request.POST)
        
        if form.is_valid():
            
            user = form.user
            login(request, user)
            
            if form.cleaned_data["remember_me"]:
                request.session.set_expiry(int(timedelta(days=30).total_seconds()))
                
            else:
                request.session.set_expiry(0)

            if user.is_staff:
                return redirect("/admin/")

            
            return redirect("core:home")
    else :
        form = LoginForm()
    register_form = RegisterForm()
    return render(request, "accounts/login.html", {"form":form, "register_form":register_form, "active_tab":"signin"})


def RegisterView(request):
    
    
    if request.method == "POST":
        
        register_form = RegisterForm(request.POST)
        
        if register_form.is_valid():
            
            username = form.cleaned_data.get("username")
            email = form.cleaned_data.get("email")
            password = form.cleaned_data.get("password")
            
            user=User.objects.create_user(username=username, email=email, password=password)
            login (request, user)
            return redirect("core:home")
    else:
        
        register_form = RegisterForm()
        
    form = LoginForm()
        
    return render(request, "accounts/login.html", {"register_form":register_form, "form":form, "active_tab":"signup"})