#!/bin/bash

docker build --platform linux/amd64  -t eu.gcr.io/thegym-263112/thegym-garmin-frontend:latest .
docker push eu.gcr.io/thegym-263112/thegym-garmin-frontend:latest
