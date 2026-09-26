from .models import Visit
from user_agents import parse

class MyMiddleware:
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        """
        print("========== REQUEST ==========")
        print("url:",request.path)
        print("user:",request.user)
        print("method:",request.method)
        print("IP:",request.META.get("REMOTE_ADDR"))
        print("Browser::",request.META.get("HTTP_USER_AGENT"))
        response = self.get_response(request)
        print("response:(after view)", response.status_code)
        return response"""
        IGNORED_PATHS = [
            "/favicon.ico",
            "/static/",
        ]
        if request.path in IGNORED_PATHS:
            return self.get_response(request)
        
        if request.user.is_authenticated:
            user = request.user
        else:
            user = None
        
        ip = request.META.get("REMOTE_ADDR")
        
        user_agent_string = request.META.get("HTTP_USER_AGENT")
        
        user_agent = parse(user_agent_string)
        
        Visit.objects.create(
            user=user,
            path=request.path,
            ip=ip,
            user_agent=user_agent_string,
            browser = user_agent.browser.family,
            device = user_agent.device.family,
            os = user_agent.os.family
            )
        
        response = self.get_response(request)
        return response


