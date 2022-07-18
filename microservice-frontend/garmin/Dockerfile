FROM grafana/agent:v0.25.1

COPY lokiruns-agent-config.yaml /opt

ENTRYPOINT /bin/agent -enable-features integrations-next --config.file=/opt/lokiruns-agent-config.yaml

