from django.shortcuts import render



def Article_List_View(request):
    
    return render(request, "blog/blog_list.html")