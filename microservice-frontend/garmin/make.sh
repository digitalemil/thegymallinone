docker build --platform=linux/amd64 -t digitalemil/mypublicrepo:lokiruns.v0.0.1 .
docker tag digitalemil/mypublicrepo:lokiruns.v0.0.1 eu.gcr.io/thegym-263112/lokiruns-v0.0.1
docker push eu.gcr.io/thegym-263112/lokiruns-v0.0.1

