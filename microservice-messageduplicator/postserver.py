import sys
import logging
import sys

logging.basicConfig(stream=sys.stdout, level=logging.DEBUG)

from http.server import HTTPServer, BaseHTTPRequestHandler

from io import BytesIO


class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):

    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b'OK')
        sys.stderr.write("GET OK")

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        body = self.rfile.read(content_length)
        print("POST Body: "+body.decode("utf-8"))
        sys.stderr.write("POST Body: "+body.decode("utf-8"))
        self.send_response(200)
        self.end_headers()
        response = BytesIO()
      #  response.write(b'This is a POST request. ')
      #  response.write(b'Received: ')
      #  response.write(body)
        self.wfile.write(response.getvalue())

print("Listening on: "+sys.argv[1])
httpd = HTTPServer(('0.0.0.0', int(sys.argv[1])), SimpleHTTPRequestHandler)
httpd.serve_forever()
