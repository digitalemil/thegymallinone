import os
import requests
import sys
import json
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.csrf import ensure_csrf_cookie
import logging
logger = logging.getLogger(__name__)
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

# Create your views here.
from django.http import HttpResponse

def errorfunction(error1, error2):
    logger.error(str(error1)+" "+str(error2))

@require_http_methods(["GET"])
def index(request):
    return HttpResponse("Ok")

@require_http_methods(["POST"])
@csrf_exempt
def work(request):
  body = request.body.decode("utf-8")
  logger.info("Work, body: " + body)
  logger.info("Work, headers: " + str(request.headers))
  headers = {'Content-type': 'application/json'}
  with tracer.start_as_current_span("duplicator-targets"):
    rs1 = requests.post(os.environ["DUPPLICATOR_OUT1"], data=body, headers=request.headers)
    rs2 = requests.post(os.environ["DUPPLICATOR_OUT2"], data=body, headers=request.headers)

  s= 200
  if rs1.status_code!= 200 or rs2.status_code!= 200:
    s= 503
  if s == 200:
    logger.info("Message duplicated.")
  else:
    logger.error("Message NOT duplicated: "+rs1.status_code+" "+rs2.status_code)
  return HttpResponse("OK", status= s)

