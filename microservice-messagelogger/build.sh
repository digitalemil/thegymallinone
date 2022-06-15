export GOOS=linux
export GOARCH=amd64
go get github.com/prometheus/client_golang/prometheus
go get github.com/prometheus/client_golang/prometheus/promauto
go get github.com/prometheus/client_golang/prometheus/promhttp
go get github.com/zsais/go-gin-prometheus
go get -u github.com/gin-gonic/gin
go build logger.go
mv logger logger-x64
