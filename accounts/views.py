from django.shortcuts import render, redirect
from django.contrib.auth import login
from .forms import LoginForm





def LoginView(request):
    
    if request.user.is_authenticated:
        redirect("core:home")
    
    if request.method == "POST":
    
        form = LoginForm(request.POST)
        
        if form.is_valid():
            
            user = form.user
            login(request, user)
            
            if form.cleaned_data["remember_me"]:
                request.session.set_expiry(
                    60 * 60 * 24 * 30
                )
            else:
                request.session.set_expiry(0)

            if user.is_staff:
                return redirect("/admin/")

            
            return redirect("core:home")
    else :
        form = LoginForm()
    return render(request, "accounts/login.html", {"form":form})
