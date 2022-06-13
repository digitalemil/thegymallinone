FROM digitalemil/thesimplegym:baseimg-thegym-allinone-v0.0.1

RUN pip3 install django-prometheus

COPY cockroach /usr/local/bin
COPY thegym.sql /

RUN mkdir -p /opt/app/microservice-pmmlevaluator
COPY microservice-pmmlevaluator/target/microservice-pmmlevaluator-0.0.1-SNAPSHOT.jar /opt/app/microservice-pmmlevaluator/
COPY microservice-pmmlevaluator/opentelemetry-javaagent.jar  /opt/app/microservice-pmmlevaluator/

RUN mkdir -p /opt/app/microservice-sqlui
COPY microservice-sqlui/target/microservice-sqlui-0.0.1-SNAPSHOT.jar /opt/app/microservice-sqlui/
COPY microservice-sqlui/opentelemetry-javaagent.jar  /opt/app/microservice-sqlui/

COPY microservice-loadgenerator /opt/app/microservice-loadgenerator
RUN cd /opt/app/microservice-loadgenerator; npm install

COPY microservice-messagelistener /opt/app/microservice-messagelistener
RUN cd /opt/app/microservice-messagelistener; npm install

COPY microservice-messagetransformer /opt/app/microservice-messagetransformer
RUN cd /opt/app/microservice-messagetransformer; npm install

COPY microservice-messagevalidator /opt/app/microservice-messagevalidator
RUN cd /opt/app/microservice-messagevalidator; npm install

COPY microservice-messagepersister /opt/app/microservice-messagepersister
RUN cd /opt/app/microservice-messagepersister; npm install

COPY microservice-frontend/bin /opt/app/microservice-frontend/bin
COPY microservice-frontend/public /opt/app/microservice-frontend/public
COPY microservice-frontend/routes /opt/app/microservice-frontend/routes
COPY microservice-frontend/views /opt/app/microservice-frontend/views
COPY microservice-frontend/app.js /opt/app/microservice-frontend/
COPY microservice-frontend/passwd.json /opt/app/microservice-frontend/
COPY microservice-frontend/config.json /opt/app/microservice-frontend/
COPY microservice-frontend/package.json /opt/app/microservice-frontend/
RUN cd /opt/app/microservice-frontend; npm install

COPY microservice-messagelogger /opt/app/microservice-messagelogger
RUN mv /opt/app/microservice-messagelogger/logger-x64 /opt/app/microservice-messagelogger/logger

COPY microservice-messageduplicator /opt/app/microservice-messageduplicator

COPY agent-config.yaml /opt/app/

COPY start.sh /opt/app

ENTRYPOINT /opt/app/start.sh