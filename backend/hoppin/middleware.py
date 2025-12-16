# hoppin/middleware.py
class LogRequestMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        print(">>> PATH:", request.path)
        response = self.get_response(request)
        return response
