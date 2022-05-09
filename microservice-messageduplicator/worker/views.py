import os
import requests
import sys
import json
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.csrf import ensure_csrf_cookie

# Create your views here.
from django.http import HttpResponse

def errorfunction(error1, error2):
    print("Error: "+str(error1)+" "+str(error2))

@require_http_methods(["GET"])
def index(request):
    return HttpResponse("Ok")

@require_http_methods(["POST"])
@csrf_exempt
def work(request):
  body = request.body.decode("utf-8")
  print("Got: " + body)
  sys.stderr.write("Got: "+body)
  rs1 = requests.post(os.environ["OUT1"], data=body)
  
  rs2 = requests.post(os.environ["OUT2"], data=body)

  s= 200
  if rs1!= 200 or rs2!= 200:
    s= 503

  return HttpResponse("OK", status= s)