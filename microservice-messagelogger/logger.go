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

	"github.com/gin-gonic/gin"
)

var (
	WarningLogger *log.Logger
	InfoLogger    *log.Logger
	ErrorLogger   *log.Logger
	LastMessage   string
)

func main() {

	file, err := os.OpenFile(os.Getenv("LOGFILE"), os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0666)
	if err != nil {
		log.Fatal(err)
	}
	InfoLogger = log.New(file, "INFO: ", log.Ldate|log.Ltime|log.Lshortfile)
	WarningLogger = log.New(file, "WARNING: ", log.Ldate|log.Ltime|log.Lshortfile)
	ErrorLogger = log.New(file, "ERROR: ", log.Ldate|log.Ltime|log.Lshortfile)

	fmt.Println("Logger starting...")
	InfoLogger.Println("Logger starting...")

	r := gin.Default()
	r.Static("/public", "./public")
	r.LoadHTMLGlob("templates/*")
	r.GET("/index", home)
	r.GET("/index.html", home)
	r.GET("/home", home)
	r.GET("/", home)

	r.POST("/", func(c *gin.Context) {
		jsonData, err := c.GetRawData()

		if err != nil {
			ErrorLogger.Println("No raw data: " + fmt.Sprint((err)))
		}
		logit(string(jsonData))
	})
	host := os.Getenv("HOST")
	port := os.Getenv("PORT")

	log.Fatal(r.Run(host + ":" + port))
}

func home(c *gin.Context) {
	c.HTML(http.StatusOK, "home.tmpl", gin.H{
		"title":       "Microservice Messagelogger",
		"lastMessage": LastMessage,
	})
}

func logit(text string) {

	InfoLogger.Println("Message body: " + text)
	var payload interface{}
	err := json.Unmarshal([]byte(text), &payload)
	if err != nil {
		ErrorLogger.Println("Unmarshall error: " + fmt.Sprint((err)))
		return
	}
	InfoLogger.Println("Converting to json map.")
	m := payload.(map[string]interface{})
	InfoLogger.Println("Message map: " + fmt.Sprint(m))
	InfoLogger.Println("Start marshalling")
	jsonString, err := json.Marshal(m)
	if err != nil {
		ErrorLogger.Println("Message JSON payload: " + fmt.Sprint((err)))
		return
	}

	InfoLogger.Println("Marshalling done. Message map: " + fmt.Sprint(m))

	execute(m)
	LastMessage = string(jsonString)
	InfoLogger.Println("Message json payload: " + string(jsonString))
}

func execute(json map[string]interface{}) {
	InfoLogger.Println("Executing workload...")
	mt, _ := strconv.Atoi(os.Getenv("MINTIME"))
	addon, _ := strconv.Atoi(os.Getenv("TIMEADDON"))

	now := time.Now().UnixMilli()
	time.Sleep(time.Millisecond * time.Duration(int(mt+int(float64(addon)*rand.Float64()))))
	after := time.Now().UnixMilli()

	InfoLogger.Println("Done... " + strconv.FormatInt(after-now, 10) + " ms.")
}
