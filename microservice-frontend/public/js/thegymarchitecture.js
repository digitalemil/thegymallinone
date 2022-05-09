var THINGSINCONTAINER = 64;
var ws;
let s;

function TheGymArchitecture() {
	
	let p = 0;
	s = Math.min(canvaswidth * 0.8 / 1024, canvasheight * 0.8 / 1024);
	console.log("Scala: "+s);

	let a1= new Arrow("1. BPM over Bluetooth", 0xFF000000, 60);
	a1.scale(s*0.5, s*1);
	a1.translate(-720*s, 0);
	//a1.rotate(45);
	allThings[p++] = a1;
	let a2= new Arrow("2. BPM over LTE", 0xFF000000, 60);
	a2.scale(s*0.5, s*1);
	a2.translate(-320*s, 0);
	//a1.rotate(45);
	allThings[p++] = a2;
	let a= new Arrow("3. BPM", 0xFF000000, 180);
	a.scale(s*0.35, s*0.8);
	a.translate(-20*s, 140*s);
	a.rotate(-60);
	allThings[p++] = a;
	a= new Arrow("4. BPM", 0xFF000000, 60);
	a.scale(s*0.6, s*0.8);
	a.translate(80*s, 140*s);
	a.rotate(-30);
	allThings[p++] = a;
	a= new Arrow("5. BPM", 0xFF000000, 180);
	a.scale(s*0.2, s*0.8);
	a.translate(38*s, 0*s);
	//a.rotate(-30);
	allThings[p++] = a;
	a= new Arrow("6. BPM", 0xFF000000, 90);
	a.scale(s*0.45, s*0.8);
	a.translate(372*s, 0*s);
	//a.rotate(-30);
	allThings[p++] = a;
	a= new Arrow("7. BPM", 0xFF000000, 160);
	a.scale(s*0.82, s*0.8);
	a.translate(312*s, -138*s);
	a.rotate(165);
	allThings[p++] = a;
	a= new Arrow("9. BPM", 0xFF000000, 180);
	a.scale(s*0.18, s*0.8);
	a.translate(148*s, -280*s);
	a.rotate(0);
	allThings[p++] = a;
	a= new Arrow("9. BPM", 0xFF000000, 180);
	a.scale(s*0.75, s*0.8);
	a.translate(-230*s, -280*s);
	a.rotate(180);
	allThings[p++] = a;
	


	this.heart= new Heart();
	allThings[p]= this.heart;
	this.heart.scale(s*1.8, s*1.8);
	allThings[p++].translate(-880 * s, -80 * s, 0);

	let sx= -120*s;
	let dx= 200*s;

	let ms= new MicroserviceThing("images/microservice.png", "Listener", "Microservice", sx+20*s, 0, s, 80, 80);
	let crp= new MicroserviceThing("images/microservice.png", "CockroachDB", "Persister", sx+1.5*dx, 0, s, 120, 120);
	let cr= new MicroserviceThing("images/cockroachdb.png", "", "CockroachDB", sx+3.5*dx, 0, s, 120, 120);
	let msgtr= new MicroserviceThing("images/microservice.png", "Message", "Transformer Ms.", sx+0.75*dx, 1.5*dx, s, 80, 80);
	let msgva= new MicroserviceThing("images/microservice.png", "Message", "Validator Ms.", sx+2*dx, 1.5*dx, s, 80, 80);
	let ui= new MicroserviceThing("images/microservice.png", "", "UI", sx+0.75*dx, -1.5*dx, s, 80, 80);
	let pmml= new MicroserviceThing("images/microservice.png", "PMML", "Evaluator", sx+2*dx, -1.5*dx, s, 80, 80);
	let k8s= new MicroserviceThing("images/k8s.png", "Kubernetes", "", sx+3.2*dx, 2.2*dx, s, 228*1.1, 221*1.1);


	allThings[p] = new ImageThing("images/applewatch.png", 310 * 2 * s* 0.3, 163 * 2 * s* 0.3);
	allThings[p++].translate(-660*s , -70*s, 0);

	allThings[p] = new ImageThing("images/polar.png", 269 * s* 0.3*1.2,1.2*187 * s* 0.3);
	allThings[p++].translate(-780 * s, -90 * s, 0);

	allThings[p] = new ImageThing("images/iphonese.png", 408 * s* 0.3,789 * s* 0.3);
	allThings[p++].translate(-510*s, 0 * s, 0);

	allThings[p] = new ImageThing("images/chrome.png", 264 * s* 0.6,246 * s* 0.6);
	allThings[p++].translate(-510*s, -320 * s, 0);


	let pos= p;
	for ( var layer = 0; layer < 1000; layer++) {
		pos += ms.addThings(allThings, pos, layer);
		pos += crp.addThings(allThings, pos, layer);
		pos += cr.addThings(allThings, pos, layer);		
		pos += msgtr.addThings(allThings, pos, layer);
		pos += msgva.addThings(allThings, pos, layer);
		pos += ui.addThings(allThings, pos, layer);
		pos += pmml.addThings(allThings, pos, layer);
		pos += k8s.addThings(allThings, pos, layer);
	}


	numberOfThings = pos;

}

TheGymArchitecture.prototype = new Modell(64);

TheGymArchitecture.prototype.setup = function() {
};

TheGymArchitecture.prototype.update = function(currentTimeMillis) {
	this.heart.update(currentTimeMillis);
};

TheGymArchitecture.prototype.touch = function(x, y) {
};

TheGymArchitecture.prototype.touchStart = function(x, y) {
};

TheGymArchitecture.prototype.touchStop = function(x, y) {
};

TheGymArchitecture.prototype.zoomIn = function(x, y) {
};

TheGymArchitecture.prototype.zoomOut = function(x, y) {
};

TheGymArchitecture.prototype.zoomMe = function(name) {
};

function Heart() {
	this.thinginit(8);
	let hred = 0xFFFF0000;

	this.heart = new Bone(92, -46, 0, 0, 8);
	this.heart.setName("Heart");
	var p = new Ellipse(10, 12, -8, 12, 0, -30, TRIANGLES10, hred);
	this.heart.add(p);
	p = new Ellipse(10, 12, 8, 12, 0, 30, TRIANGLES10, hred);
	this.heart.add(p);
	p = new Triangle(0, 10, 0, -16, 8, 0, 20, 16, 8, 0, hred);
	this.heart.add(p);
	//this.heart.visible = false;

	this.heart.setupDone();
	this.heart.scale(2, 2);

	this.add(this.heart);
	this.setupDone();
	this.ani = new HeartAnimation(this.heart, 800);
	this.ani.create();
	this.ani.setHR(52);
}

Heart.prototype = new Thing(1);

Heart.prototype.getType = function() {
	return ARROW;
};


Heart.prototype.update = function() {
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

function MicroserviceThing(img, text1, text2, x, y, s, w, h) {
	this.__setup(2);
	this.things[0] = new Microservice(text1, text2);
	this.things[0].scale(1 * s, 1 * s);

	this.things[1] = new ImageThing(img, w  * s, h  * s);
	this.things[1].translate(0, -20 * s, 0);

	this.setupDone();
	this.translate(x, y);
}

MicroserviceThing.prototype = new ThingContainer(2);

function Microservice(text1, text2) {
	this.thinginit(4);
	this.rects = new Array(1);
	this.texts = new Array(2);
	
	this.updates = 0;
	var gray1 = 0x30FFFFFF;
	var gray2 = 0x80000000;
	var red1 = 0x80AA0000;
	var hred = 0xFFFF0000;

	this.name = "Microservice";
	this.rects[0] = new Rectangle();
	this.rects[0].init(160, 160, 0, 0, 0, 0, gray1);
	this.add(this.rects[0]);

	
	var it = 0;
	this.texts[it] = new Text();
	this.texts[it].init(text1, 0, 40, 0xFF000000);
	this.texts[it].setFont("Italiana");
	this.texts[it].setSize(20);
	this.add(this.texts[it++]);
	
	this.texts[it] = new Text();
	this.texts[it].init(text2, 0, 60, 0xFF000000);
	this.texts[it].setFont("Italiana");
	this.texts[it].setSize(20);
	this.add(this.texts[it++]);
	
	this.setupDone();
}

Microservice.prototype = new Thing(1);

Microservice.prototype.getType = function() {
	return ARROW;
};


Microservice.prototype.update = function() {
	this.updates++;
};


function Arrow(text, color, size) {
	this.thinginit(3);
	this.updates = 0;
	

	this.name = "Arrow";
	this.rect = new Rectangle();
	this.rect.init(480, 32, 0, 0, 0, 0, color);
	this.add(this.rect);

    this.head= new Triangle(0, 0,0, 280, 0, 240, -40, 240, 40, 0, color);
    this.add(this.head);   

	this.text = new Text();
	this.text.init(text, 0, 40, 0xFF000000);
	this.text.setFont("Italiana");
	this.text.setSize(size);
	this.add(this.text);
	
	this.setupDone();
}

Arrow.prototype = new Thing(3);

Arrow.prototype.getType = function() {
	return ARROW;
};

Arrow.prototype.update = function() {
	this.updates++;
};
