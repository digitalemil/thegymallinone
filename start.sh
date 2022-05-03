#!/bin/bash
cd /opt/app

node /opt/app/microservice-messagetransformer/bin/www &
sleep 2
node /opt/app/microservice-messagevalidator/bin/www &
sleep 2
/opt/tomcat/bin/catalina.sh start
sleep 2
node /opt/app/microservice-messagelistener/bin/www &
sleep 2
node /opt/app/microservice-ui/bin/www &
sleep 2
node /opt/app/microservice-frontend/bin/www &
sleep 2
#node /opt/app/microservice-loadgenerator/bin/www &
sleep 2

/bin/agent --config.file=/opt/app/agent-config.yaml &
tail -f /dev/null


