docker run -e OUT1=http://127.0.0.1:8081 -e OUT2=http://127.0.0.1:8082 -e DEBUG=True -e PORT0=8090 -p 8090:8090 digitalemil/mypublicrepo:MessageDuplicator
curl -XPOST -d '{"foo":"bar", "obj":{ "zwei":3}}' localhost:8090/work
curl -XPOST -d '{"foo":"bar", "obj":{ "zwei":3}}' messageduplicator.marathon.l4lb.thisdcos.directory:8000/work
python -u postserver.py $PORT0