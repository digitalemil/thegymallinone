export GOOS=linux
export GOARCH=amd64
go get github.com/prometheus/client_golang/prometheus
go get github.com/prometheus/client_golang/prometheus/promauto
go get github.com/prometheus/client_golang/prometheus/promhttp
go get github.com/zsais/go-gin-prometheus
go get -u github.com/gin-gonic/gin
go get go.opentelemetry.io/otel 
go get go.opentelemetry.io/otel/trace
go get go.opentelemetry.io/otel/sdk 
go get go.opentelemetry.io/otel/exporters/stdout/stdouttrace
go get -u go.opentelemetry.io/otel/exporters/otlp/otlptrace
go get go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc
go get go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin
go get go.opentelemetry.io/otel/propagation
go build logger.go
mv logger logger-x64
export GOOS=
export GOARCH=
go build logger.go

