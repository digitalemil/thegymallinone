#!/bin/bash

export APPDEF="{'name':'The Gym','showLocation':true,'fields':[{'name':'heartrate','pivot':true,'type':'Integer'},{'name':'user','pivot':false,'type':'String'},{'name':'deviceid','pivot':false,'type':'String'},{'name':'color','pivot':false,'type':'String'},{'name':'id','type':'Long','pivot':'false'},{'name':'location','type':'Location','pivot':'false'},{'name':'event_timestamp','type':'Date/time','pivot':'false'}],'transformer':'console.log(%22In%20%3A%20%22%2Brawtext)%3B%0Alet%20json%3D%20JSON.parse(rawtext)%3B%0Aresult%3D%20JSON.stringify(json)%3B%0Aconsole.log(%22After%20transformation%3A%20%22%2Bresult)%3B%0A%09%09%09%09%09%0A%09%09%09%09%09','topic':'hr','table':'hr','keyspace':'thegym','path':'thegym','creator':'http://localhost:3000'}"
export MESSAGE_TRANSFORMER=http://127.0.0.1:3032
export MESSAGE_VALIDATOR=http://127.0.0.1:3033
export MESSAGE_PERSISTER=http://127.0.0.1:3038/persist
export MESSAGE_DUPLICATOR=http://127.0.0.1:3037/work
export PMML_EVALUATOR=http://127.0.0.1:8080
export LISTENER=http://127.0.0.1:3034
export DUPPLICATOR_OUT1=http://127.0.0.1:3036
export DUPPLICATOR_OUT2=$LISTENER
export LOGGER_HOST=0.0.0.0
export LOGGER_PORT=3036
export LOGGER_MINTIME=1
export LOGGER_TIMEADDON=8
export LOGGER_LOGFILE=/opt/app/logs/microservice-messagelogger/logs.txt
export LOGFOLDER=/opt/app/logs
export DUPPLICATOR_OUT1=$MESSAGE_VALIDATOR
export DUPPLICATOR_OUT2=http://127.0.0.1:$LOGGER_PORT

#curl https://binaries.cockroachdb.com/cockroach-v22.1.1.linux-amd64.tgz | tar -xz &&  cp -i cockroach-v22.1.1.linux-amd64/cockroach /usr/local/bin/
cockroach start-single-node --http-addr 127.0.0.1:8088 --insecure &
sleep 8
cockroach sql -f /thegym.sql --insecure

mkdir -p /opt/app/logs/microservice-messagelistener
mkdir -p /opt/app/logs/microservice-messagetransformer
mkdir -p /opt/app/logs/microservice-messagevalidator
mkdir -p /opt/app/logs/microservice-messagepersister
mkdir -p /opt/app/logs/microservice-messagelogger
mkdir -p /opt/app/logs/microservice-pmmlevaluator
mkdir -p /opt/app/logs/microservice-sqlui
mkdir -p /opt/app/logs/microservice-frontend/
mkdir -p /opt/app/logs/microservice-messageduplicator
export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://127.0.0.1:4317
export OTEL_SERVICE_NAME=thegym-pmmlevaluator
export OTEL_TRACES_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_INSECURE=true
java -Dotel.instrumentation.jdbc-datasource.enabled=true -Dlogging.level.org.springframework.web.filter.CommonsRequestLoggingFilter=DEBUG '-Dlogging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} - %logger{36} - %msg traceID=%X{traceId} %n' -javaagent:/opt/app/microservice-pmmlevaluator/opentelemetry-javaagent.jar -jar /opt/app/microservice-pmmlevaluator/microservice-pmmlevaluator-0.0.1-SNAPSHOT.jar &
export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://127.0.0.1:4317
export OTEL_SERVICE_NAME=thegym-sqlui
export OTEL_TRACES_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_INSECURE=true
java -Dotel.instrumentation.jdbc-datasource.enabled=true -Dlogging.level.org.springframework.web.filter.CommonsRequestLoggingFilter=DEBUG '-Dlogging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} - %logger{36} - %msg traceID=%X{traceId} %n' -javaagent:/opt/app/microservice-sqlui/opentelemetry-javaagent.jar -jar /opt/app/microservice-sqlui/microservice-sqlui-0.0.1-SNAPSHOT.jar &
sleep 12
export OTEL_SERVICE_NAME=thegym-messagevalidator
node --require '/opt/app/microservice-messagevalidator/tracing.js' /opt/app/microservice-messagevalidator/bin/www &
sleep 2
export OTEL_SERVICE_NAME=thegym-messagetransformer
node --require '/opt/app/microservice-messagetransformer/tracing.js' /opt/app/microservice-messagetransformer/bin/www &
sleep 2
export OTEL_SERVICE_NAME=thegym-messagelistener
node --require '/opt/app/microservice-messagelistener/tracing.js' /opt/app/microservice-messagelistener/bin/www &
sleep 2
export DBHOST=127.0.0.1
export DBPORT=26257
export OTEL_SERVICE_NAME=thegym-messagepersister
node --require '/opt/app/microservice-messagepersister/tracing.js' /opt/app/microservice-messagepersister/bin/www &
sleep 2
export OTEL_SERVICE_NAME=thegym-frontend
node --require '/opt/app/microservice-frontend/tracing.js' /opt/app/microservice-frontend/bin/www &
sleep 2
#cd /opt/app/microservice-messageduplicator; export DEBUG=true; gunicorn --bind 0.0.0.0:3037 MessageDuplicator.wsgi &
cd /opt/app/microservice-messageduplicator; export DEBUG=true;  python3 manage.py runserver 0.0.0.0:3037 &
sleep 2
cd /opt/app/microservice-messagelogger; ./logger &

#node /opt/app/microservice-loadgenerator/bin/www &
sleep 2


/bin/agent --config.file=/opt/app/agent-config.yaml 


