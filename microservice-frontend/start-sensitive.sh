/Users/emil/bin/agent-darwin-arm64 -config.file ./loki-agent-config.yaml  >/Users/emil/tmp/grafana-agent.log 2>&1 &
export NOLISTENER=true
./localstart.sh >/Users/emil/tmp/microservice-frontend.log  2>&1 &

echo create load by executing:
echo "cd ../k6; ./sensitive.sh"

