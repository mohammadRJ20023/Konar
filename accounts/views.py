from django.shortcuts import render





def LoginView(request):
    
    return render(request, "accounts/login.html", {})
