FROM digitalemil/thesimplegym:baseimg-thegym-allinone-v0.0.1

ENV APPDEF="{'name':'The Gym','showLocation':true,'fields':[{'name':'heartrate','pivot':true,'type':'Integer'},{'name':'user','pivot':false,'type':'String'},{'name':'deviceid','pivot':false,'type':'String'},{'name':'color','pivot':false,'type':'String'},{'name':'id','type':'Long','pivot':'false'},{'name':'location','type':'Location','pivot':'false'},{'name':'event_timestamp','type':'Date/time','pivot':'false'}],'transformer':'console.log(%22In%20%3A%20%22%2Brawtext)%3B%0Alet%20json%3D%20JSON.parse(rawtext)%3B%0Aresult%3D%20JSON.stringify(json)%3B%0Aconsole.log(%22After%20transformation%3A%20%22%2Bresult)%3B%0A%09%09%09%09%09%0A%09%09%09%09%09','topic':'hr','table':'hr','keyspace':'thegym','path':'thegym','creator':'http://localhost:3000'}"
ENV MESSAGE_TRANSFORMER=http://127.0.0.1:3032
ENV MESSAGE_VALIDATOR=http://127.0.0.1:3033
ENV PMML_EVALUATOR=http://127.0.0.1:8080
ENV LISTENER=http://127.0.0.1:3034
ENV DOMAIN=http://127.0.0.1:3034

COPY microservice-pmmlevaluator/target/PMMLEvalService-0.0.1.war /opt/tomcat/webapps/ROOT.war

COPY microservice-loadgenerator /opt/app/microservice-loadgenerator
RUN cd /opt/app/microservice-loadgenerator; npm install

COPY microservice-messagelistener /opt/app/microservice-messagelistener
RUN cd /opt/app/microservice-messagelistener; npm install

COPY microservice-messagetransformer /opt/app/microservice-messagetransformer
RUN cd /opt/app/microservice-messagetransformer; npm install

COPY microservice-messagevalidator /opt/app/microservice-messagevalidator
RUN cd /opt/app/microservice-messagevalidator; npm install

COPY microservice-ui /opt/app/microservice-ui
RUN cd /opt/app/microservice-ui; npm install

COPY microservice-frontend/bin /opt/app/microservice-frontend/bin
COPY microservice-frontend/public /opt/app/microservice-frontend/public
COPY microservice-frontend/routes /opt/app/microservice-frontend/routes
COPY microservice-frontend/views /opt/app/microservice-frontend/views
COPY microservice-frontend/app.js /opt/app/microservice-frontend/
COPY microservice-frontend/passwd.json /opt/app/microservice-frontend/
COPY microservice-frontend/config.json /opt/app/microservice-frontend/
COPY microservice-frontend/package.json /opt/app/microservice-frontend/
RUN cd /opt/app/microservice-frontend; npm install

COPY agent-config.yaml /opt/app/

COPY start.sh /opt/app

ENTRYPOINT /opt/app/start.sh