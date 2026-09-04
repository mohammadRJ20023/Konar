from django.shortcuts import render





def HomeView(request):
    
    return render(request, "core/home.html", {})