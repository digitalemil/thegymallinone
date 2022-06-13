#!/bin/bash

export DOCKERHUB_USER=digitalemil
export DOCKERHUB_REPO=thesimplegym
export VERSION=0.0.1

#curl -o cockroach-v22.1.1.linux-amd64.tgz https://binaries.cockroachdb.com/cockroach-v22.1.1.linux-amd64.tgz

#docker build -f BaseDockerfile --platform=linux/amd64 -t $DOCKERHUB_USER/$DOCKERHUB_REPO:baseimg-thegym-allinone-v$VERSION .
#docker push $DOCKERHUB_USER/$DOCKERHUB_REPO:baseimg-thegym-allinone-v$VERSION 

#cd microservice-pmmlevaluator
#mvn -DskipTests=true package
#cd ..

#cd microservice-sqlui
#mvn -DskipTests=true package
#cd ..

docker build --platform=linux/amd64 -t $DOCKERHUB_USER/$DOCKERHUB_REPO:thegym-allinone-v$VERSION .
docker tag $DOCKERHUB_USER/$DOCKERHUB_REPO:thegym-allinone-v$VERSION eu.gcr.io/thegym-263112/thegym-allinone-v0.0.1:latest
docker push eu.gcr.io/thegym-263112/thegym-allinone-v0.0.1:latest
