package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"strconv"
	"time"
	"context"
	"io"

	"github.com/gin-gonic/gin"
	"github.com/zsais/go-gin-prometheus"
	"go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/semconv/v1.10.0"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
//	"go.opentelemetry.io/otel/trace"
    "go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace"
	"go.opentelemetry.io/otel/exporters/stdout/stdouttrace"
    sdktrace "go.opentelemetry.io/otel/sdk/trace"
	"go.opentelemetry.io/otel/sdk/resource"
)
const name = "thegym-logger"

var (
	WarningLogger *log.Logger
	InfoLogger    *log.Logger
	ErrorLogger   *log.Logger
	LastMessage   string
	n int64
)

func main() {

	file, err := os.OpenFile(os.Getenv("LOGGER_LOGFILE"), os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0666)
	if err != nil {
		log.Fatal(err)
	}
	InfoLogger = log.New(file, "INFO: ", log.Ldate|log.Ltime|log.Lshortfile)
	WarningLogger = log.New(file, "WARNING: ", log.Ldate|log.Ltime|log.Lshortfile)
	ErrorLogger = log.New(file, "ERROR: ", log.Ldate|log.Ltime|log.Lshortfile)

	fmt.Println("Logger starting...")
	InfoLogger.Println("Logger starting...")

	r := gin.Default()
	r.Use(otelgin.Middleware("microservice-messagelogger"))
	r.Static("/public", "./public")
	r.LoadHTMLGlob("templates/*")
	r.GET("/index", home)
	r.GET("/index.html", home)
	r.GET("/home", home)
	r.GET("/", home)

	p := ginprometheus.NewPrometheus("gin")
	p.Use(r)

	ctx := context.Background()
	// Registers a tracer Provider globally.
	shutdown, err := installExportPipeline(ctx)
	if err != nil {
		log.Fatal(err)
	}
	defer func() {
		if err := shutdown(ctx); err != nil {
			log.Fatal(err)
		}
	}()
	/* Write telemetry data to a file.
	f, err := os.Create("traces.txt")
	if err != nil {
		log.Fatal(err)
	}
	defer f.Close()

	exp, err := newExporter(f)
	if err != nil {
		log.Fatal(err)
	}
	*/
	/*
	tp := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(exp),
		sdktrace.WithResource(newResource()),
	)
	defer func() {
		if err := tp.Shutdown(context.Background()); err != nil {
			log.Fatal(err)
		}
	}()
	otel.SetTracerProvider(tp)
*/
	otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(propagation.TraceContext{}, propagation.Baggage{}))
	r.POST("/", func(c *gin.Context) {
		jsonData, err := c.GetRawData()
		//_, span := otel.Tracer(name).Start(c, "log")
		if err != nil {
			ErrorLogger.Println("No raw data: " + fmt.Sprint((err)))
		//	span.End()
		}
		savedContext := c.Request.Context()
		logit(savedContext, string(jsonData))
		//span.End()
		rt, _ := strconv.Atoi(os.Getenv("LOGGER_RETURNCODE"))
		if rt != 0 {
			c.Writer.WriteHeader(rt)
		}
		InfoLogger.Println(c.Request.Header)
	})
//	r.GET("/metrics", prometheusHandler())
	host := os.Getenv("LOGGER_HOST")
	port := os.Getenv("LOGGER_PORT")
	
	log.Fatal(r.Run(host + ":" + port))
}

func home(c *gin.Context) {
	_, span := otel.Tracer(name).Start(c, "home")
	c.HTML(http.StatusOK, "home.tmpl", gin.H{
		"title":       "Microservice Messagelogger",
		"lastMessage": LastMessage,
	})
	defer span.End()
}

func logit(c context.Context, text string) {
	n++;
	newCtx, span := otel.Tracer(name).Start(c, "logit")
	defer span.End();
	span.SetAttributes(attribute.String("n (Number of Log entries)", strconv.FormatInt(n, 10)))
	t := span.SpanContext().TraceID().String()
	InfoLogger.Println("Message body: traceID:" + t)
	var payload interface{}
	err := json.Unmarshal([]byte(text), &payload)
	if err != nil {
		ErrorLogger.Println("Unmarshall error: " + fmt.Sprint((err))+" traceID:" + t)
		return
	}
	InfoLogger.Println("Converting to json map. traceID:" + t)
	m := payload.(map[string]interface{})
	InfoLogger.Println("Message map: " + fmt.Sprint(m))
	InfoLogger.Println("Start marshalling")
	jsonString, err := json.Marshal(m)
	if err != nil {
		ErrorLogger.Println("Message JSON payload: " + fmt.Sprint((err))+" traceID:" + t)
		return
	}

	InfoLogger.Println("Marshalling done. Message map: " + fmt.Sprint(m)+" traceID:" + t)

	execute(newCtx, m)
	LastMessage = string(jsonString)
	InfoLogger.Println("Message json payload: " + string(jsonString)+" traceID:" + t)
}

func execute(c context.Context, json map[string]interface{}) {
	_, span := otel.Tracer(name).Start(c, "execute")
	defer span.End();
	t := span.SpanContext().TraceID().String()
	InfoLogger.Println("Executing workload..."+" traceID:" + t)
	mt, _ := strconv.Atoi(os.Getenv("LOGGER_MINTIME"))
	addon, _ := strconv.Atoi(os.Getenv("LOGGER_TIMEADDON"))

	now := time.Now().UnixNano() / int64(time.Millisecond)
	time.Sleep(time.Millisecond * time.Duration(int(mt+int(float64(addon)*rand.Float64()))))
	after := time.Now().UnixNano() / int64(time.Millisecond)
	span.SetAttributes(attribute.String("Execution time (in ms)", strconv.FormatInt(after-now,10)))

	InfoLogger.Println("Done... " + strconv.FormatInt(after-now, 10) + " ms."+" traceID:" + t)
}

func prometheusHandler() gin.HandlerFunc {
	h := promhttp.Handler()

	return func(c *gin.Context) {
		h.ServeHTTP(c.Writer, c.Request)
	}
}

// newExporter returns a console exporter.
func newExporter(w io.Writer) (sdktrace.SpanExporter, error) {
	return stdouttrace.New(
		stdouttrace.WithWriter(w),
		// Use human-readable output.
		stdouttrace.WithPrettyPrint(),
		// Do not print timestamps for the demo.
		stdouttrace.WithoutTimestamps(),
	)
}

// newResource returns a resource describing this application.
func newResource() *resource.Resource {
	r, _ := resource.Merge(
		resource.Default(),
		resource.NewWithAttributes(
			semconv.SchemaURL,
			semconv.ServiceNameKey.String(os.Getenv("LOGGER_SERVICENAME")),
			semconv.ServiceVersionKey.String(os.Getenv("v0.0.1")),
			attribute.String("environment", "demo"),
		),
	)
	return r
}

func installExportPipeline(ctx context.Context) (func(context.Context) error, error) {
	client := otlptracegrpc.NewClient()
	exporter, err := otlptrace.New(ctx, client)
	if err != nil {
		return nil, fmt.Errorf("creating OTLP trace exporter: %w", err)
	}

	tracerProvider := sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(exporter),
		sdktrace.WithResource(newResource()),
	)
	otel.SetTracerProvider(tracerProvider)

	return tracerProvider.Shutdown, nil
}