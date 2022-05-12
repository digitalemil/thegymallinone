export APPDEF="{'name':'The Gym','showLocation':true,'fields':[{'name':'heartrate','pivot':true,'type':'Integer'},{'name':'user','pivot':false,'type':'String'},{'name':'deviceid','pivot':false,'type':'String'},{'name':'color','pivot':false,'type':'String'},{'name':'id','type':'Long','pivot':'false'},{'name':'location','type':'Location','pivot':'false'},{'name':'event_timestamp','type':'Date/time','pivot':'false'}],'transformer':'console.log(%22In%20%3A%20%22%2Brawtext)%3B%0Alet%20json%3D%20JSON.parse(rawtext)%3B%0Aresult%3D%20JSON.stringify(json)%3B%0Aconsole.log(%22After%20transformation%3A%20%22%2Bresult)%3B%0A%09%09%09%09%09%0A%09%09%09%09%09','topic':'hr','table':'hr','keyspace':'thegym','path':'thegym','creator':'http://localhost:3000'}"
export MESSAGE_TRANSFORMER=http://127.0.0.1:3032
export MESSAGE_VALIDATOR=http://127.0.0.1:3033
export PMML_EVALUATOR=http://127.0.0.1:8080
export LISTENER=http://127.0.0.1:3034
export DOMAIN=http://127.0.0.1:3034
export OUT1=http://127.0.0.1:3036
export OUT2=$LISTENER
export HOST=0.0.0.0
export MINTIME=1000
export TIMEADDON=1000
export LOGFILE=/opt/app/logs/microservice-messagelogger/logs.txt


nodemon microservice-messagetransformer/bin/www &
nodemon microservice-messagevalidator/bin/www &
nodemon microservice-messagelistener/bin/www &
cd /opt/app/microservice-messagelogger
export PORT=3036
./logger &
cd ..

cd microservice-Messageduplicator
gunicorn --log-file=- --bind 0.0.0.0:3037 MessageDuplicator.wsgi &
cd ..

sleep 4

nodemon microservice-frontend/bin/www &

sleep 4

nodemon microservice-loadgenerator/bin/www
