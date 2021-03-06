var MAXWIDGETS = 20;
var MAXXWIDGETS = 10;
var MAXYWIDGETS = 5;
var THINGSINCONTAINER = 3;
var WIDGETWIDTH = 360;
var WIDGETHEIGHT = 320;
var ws;

var touchstart = -1;
var lastthingtouched = -1;
var zoomed = -1;
var prezoomx;
var prezoomy;
var zoomuser;

var delay = 500;
var minutes = 10;
var datapointsperbucket = 1;
var nbuckets = minutes * 60 / datapointsperbucket;
// immer alle buckets vorhanden, line -1000, -1000

function moveLeft(buckets) {
//	console.log("Move left...");
	for(var i= 1; i< nbuckets; i++) {
		buckets[i-1].n= buckets[i].n;
		buckets[i-1].value= buckets[i].value;		
	}
	cleanBucket(buckets[nbuckets-1]);
}
function calcLines(buckets, parts, n) {
//	console.log(n+" "+parts);
	var sy= 263;
	var w= 300/(nbuckets-1);
	var startX= -150;
	for(var b= 0; b<nbuckets-1; b++) {
		var i= nbuckets-1-b;
	//	console.log("i: "+i);
		var x1= startX+i*w;
		var y1= sy- Math.max(Math.min(0.8*200, 0.8*buckets[i].value), 0.8*60);
		var x2= startX+(i-1)*w;
		var y2= sy- Math.max(Math.min(0.8*200,0.8*buckets[i-1].value), 0.8*60);
		if(buckets[i].value== 0 || buckets[i-1].value== 0) {
			x1= 4000000;
			x2= 4000000;
		}
		parts[n+i-1].setPoints(x1, y1, x2, y2);
	}
}

function cleanBucket(bucket) {
		bucket.value= 0;
		bucket.n= 0;		
}

function addToBucket(bucket, val) {
	bucket.value= (bucket.n*bucket.value+ val)/(bucket.n+1);
	bucket.n++;
}

function processData(sessiondata) {
	if( typeof thegym == "undefined") {
		console.log("thegym type undefined")
		return;
	}

	session = JSON.parse(sessiondata);
    
	console.log(sessiondata);
	for ( var i = 0; i < MAXWIDGETS; i++) {
		if (i < session.users.length) {
			try {
				if (zoomed == -1 || (zoomed >= 0 && i == zoomed)) {
					thegym.widgets[i].setVisibility(true);
				}
			}
			catch(e) {
				continue;
			}
		} else {
			thegym.widgets[i].setVisibility(false);
			continue;
		}
		var hr = session.users[i].hr;

		thegym.widgets[i].things[0].setHR(hr);
		thegym.widgets[i].things[0].texts[0].setText(session.users[i].deviceid);
		thegym.widgets[i].things[0].texts[2].setText(session.users[i].name);
		thegym.widgets[i].things[0].texts[8].setText(session.users[i].calories);
		thegym.widgets[i].things[0].texts[5].setText(session.users[i].recovery);
		
		thegym.widgets[i].things[0].rects[1]
				.setColor(session.users[i].color);
		if (zoomuser == session.users[i].name) {
			thegym.zoomMe(zoomuser);
			zoomuser = "-1";
		}
	}
}

function TheGym() {
	this.newdata = false;
}

TheGym.prototype = new Modell(64);

TheGym.prototype.setup = function() {
//	console.log("scale: " + scale + " w: " + width + " h: " + height);
	
	this.widgets = new Array(MAXWIDGETS);
	
	ws = (width / WIDGETWIDTH * WIDGETHEIGHT + height)
			/ (WIDGETHEIGHT * MAXWIDGETS + 2 * WIDGETHEIGHT)

	var nx = Math.ceil(width / WIDGETWIDTH / ws);
	var ny = Math.ceil((height - 2 * WIDGETHEIGHT * ws) / WIDGETHEIGHT / ws);
//	console.log("nx: " + nx + " ny: " + ny + " ws: " + ws + " nx+ny: "
//			+ (nx + ny));

	ws = Math.min(width / nx / WIDGETWIDTH, (height - 2 * WIDGETHEIGHT * ws)
			/ ny / WIDGETHEIGHT);
	nx = Math.floor(width / WIDGETWIDTH / ws);
	ny = Math.floor((height - 2 * WIDGETHEIGHT * ws) / WIDGETHEIGHT / ws);

//	console.log("nx: " + nx + " ny: " + ny + " ws: " + ws + " nx+ny: "
//			+ (nx + ny));
	var n = 0;
	var lx = 0, ly = 0;
	lx = -w2 + WIDGETWIDTH * ws;
	for ( var y = 0; y < Math.floor(ny / 2); y++) {
		ly = -h2 + 2 * WIDGETHEIGHT * ws + y * (height - 2 * ws * WIDGETHEIGHT)
				/ ny * 2;
		this.widgets[n] = new WidgetWithIcon("Belt" + (n + 1), lx, ly, ws);
		this.widgets[n].setVisibility(false);
		n++;
	}

	for ( var x = 0; x < Math.floor(nx / 2); x++) {
		lx = x * width / Math.floor(nx / 2) - w2 + WIDGETWIDTH * ws;
		this.widgets[n] = new WidgetWithIcon("Belt" + (n + 1), lx, h2 - ws
				* WIDGETHEIGHT, ws);
		this.widgets[n].setVisibility(false);
		n++;
	}

	for ( var y = Math.floor(ny / 2) - 1; y >= 0; y--) {
		this.widgets[n] = new WidgetWithIcon("Belt" + (n + 1), w2 - WIDGETWIDTH
				* ws,
				ly - (Math.floor(ny / 2 - 1) - y) * 2 * WIDGETHEIGHT * ws, ws);
		this.widgets[n].setVisibility(false);
		n++;
	}

	for ( var x = Math.floor(nx / 2) - 1; x >= 0; x--) {
		this.widgets[n] = new WidgetWithIcon("Belt" + (n + 1), lx
				- Math.floor(((nx / 2 - 1)) - x) * width / nx * 2, -h2
				+ WIDGETHEIGHT * ws, ws);
		this.widgets[n].setVisibility(false);
		n++;
	}

	var pos = 0;
	for ( var layer = 0; layer < 1000; layer++) {
		for ( var j = 0; j < MAXWIDGETS; j++) {
			if(this.widgets[j]=== undefined) 
				continue;
			pos += this.widgets[j].addThings(allThings, pos, layer);
		}
	}
	numberOfThings = pos;
	//console.log("NumberOfThings: " + numberOfThings);
	this.fr = 0;
};

TheGym.prototype.update = function(currentTimeMillis) {
	if (this.fr % 10 == 1) {
		// allThings[50].scale(1.05, 1.05);
	}
	this.fr++;
	this.modellupdate(currentTimeMillis);
	for ( var i = 0; i < numberOfThings; i++) {
		if (allThings[i] instanceof Widget)
			allThings[i].update();
	}
};

TheGym.prototype.touch = function(x, y) {
	for ( var i = 0; i < numberOfThings; i++) {
		if (allThings[i].dragged) {
			this.widgets[i / THINGSINCONTAINER].translate(-allThings[i].x + x
					- w2, -allThings[i].y + y - h2);
			return;
		}
	}
};

TheGym.prototype.touchStart = function(x, y) {
	for ( var i = 0; i < numberOfThings; i++) {
		if (allThings[i].isIn(x - w2, y - h2)) {

			if (i == lastthingtouched
					&& new Date().getTime() - touchstart < 1000) {
				var w = Math.floor(i / THINGSINCONTAINER);
				this.zoomMe(this.widgets[w].things[0].texts[0].getText());

			} else {
				allThings[i].dragged = true;
			}
			lastthingtouched = i;
			touchstart = new Date().getTime();
		}
	}
};

TheGym.prototype.touchStop = function(x, y) {
	for ( var i = 0; i < numberOfThings; i++) {
		allThings[i].dragged = false;
	}
};

TheGym.prototype.zoomIn = function(x, y) {
	for ( var i = 0; i < MAXWIDGETS; i++) {
		thegym.widgets[i].scale(1.1, 1.1);
	}
};

TheGym.prototype.zoomOut = function(x, y) {
	for ( var i = 0; i < MAXWIDGETS; i++) {
		thegym.widgets[i].scale(1 / 1.1, 1 / 1.1);
	}
};

TheGym.prototype.zoomMe = function(name) {
	var s = Math.min(width * 0.8 / ws / 2 / WIDGETWIDTH, height * 0.8 / ws / 2
			/ WIDGETHEIGHT);

	for ( var i = 0; i < MAXWIDGETS; i++) {
		if (thegym.widgets[i].things[0].texts[0].getText() == name) {
			if (zoomed == -1) {
				zoomed = i;
				prezoomx = -allThings[i * THINGSINCONTAINER].x;
				prezoomy = -allThings[i * THINGSINCONTAINER].y;
				this.widgets[i].things[0].heart.visible = true;
				this.widgets[i].things[0].zoom(true);
				this.widgets[i].translate(prezoomx, prezoomy-40);
				this.widgets[i].scale(s, s);

				for ( var j = 0; j < MAXWIDGETS; j++) {
					if (i != j)
						this.widgets[j].setVisibility(false);
				}
			} else {
				zoomed = -1;
				this.widgets[i].scale(1 / s, 1 / s);
				this.widgets[i].things[0].heart.visible = false;
				this.widgets[i].things[0].zoom(false);

				for ( var j = 0; j < MAXWIDGETS; j++) {
					if (i != j) {
						// this.widgets[j].setVisibility(true);
					} else {
						this.widgets[i].translate(-prezoomx, -prezoomy);
					}
				}
			}
			return;
		}
	}
};

function WidgetWithIcon(text, x, y, s) {
	this.__setup(THINGSINCONTAINER);
	this.things[0] = new Widget(text);
	this.things[0].scale(2 * s, 2 * s);

	this.things[1] = new ImageThing("../images/lorbeeren.png", 64 * 2 * s, 64 * 2 * s);
	this.things[1].translate(-240 * s, 120 * s, 0);

	this.things[2] = new ImageThing("../images/logo.png", 80 * s,80 * s);
	this.things[2].translate(288 * s, -200 * s, 0);
	this.things[2].setVisibility(true);
	this.setupDone();
	this.translate(x, y);
}

WidgetWithIcon.prototype = new ThingContainer(2);

function Widget(text) {
	this.thinginit(5+nbuckets-1);
	this.coords = new CoordinateTap("WidgetCoords");
	this.setCoordinateTap(this.coords);
	this.ct = new Array(2);
	this.rects = new Array(2);
	this.texts = new Array(6);
	this.hr = 90;
	this.hrs = new Array();
	this.hrs[0] = this.hr;
	this.nhrs = 0;
	this.buckets = new Array(nbuckets);
	this.lastbucket= 0;
	for(var i= 0; i< nbuckets; i++) {
		this.buckets[i]= new Object();
		cleanBucket(this.buckets[i]);
	}


	this.updates = 0;
	var gray1 = 0x30FFFFFF;
	var gray2 = 0x80000000;
	var red1 = 0x80AA0000;
	var hred = 0xFFFF0000;

	this.name = "Widget";
	this.rects[0] = new Rectangle();
	this.rects[0].init(320, 240, 0, 0, 0, 0, gray1);
	this.ct[0] = new CoordinateTap("Frame");
	this.rects[0].setCoordinateTap(this.ct[0]);
	this.add(this.rects[0]);

	this.rects[1] = new Rectangle();
	this.rects[1].init(316, 188, 0, 0, 0, 0, red1);
	this.ct[1] = new CoordinateTap("Body");
	this.rects[1].setCoordinateTap(this.ct[1]);
	this.add(this.rects[1]);

	this.heart = new Bone(92, -46, 0, 0, 8);
	this.heart.setName("Heart");
	var p = new Ellipse(10, 12, -8, 12, 0, -30, TRIANGLES10, hred);
	this.heart.add(p);
	p = new Ellipse(10, 12, 8, 12, 0, 30, TRIANGLES10, hred);
	this.heart.add(p);
	p = new Triangle(0, 10, 0, -16, 8, 0, 20, 16, 8, 0, hred);
	this.heart.add(p);
	this.heart.visible = false;

	this.heart.setupDone();
	this.heart.scale(2, 2);

	this.add(this.heart);
	this.add(new Line(-152, -72, 20, -72, 1, 0, 0xFFFFFFFF));
	this.add(new Line(-152, -72, -152, 90, 1, 0, 0xFFFFFFFF));
	this.add(new Line(-152, 90, 20, 90, 1, 0, 0xFFFFFFFF));
	this.add(new Line(20, 90, 20, -72, 1, 0, 0xFFFFFFFF));

	this.add(new Line(28, -72, 152, -72, 1, 0, 0xFFFFFFFF));
	this.add(new Line(28, -72, 28, 90, 1, 0, 0xFFFFFFFF));
	this.add(new Line(28, 90, 152, 90, 1, 0, 0xFFFFFFFF));
	this.add(new Line(152, 90, 152, -72, 1, 0, 0xFFFFFFFF));
	
	var it = 0;
	this.texts[it] = new Text();
	this.texts[it].init(text, 0, -108, 0xFF000000);
	this.texts[it].setFont("Italiana");
	this.texts[it].setSize(20);
	this.add(this.texts[it]);

	it++;
	this.texts[it] = new Text();
	this.texts[it].init("HR", 32, -64, 0xFF000000);
	this.texts[it].setFont("Italiana");
	this.texts[it].setSize(18);
	this.texts[it].setAlignment(TEXT_LEFT);

	this.add(this.texts[it]);

	it++;
	this.texts[it] = new Text();
	this.texts[it].init("Zone 5", -60, -20, 0xFF000000);
	this.texts[it].setFont("Italiana");
	this.texts[it].setSize(64);
	this.texts[it].setAlignment(TEXT_CENTER);
	this.add(this.texts[it]);

	it++;
	this.hrindex = it;
	this.texts[it] = new Text();
	this.texts[it].init("130", 92, -20, 0xFF000000);
	this.texts[it].setFont("Italiana");
	this.texts[it].setSize(64);
	this.texts[it].setAlignment(TEXT_CENTER);
	this.add(this.texts[it]);

	it++;
	this.texts[it] = new Text();
	this.texts[it].init("", 92, 48, 0xFF000000);
	this.texts[it].setFont("Italiana");
	this.texts[it].setSize(12);
	this.texts[it].setAlignment(TEXT_CENTER);
	this.add(this.texts[it]);

	it++;
	this.texts[it] = new Text();
	this.texts[it].init("0", 146, 64, 0xFFFFFFFF);
	this.texts[it].setFont("Italiana");
	this.texts[it].setSize(64);
	this.texts[it].setAlignment(TEXT_RIGHT);
	this.add(this.texts[it]);

	it++;
	this.texts[it] = new Text();
	this.texts[it].init("", -144, -96, 0xFF000000);
	this.texts[it].setFont("Italiana");
	this.texts[it].setSize(64);
	this.texts[it].setAlignment(TEXT_LEFT);
	this.add(this.texts[it]);

	it++;
	this.texts[it] = new Text();
	this.texts[it].init("", -60, 48, 0xFF000000);
	this.texts[it].setFont("Italiana");
	this.texts[it].setSize(12);
	this.texts[it].setAlignment(TEXT_CENTER);
	this.add(this.texts[it]);
	this.setupDone();

	it++;
	this.texts[it] = new Text();
	this.texts[it].init("512", -60, 70, 0xFF000000);
	this.texts[it].setFont("Italiana");
	this.texts[it].setSize(48);
	this.texts[it].setAlignment(TEXT_CENTER);
	this.add(this.texts[it]);
	
	this.add(new Line(-152, 100, 152, 100, 1, 0, 0));
	this.add(new Line(-152, 216, 152, 216, 1, 0, 0));
	this.add(new Line(-152, 100, -152, 216, 1, 0, 0));
	this.add(new Line(152, 100, 152, 216, 1, 0, 0));
	
	var zone = new Rectangle();
	zone.init(302, 24, 0, 100, 0, 0, 0);
	this.add(zone);
	zone = new Rectangle();
	zone.init(302, 24, 0, 130, 0, 0, 0);
	this.add(zone);
	zone = new Rectangle();
	zone.init(302, 24, 0, 160, 0, 0, 0);
	this.add(zone);
	zone = new Rectangle();
	zone.init(302, 24, 0, 190, 0, 0, 0);
	this.add(zone);
	zone = new Rectangle();
	zone.init(302, 24, 0, 220, 0, 0, 0);
	this.add(zone);
	
	this.graphstart= this.pn; 
	for (var l= 0; l< nbuckets-1; l++) {
		this.add(new Line(400000, 400, -400, -400, 2, 0, 0xFF000000));
	}

	this.setupDone();
	this.ani = new HeartAnimation(this.heart, 800);
	this.ani.create();
	this.ani.setHR(this.hr);
	this.zoom(false);
}

Widget.prototype = new Thing(1);

Widget.prototype.getType = function() {
	return ARROW;
};

Widget.prototype.isIn = function(x, y) {
	this.dragged = false;

	for ( var i = 0; i < 2; i++) {
		// console.log("xmin: "+this.ct[i].a11+" xmax: "+this.ct[i].a21+ " ymin:
		// "+this.ct[i].a12+" ymax: "+this.ct[i].a22);
		if (x >= this.ct[i].a11 && x <= this.ct[i].a21 && y >= this.ct[i].a12
				&& y <= this.ct[i].a22) {
			return true;
		}
	}
	return false;
};

Widget.prototype.setHR = function(hr) {
	this.texts[this.hrindex].setText(hr);
	this.ani.setHR(hr);
	this.hrs[this.nhrs] = hr;
	var curb= this.lastbucket;
	
	if(this.buckets[this.lastbucket].n== datapointsperbucket) {
		if(curb< nbuckets-1) {
			curb++;
		}
		else {
			calcLines(this.buckets, this.parts, this.graphstart);
			moveLeft(this.buckets);
		}
	}
	
	if(this.lastbucket!= curb)
		calcLines(this.buckets, this.parts, this.graphstart);

	addToBucket(this.buckets[curb], hr);

	this.lastbucket= curb; 

	this.nhrs++;
};

Widget.prototype.zoom = function(on) {
	//console.log("pn: "+this.pn+" "+this.graphstart);
	
	if (!on) {
		if(this.rects[0].y== 50) {
			this.rects[0].setDimension(320, 240);
			this.rects[0].translate(0, -50, 0);
			for(var i= 1; i< 10; i++) {
				this.parts[this.graphstart-i].setColor(0);
			}
		}
		this.pn = this.graphstart;
	} else {
		if(this.pn==29)
			this.pn+= nbuckets-1;
		this.rects[0].setDimension(320, 340);
		this.rects[0].translate(0, 50, 0);
		for(var i= 6; i< 10; i++) {
			this.parts[this.graphstart-i].setColor(0xFFFFFFFF);
		}
	
		var zh1= (this.zone1end-60)*0.8;
		this.parts[this.graphstart-1].translate(0, -this.parts[this.graphstart-1].ry-this.parts[this.graphstart-1].y, 0);
		this.parts[this.graphstart-1].translate(0, 215-zh1/2+1, 0);
		this.parts[this.graphstart-1].setDimension(302, zh1);		
		this.parts[this.graphstart-1].setColor(0x80483D8B);

		var zh2= (this.zone2end-this.zone1end)*0.8;
		this.parts[this.graphstart-2].translate(0, -this.parts[this.graphstart-2].ry-this.parts[this.graphstart-2].y, 0);
		this.parts[this.graphstart-2].translate(0, 215-zh1-zh2/2+1, 0);
		this.parts[this.graphstart-2].setDimension(302, zh2);
		this.parts[this.graphstart-2].setColor(0x802E8B57);

		var zh3= (this.zone3end-this.zone2end)*0.8;
		this.parts[this.graphstart-3].translate(0, -this.parts[this.graphstart-3].ry-this.parts[this.graphstart-3].y, 0);
		this.parts[this.graphstart-3].translate(0, 215-zh1-zh2-zh3/2+1, 0);
		this.parts[this.graphstart-3].setDimension(302, zh3);
		this.parts[this.graphstart-3].setColor(0x809ACD32);

		var zh4= (this.zone4end-this.zone3end)*0.8;
		this.parts[this.graphstart-4].translate(0, -this.parts[this.graphstart-4].ry-this.parts[this.graphstart-4].y, 0);
		this.parts[this.graphstart-4].translate(0, 215-zh1-zh2-zh3-zh4/2+1, 0);
		this.parts[this.graphstart-4].setDimension(302, zh4);
		this.parts[this.graphstart-4].setColor(0x80FFA500);

		var zh5= (200-this.zone4end)*0.8;
		this.parts[this.graphstart-5].translate(0, -this.parts[this.graphstart-5].ry-this.parts[this.graphstart-5].y, 0);
		this.parts[this.graphstart-5].translate(0, 215-zh1-zh2-zh3-zh4-zh5/2+1, 0);
		this.parts[this.graphstart-5].setDimension(302, zh5);
		this.parts[this.graphstart-5].setColor(0x80FF4500);

	}
	this.setupDone();
};

Widget.prototype.update = function() {
	this.updates++;

	this.ani.animateImpl();
	/*
	 * if (this.updates % 10 == 1) { this.hr += -2 + getRandom(0, 4); }
	 */
};

function HeartAnimation(heart, duration) {
	this.duration = duration;
	this.heart = heart;

	this.init("HeartAnimation", 2, 1, true);
}

HeartAnimation.prototype = new CompositeAnimation();

HeartAnimation.prototype.clear = function() {
	for ( var i = 0; i < this.maxanimation; i++) {
		for ( var j = 0; j < this.maxlevel; j++) {
			if (this.anis[j * this.maxanimation + i] != null) {
				this.anis[j * this.maxanimation + i].stop();
				if (this.anis[j * this.maxanimation + i] != null)
					this.anis[j * this.maxanimation + i] = null;
				this.anis[j * this.maxanimation + i] = null;
			}
		}
	}
};

HeartAnimation.prototype.setHR = function(hr) {
	// console.log("HR: "+hr);
	this.pa1.duration = Math.round(1000.0 * 60.0 / hr / 2);
	this.pa2.duration = Math.round(1000.0 * 60.0 / hr / 2);
};

HeartAnimation.prototype.create = function(s, d) {
	this.clear();
	this._loops = true;

	this.pa1 = new PartAnimation();
	this.pa1.init(this.heart, 0.0, 0.0, 0.0, 1.32, 1.32, this.duration, false);

	this.addAnimation(this.pa1, 0);
	this.pa2 = this.pa1.createReverseAnimation();
	this.addAnimation(this.pa2, 1);
	this.start();
};

HeartAnimation.prototype.increaseLevelImpl = function() {
	if (this.level == 2)
		this.heart.reset();
};

HeartAnimation.prototype.startImpl = function() {
	this.start();
	this.heart.reset();
};

HeartAnimation.prototype.animateImpl = function() {
	var now = (new Date()).getTime();

	if (!this.running) {
		return 1.0;
	}

	var l = this.level;
	var ret = this.animate(now);

	if (l != this.level) {
		this.increaseLevelImpl();
		if (l == 2) {
			this.heart.reset();
		}
	}

	return ret;
};

HeartAnimation.prototype.getType = function() {
	return ANIMATION;
};

  
socket.on('session', function(msg){
//	console.log("SessionData: "+msg);
	processData(msg);
});
