#!/bin/bash

export DOCKERHUB_USER=digitalemil
export DOCKERHUB_REPO=thesimplegym
export VERSION=0.0.1


#docker build -f BaseDockerfile --platform=linux/amd64 -t $DOCKERHUB_USER/$DOCKERHUB_REPO:baseimg-thegym-allinone-v$VERSION .
#docker push $DOCKERHUB_USER/$DOCKERHUB_REPO:baseimg-thegym-allinone-v$VERSION 

#cd microservice-pmmlevaluator
#mvn -DskipTests=true package
#cd ..

docker build --platform=linux/amd64 -t $DOCKERHUB_USER/$DOCKERHUB_REPO:thegym-allinone-v$VERSION .
docker tag $DOCKERHUB_USER/$DOCKERHUB_REPO:thegym-allinone-v$VERSION eu.gcr.io/thegym-263112/thegym-allinone-v0.0.1:latest
docker push eu.gcr.io/thegym-263112/thegym-allinone-v0.0.1:latest
