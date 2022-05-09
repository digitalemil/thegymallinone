package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"math/rand"
	"net/http"
	"os"
	"strconv"
	"time"
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

	http.HandleFunc("/", logit)

	log.Fatal(http.ListenAndServe(os.Getenv("HOST")+":"+os.Getenv("PORT"), nil))
}

func logit(rw http.ResponseWriter, req *http.Request) {
	body, err := ioutil.ReadAll(req.Body)
	if err != nil {
		ErrorLogger.Println("Message JSON payload: " + string(body))
		return
	}

	InfoLogger.Println("Message body: " + string(body))
	var payload interface{}
	req.Body.Close()
	err = json.Unmarshal(body, &payload)
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

	time.Sleep(time.Millisecond * time.Duration(int(mt+addon*int(rand.Float64()))))
	InfoLogger.Println("Done...")
}

func lastmessage(rw http.ResponseWriter, req *http.Request) {

}
