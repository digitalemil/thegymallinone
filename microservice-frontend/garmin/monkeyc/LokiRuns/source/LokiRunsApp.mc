using Toybox.Application;
using Toybox.WatchUi;
using Toybox.Sensor;
using Toybox.Communications;
using Toybox.WatchUi as Ui;
using Toybox.System as sys;
using Toybox.Time;
using Toybox.Time.Gregorian;


class LokiRunsApp extends Application.AppBase {

var view= null;
var hr= null;
var location= null;
var duration= new Time.Duration(1000);
var lastrequest= null;

    function initialize() {
        AppBase.initialize();
    }

    // onStart() is called on application start up
    function onStart(state) {
    	sensorInitialize();
  		initializePositionListener();
  
    }

    // onStop() is called when your application is exiting
    function onStop(state) {
    }

    // Return the initial view of your application here
    function getInitialView() {
    	view = new LokiRunsView();  	
        return [ view, new LokiRunsDelegate() ];
    }
    
    function initializePositionListener() {
    Position.enableLocationEvents( Position.LOCATION_CONTINUOUS, method( :onPosition ) );
}

function onPosition( info ) {
	if(view != null && info.position != null) {
		location = info.position.toDegrees();
		view.updateLocation(location[0], location[1]);
		makeRequest();
	}	
}

function sensorInitialize() {
    Sensor.setEnabledSensors([Sensor.SENSOR_HEARTRATE]);
    Sensor.enableSensorEvents(method(:onSensor));
}

function onSensor(sensorInfo) {
	hr= sensorInfo.heartRate;
  //  hr=123;
	if(view != null && hr!= null) {
	 	view.updateHR(hr);
	 	makeRequest();
	 }
}


   function makeRequest() {
    var now=  Time.now();
    
    if(lastrequest!= null && now.compare(lastrequest)<1) {    	
    	return;
    }
    
    lastrequest= now;
   	var user= sys.getDeviceSettings().uniqueIdentifier; 	
    var url = "https://thegym.theblackapp.de/collect";	
    //url ="http://localhost:8008/";

	var lons=0, lats=0;
    
	if(location!= null) {
		lons= location[0];
		lats= location[1];
	}
    var logline = "{\"heartrate\":"+hr+", \"longitude\":"+lons+", \"latitude\":"+lats+", \"user\":\""+user+"\"}";
    var labels= {                                              
        "app" => "lokiruns"
    };
   
    var today = Gregorian.info(Time.now(), Time.FORMAT_SHORT);
    // 2022-07-19 13:58:00 +0000 UTC
    var m= today.month as Lang.Number;
    if(m< 10) {
        m="0"+m;
    }
    var d= today.day as Lang.Number;
    if(d< 10) {
        d="0"+d;
    }
    var h= today.hour as Lang.Number;
    if(h< 10) {
        h="0"+h;
    }
    var mi= today.min as Lang.Number;
    if(mi< 10) {
        mi="0"+mi;
    }
    var s= today.sec as Lang.Number;
    if(s< 10) {
        s="0"+s;
    }

    var dateString = Lang.format(
    "$1$-$2$-$3$T$4$:$5$:$6$Z",
        [
            today.year,
            m,
            d ,
            h,
            mi,
            s
        ]
    );
    //dateString= "2022-07-19T14:56:33Z";
    var line = {
        "message" => logline,
        "level" => "info",
        "context" => labels ,
        "timestamp"=> dateString
    };
    var logs = {
        "logs" => [line]
    };
    var key="key";

    var options = {  
        :method => Communications.HTTP_REQUEST_METHOD_POST,      
        :headers => { "Content-Type" => Communications.REQUEST_CONTENT_TYPE_JSON, "x-api-key" => key },                                                         
        :responseType => Communications.HTTP_RESPONSE_CONTENT_TYPE_URL_ENCODED
    };
    var responseCallback = method(:onReceive);      
    Communications.makeWebRequest(url, logs, options, method(:onReceive));
  }

function onReceive(responseCode, data) {
       if (responseCode == 200) {
           System.println("Request Successful");                 
       }
       else {
           System.println("Response: " + responseCode);   
           System.println(data);        
       }
   }
}
