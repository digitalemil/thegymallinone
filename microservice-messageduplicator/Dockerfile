FROM digitalemil/mypublicrepo:centos7python36u
COPY . /opt/app
ENV DEBUG=
ENTRYPOINT cd /opt/app; gunicorn --log-file=- --bind 0.0.0.0:$PORT0 MessageDuplicator.wsgi
