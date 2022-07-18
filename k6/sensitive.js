let SanFrancisco = 0, PaloAlto = 1, Sheridan = 2, SanDiego = 3, Jackson = 4, Chicago = 5, Boston = 6, LosAngeles = 7, Rome = 8, London = 9, Moscow = 10, Paris = 11;
let locations = ["37.775,-122.4183333", "37.4419444,-122.1419444", "44.7694,-106.969", "32.7152778,-117.1563889", "43.479929,-110.762428", "41.850033,-87.6500523", "42.3584308,-71.0597732", "34.0522342,-118.2436849", "41.9015141,12.4607737", "51.536086,-0.131836", "55.751849,37.573242", "48.864715,2.329102"];
let names = ["Flo", "Tobi", "Ben", "Travis", "James", "Tim", "Jamie", "Tony", "Joerg", "Jan", "Ferdi", "John"];
let devices = ["16380", "14321", "15121", "17445", "12444", "16453", "19201", "20452", "21345", "13896", "22783", "23999"];
let hrs = [120, 140, 90, 110, 150, 130, 100, 160, 130, 140, 150, 120];

let SERVER= "http://localhost:3000"

import http from 'k6/http';
import exec from 'k6/execution';
import { sleep } from 'k6';

export default function () {
    let url= getURL((exec.vu.idInTest-1)%10);
    http.get(url);
    console.log(url)
    sleep(2);   
};


function getURL(i) {
    let d = new Date();
    let day = d.getUTCDate();
    let daystring = "" + day;

    if (day < 10)
        daystring = "0" + daystring;
    let month = d.getUTCMonth() + 1;
    let monthstring = "" + month;
    if (month < 10)
        monthstring = "0" + monthstring;

    let hour = d.getUTCHours();
    let hourstring = "" + hour;
    if (hour < 10)
        hourstring = "0" + hourstring;

    let minute = d.getUTCMinutes();
    let minutestring = "" + minute;
    if (minute < 10)
        minutestring = "0" + minutestring;

    let second = d.getUTCSeconds() + d.getUTCMilliseconds() / 1000.0;
    let secondstring = "" + second;
    if (second < 10)
        secondstring = "0" + secondstring


    let time = d.getFullYear() + "-" + monthstring + "-" + daystring + "T" + hourstring + ":" + minutestring + ":" + secondstring + "Z";
    let id = d.getTime();

    let bpm = Math.floor(hrs[i] - 10 + Math.random() * 20);
    return SERVER+"/data/load?password=adjhaADbdhY7nkjdasd7y72GUG7cFv6&id="+(id + i)+"&color=0x80FFFFFF&location="+locations[i]+"&event_timestamp="+time+"&deviceid="+devices[i]+"&name="+names[i]+"&heartrate="+bpm;
}

