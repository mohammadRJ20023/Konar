from django.shortcuts import render , get_object_or_404
from .models import Category, Article
from django.core.paginator import Paginator



def Article_List_View(request):
    
    category = Category.objects.all()
    article = Article.objects.all()
    popular_articles = Article.objects.order_by("-view_count")[:3]
    page_number = request.GET.get('page')
    paginator = Paginator(article, 7)
    page_obj = paginator.get_page(page_number)
    
    return render(request, "blog/blog_list.html", context={
        "categories":category, 
        "articles":page_obj,  
        "popular_articles":popular_articles,
        })

def Article_Detail_View(request, slug):
    
    article = get_object_or_404(Article, slug=slug)
    article.view_count += 1
    article.save(update_fields=["view_count"])
    popular_articles = Article.objects.order_by("-view_count")[:3]
    category = Category.objects.all()
    
    return render(request, 'blog/blog_detail.html', context={'article':article, "categories":category, "popular_articles":popular_articles, })
    