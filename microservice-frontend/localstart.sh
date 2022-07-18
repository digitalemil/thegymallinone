#!/bin/bash

export APPDEF="{'name':'The Gym','showLocation':true,'fields':[{'name':'heartrate','pivot':true,'type':'Integer'},{'name':'user','pivot':false,'type':'String'},{'name':'deviceid','pivot':false,'type':'String'},{'name':'color','pivot':false,'type':'String'},{'name':'id','type':'Long','pivot':'false'},{'name':'location','type':'Location','pivot':'false'},{'name':'event_timestamp','type':'Date/time','pivot':'false'}],'transformer':'console.log(%22In%20%3A%20%22%2Brawtext)%3B%0Alet%20json%3D%20JSON.parse(rawtext)%3B%0Aresult%3D%20JSON.stringify(json)%3B%0Aconsole.log(%22After%20transformation%3A%20%22%2Bresult)%3B%0A%09%09%09%09%09%0A%09%09%09%09%09','topic':'hr','table':'hr','keyspace':'thegym','path':'thegym','creator':'http://localhost:3000'}"
export MESSAGE_TRANSFORMER=http://127.0.0.1:3032
export MESSAGE_VALIDATOR=http://127.0.0.1:3033
export MESSAGE_DUPLICATOR=http://127.0.0.1:3037/work
export PMML_EVALUATOR=http://127.0.0.1:8080
export LISTENER=http://127.0.0.1:3034
export DUPPLICATOR_OUT1=http://127.0.0.1:3036
export DUPPLICATOR_OUT2=$LISTENER
export LOGGER_HOST=0.0.0.0
export LOGGER_PORT=3036
export LOGGER_MINTIME=1
export LOGGER_TIMEADDON=8
export LOGGER_LOGFILE=$HOME/tmp/logs.txt
export LOGFOLDER=$HOME/tmp
export DUPPLICATOR_OUT1=$MESSAGE_VALIDATOR
export DUPPLICATOR_OUT2=http://127.0.0.1:$LOGGER_PORT
export PORT=3000
export CONFIG='{"OAUTH2_CLIENT_ID": "510682337906-fqud8bpsm0sifcacsvacqd7ff1pc8kes.apps.googleusercontent.com","OAUTH2_CLIENT_SECRET": "Pk0WiJ7X-YVnzkw-U6ljeKbD","OAUTH2_CALLBACK": "http://localhost:3000/auth/google/callback"}'

nodemon bin/www

