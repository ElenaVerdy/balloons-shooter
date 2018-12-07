(function(){

function Target() {
	var elem = document.createElement("div");
	document.getElementById("container").appendChild(elem);
	elem.classList.add("target");
	elem.setAttribute("name", "target");
	this.elem = elem;
	this.elem.addEventListener("activated", event=>{
		gameState.setScore(event.isPlayer1Turn, 3);
		this.elem.classList.remove("activated");
		if (this.elem.parentElement === null) return;
		this.renderAtARandomPosition();
	});
};

Target.prototype.getSize = function(){
	return parseInt(getComputedStyle(this.elem).height);
};

Target.prototype.changeSize = function(num){
	if (num>0) {
		for (var i = 0; i < num/2; i++) {
			(()=>{
				setTimeout(()=>{
					if (this.elem.offsetTop>0) {
					this.elem.style.top = this.elem.offsetTop-1 + "px";
					};
					this.elem.style.left = this.elem.offsetLeft-1 + "px";
					this.elem.style.width = this.getSize() + 2 + "px";
					this.elem.style.height = this.getSize() + 2 + "px";
				}, i*10);;
			})(i);
		};
	} else {
		for (var i = 0; i > num/2; i--) {
			(()=>{
				setTimeout(()=>{
					this.elem.style.top = this.elem.offsetTop + 1 + "px";
					this.elem.style.left = this.elem.offsetLeft + 1 + "px";
					this.elem.style.width = this.getSize() - 2 + "px";
					this.elem.style.height = this.getSize() - 2 + "px";
				}, (-i)*10);
			})(i);
		};
	};
};

Target.prototype.renderAtARandomPosition = function() {
	var currentCoors = {
		top: this.elem.offsetTop,
		left: this.elem.offsetLeft
	};

	var getNewCoors = ()=>{
		var otherTargets = [].slice.call(document.getElementsByClassName("target"));
		var probableCoors = {
			top: Math.random()*(this.elem.parentElement.clientHeight-this.elem.offsetHeight-50),
			left: 70+Math.random()*(this.elem.parentElement.clientWidth-this.elem.offsetWidth-140)
		};

		var newCenter = {
			top: probableCoors.top + 0.5*this.getSize(),
			left: probableCoors.left + 0.5*this.getSize(),
		};
		for (var i = 0; i < otherTargets.length; i++) {

			var otherTargetCenter = {
				top: otherTargets[i].offsetTop + this.getSize(),
				left: otherTargets[i].offsetLeft + this.getSize()
			};
			var distanceBetweenCenters = Math.sqrt( Math.pow( (newCenter.top - otherTargetCenter.top), 2)
																						+ Math.pow( (newCenter.left - otherTargetCenter.left), 2));
			if (distanceBetweenCenters < this.getSize()) return getNewCoors()
			return probableCoors;
		}
	};

	var newCoors = getNewCoors();
	var speed = {
		top: (newCoors.top-currentCoors.top)/20,
		left: (newCoors.left-currentCoors.left)/20
	};

	var count = 0;
	var targetTimer = setInterval(()=>{
		this.elem.style.top = currentCoors.top + speed.top + "px";
		this.elem.style.left = currentCoors.left + speed.left + "px";
		currentCoors.top +=speed.top;
		currentCoors.left +=speed.left;
		count++;
		if (count==20) clearTimeout(targetTimer);
	}, 12);
};


function Ball(options) {
	this.isFlying = false;
	this.elem = options.elem;
	this.atAStartingPosition = atAStartingPosition;
	this.throwPlayer1 = throwPlayer1.bind(this);
	this.throwPlayer2 = throwPlayer2.bind(this);

	var size = this.getSize();
	this.elem.classList.add("bullet");


	this.elem.onmousedown = event=>{
		const R = 50;
			if (event.pageY === undefined) {
				Ball.isUsingTouchScreen = true;
				event.pageY = event.touches[0].pageY;
				event.pageX = event.touches[0].pageX;
				this.elem.onmousedown = null;
			};

		var moveAt = (event)=>{
			if (event.pageY === undefined) {
				event.pageY = event.touches[0].pageY;
				event.pageX = event.touches[0].pageX;
			}
			var top = event.pageY - shiftY;
			var left = event.pageX - shiftX;

			if ( Math.pow((top - coords.top), 2) 
				+ (Math.pow((left - coords.left), 2)) <= R*R ){

				if (this.isPlayer1Turn && ((left - coords.left) < 0) 
					|| !this.isPlayer1Turn && ((left - coords.left) > 0)) {
					this.elem.style.top = top + "px";
					this.elem.style.left = left + "px";
				} else {
					this.elem.style.top = top + "px";
					this.elem.style.left = coords.left + "px";
				}

			} else {
				var d = (event.pageY-coords.top-shiftY) / (event.pageX-coords.left-shiftX);
				var Xabs = Math.sqrt(R*R/(d*d + 1));
				var Yabs = d * Xabs;

				if(this.isPlayer1Turn) {

					if (event.pageX-coords.left -shiftX < 0) {
						this.elem.style.left = coords.left - Xabs + "px";
						this.elem.style.top = coords.top - Yabs + "px";
					} else {
						this.elem.style.left = coords.left + "px";
						this.elem.style.top = coords.top + Yabs + "px";
					}

				} else {

					if (event.pageX-coords.left -shiftX > 0) {
						this.elem.style.left = coords.left + Xabs + "px";
						this.elem.style.top = coords.top + Yabs + "px";
					} else {
						this.elem.style.left = coords.left + "px";
						this.elem.style.top = coords.top - Yabs + "px";
					};

				};
			};
		};

		var coords = getCoords(this.elem);
		var coordsRelativeToContainer = {
			top: coords.top - container.offsetTop - container.clientTop,
			left: coords.left - container.offsetLeft - container.clientLeft
		}

		var shiftX = event.pageX-coords.left;
		var shiftY = event.pageY-coords.top;

		document.body.appendChild(this.elem);
		moveAt(event);

		document.onmousemove = event=>{
			moveAt(event);
		};
		if (Ball.isUsingTouchScreen) {
			document.ontouchmove = document.onmousemove;
			document.onmousemove = null;
		}

		document.onmouseup = event=>{

			var container = document.getElementById("container");
			container.appendChild(this.elem);

			var finalPositionX = parseFloat(getComputedStyle(this.elem).left) - container.offsetLeft - container.clientLeft;
			var finalPositionY = parseFloat(getComputedStyle(this.elem).top) - container.offsetTop - container.clientTop;

			if (Math.abs(finalPositionX-coords.left+container.offsetLeft) < 3 && Math.abs(finalPositionY-coords.top+container.offsetTop) < 3) {
				container.appendChild(this.elem);
				this.elem.style.left = coords.left - container.offsetLeft - parseFloat(getComputedStyle(container).borderWidth) + "px";
				this.elem.style.top = coords.top - container.offsetTop - parseFloat(getComputedStyle(container).borderWidth)+ "px";
				document.onmousemove = null;
				document.onmouseup = null;
				if (Ball.isUsingTouchScreen){
					document.ontouchmove = null;
					document.ontouchend = null;
				}
				return;
			}

				this.elem.style.left = finalPositionX + "px";
				this.elem.style.top = finalPositionY + "px";


			var newCoors = {
				top: parseFloat(getComputedStyle(this.elem).top) - parseFloat(getComputedStyle(container).top),
				left: parseFloat(getComputedStyle(this.elem).left) - parseFloat(getComputedStyle(container).left)
			};

			var callback = (event)=>{
				if (!isFinite(D)) {
					if (!event.isGoingUpwards) {
						var numOfFrames = Math.floor(parseInt(getComputedStyle(this.elem).bottom)/4);
						for (var i = 0; i<numOfFrames+1; i++) {

								setTimeout(((i)=>{
									checkIfStriked();
									if (parseFloat(getComputedStyle(this.elem).top) > container.clientHeight-this.elem.offsetWidth) return;
									this.elem.style.top = parseFloat(getComputedStyle(this.elem).top) + 4 + "px";
									if (i === numOfFrames){
										endTurn.apply(this);
										this.elem.removeEventListener("isBackToStartingPostition", callback);
										return;
									};
								}).bind(this, i), i*5 );
						}
					} else {
						var numOfFrames = Math.floor(parseInt(getComputedStyle(this.elem).top)/4);
						for (var i = 0; i<numOfFrames+1; i++) {

								setTimeout(((i)=>{
									checkIfStriked();
									if (parseFloat(getComputedStyle(this.elem).top) > container.clientHeight-this.elem.offsetWidth) return;
									this.elem.style.top = parseFloat(getComputedStyle(this.elem).top) - 4 + "px";

									if (i === numOfFrames){
										endTurn.apply(this);
										this.elem.removeEventListener("isBackToStartingPostition", callback);
										return;
									}
								}).bind(this, i), i*5 );
						}
					} 

				} else {
					this.isPlayer1Turn ? this.throwPlayer1(D, strength) : this.throwPlayer2(-D, strength);
					this.elem.removeEventListener("isBackToStartingPostition", callback);
				}
			};

			this.elem.addEventListener("isBackToStartingPostition", callback);

			var speed = {
				top: (newCoors.top - coordsRelativeToContainer.top)/10,
				left: (coordsRelativeToContainer.left - newCoors.left)/10
			};

			var distanceBetweenCenters = Math.sqrt(Math.pow(newCoors.top - coordsRelativeToContainer.top, 2) 
				+ Math.pow(newCoors.left - coordsRelativeToContainer.left, 2));


			var D = (newCoors.top - coordsRelativeToContainer.top)/(coordsRelativeToContainer.left - newCoors.left);
			var strength = distanceBetweenCenters * 8;

			for (var i = 0; i<10; i++) {

					setTimeout(((i)=>{
						this.elem.style.left = parseFloat(getComputedStyle(this.elem).left) + speed.left + "px";
						this.elem.style.top = parseFloat(getComputedStyle(this.elem).top) -  speed.top + "px";
						if (i === 9) {
							var event = new Event("isBackToStartingPostition");
							event.isGoingUpwards = !!(newCoors.top > coords.top);
							this.elem.dispatchEvent(event);
						}
					}).bind(this, i), i*20 )
			}

			document.onmousemove = null;
			document.onmouseup = null;

			document.ontouchmove = null;
			document.ontouchend = null;
		};
		if (Ball.isUsingTouchScreen) {
		document.ontouchend = document.onmouseup;
		document.onmouseup = null;
		}


		this.elem.ondragstart = function() {
			return false;
		};

		function getCoords(elem) {
			var box = elem.getBoundingClientRect();
			return {
				top: box.top + pageYOffset,
				left: box.left + pageXOffset
			}
		};
	};

	this.elem.ontouchstart = this.elem.onmousedown;


	function atAStartingPosition(isPlayer1Turn) {
		var startingPoint = this.isPlayer1Turn ? "player1-starting-position" 
			: "player2-starting-position";
		startingPoint = document.getElementById(startingPoint);

		var currentCoors = this.isPlayer1Turn ? {
			top: 4 + startingPoint.offsetTop- this.getSize(),
			left: -4 + startingPoint.offsetLeft+startingPoint.clientWidth
		} : {
			top: 4 + startingPoint.offsetTop- this.getSize(),
			left: 4 + startingPoint.offsetLeft- this.getSize()
		}

		this.elem.style.top = currentCoors.top+"px";
		this.elem.style.left = currentCoors.left+"px";
	};

	function checkIfStriked() {
		var targets = document.getElementsByClassName("target");

		var elemCenterCoors = {
			x:this.elem.offsetLeft + 0.5*this.getSize(),
			y:this.elem.offsetTop + 0.5*this.getSize()
		};

		for (var i = 0; i < targets.length; i++) {
			var targetCenterCoors = {
				x: targets[i].offsetLeft + 0.5*targets[i].offsetWidth,
				y: targets[i].offsetTop + 0.5*targets[i].offsetHeight
			}
			var dis = Math.sqrt( Math.pow( (elemCenterCoors.x - targetCenterCoors.x), 2 )
				+ Math.pow( (elemCenterCoors.y - targetCenterCoors.y), 2 ));
			if ( dis <= (this.getSize() + targets[i].offsetHeight)*0.5 ) targets[i].classList.add("activated");
		}
	};
	checkIfStriked = checkIfStriked.bind(this);

	function endTurn(){
			var activatedTargets = [].slice.call(document.getElementsByClassName("activated"));
			activatedTargets.forEach(item=>{
				var event = new Event("activated");
				event.isPlayer1Turn = this.isPlayer1Turn;
				item.dispatchEvent(event);
			})

			Ball.prototype.isPlayer1Turn = !this.isPlayer1Turn;
			this.atAStartingPosition(this.isPlayer1Turn);
			var endTurnEvent = new Event("nextTurn");
			document.dispatchEvent(endTurnEvent);
			gameState.timerRestart();
			this.isFlying = false;
	};

	function throwPlayer2(D0, strength) {
		if (this.isFlying) return;
		this.isFlying = true;
		var timerStop = new Event("timerStop");
		document.dispatchEvent(timerStop);
		var b = D0;
		var R = strength;
		var a = -Math.sqrt( (Math.pow(b,4) + 4*b*b)/(16*R*R) );

		var startingCoors = {
			top: this.elem.offsetTop,
			left: this.elem.offsetLeft 
		};

		currentCoors = {
			top:0,
			left:0
		};

		elemTimer = setInterval(()=>{
			currentCoors.left = currentCoors.left - 1;
			currentCoors.top = Math.pow((currentCoors.left-(b/a)), 2) * a + b * (currentCoors.left-(b/a));
			this.elem.style.left = startingCoors.left + currentCoors.left + "px";
			this.elem.style.top = startingCoors.top - currentCoors.top + "px";

		checkIfStriked();

		var elemCoorsToWindow = this.elem.getBoundingClientRect();
		var containerCoorsToWindow = this.elem.parentElement.getBoundingClientRect();

		if ( elemCoorsToWindow.top <= containerCoorsToWindow.top || elemCoorsToWindow.right >= containerCoorsToWindow.right || 
			elemCoorsToWindow.left <= containerCoorsToWindow.left || elemCoorsToWindow.bottom >= containerCoorsToWindow.bottom){

			clearTimeout(elemTimer);
			endTurn.apply(this);
			}
		},4);
	};

	function throwPlayer1(D0, strength) {
		if (this.isFlying) return;
		this.isFlying = true;
		var timerStop = new Event("timerStop");
		document.dispatchEvent(timerStop);
		var b = D0;
		var R = strength;
		var a = -Math.sqrt( (Math.pow(b,4) + 4*b*b)/(16*R*R) );

		var startingCoors = {
			top: this.elem.offsetTop,
			left: this.elem.offsetLeft
		};

		currentCoors = {
			top:0,
			left:0
		}

		elemTimer = setInterval(()=>{
			currentCoors.left = currentCoors.left + 1;
			currentCoors.top = Math.pow(currentCoors.left, 2) * a + b * currentCoors.left;
			this.elem.style.left = startingCoors.left + currentCoors.left + "px";
			this.elem.style.top = startingCoors.top - currentCoors.top + "px";

			checkIfStriked();

			var elemCoorsToWindow = this.elem.getBoundingClientRect();
			var containerCoorsToWindow = this.elem.parentElement.getBoundingClientRect();

			if (elemCoorsToWindow.top <= containerCoorsToWindow.top || elemCoorsToWindow.right >= containerCoorsToWindow.right || 
			elemCoorsToWindow.left <= containerCoorsToWindow.left || elemCoorsToWindow.bottom >= containerCoorsToWindow.bottom) {

			clearTimeout(elemTimer);
			endTurn.apply(this);
			}
		}, 4);
	};
	this.atAStartingPosition(true);
}


Ball.prototype = Object.create(Target.prototype);
Ball.prototype.constructor = Ball;
Ball.prototype.isPlayer1Turn = true;

BuffsAndDebuffs.isTrippleTargetsActivated = false;
BuffsAndDebuffs.isEnlargeTheTargetActivated = false;

function BuffsAndDebuffs(isBuff) {
	var self = this;
	var elem = document.createElement("div");
	var a = isBuff ? "buff" : "debuff";
	elem.classList.add(a);
	elem.classList.add( "target");
	this.elem = elem;
	this.isBuff = isBuff;
	document.getElementById("container").appendChild(elem);
	var listOfBuffs = [bonusPoints, purification, trippleTarget, enlargeTheTarget];

	onActivate = function(){
		if (BuffsAndDebuffs.isTrippleTargetsActivated) listOfBuffs.splice(listOfBuffs.indexOf(trippleTarget), 1);
		if (BuffsAndDebuffs.isEnlargeTheTargetActivated) listOfBuffs.splice(listOfBuffs.indexOf(enlargeTheTarget), 1);
		var index = Math.floor(Math.random()*listOfBuffs.length);

		elem.parentElement.removeChild(elem)
		isBuff ? gameState.setScore(self.isPlayer1Turn, 2) : gameState.setScore(self.isPlayer1Turn, -1);
		isBuff ? listOfBuffs[index](self.isPlayer1Turn) : listOfBuffs[index](!self.isPlayer1Turn);
	}

	elem.addEventListener("activated", onActivate);

	function purification(isPlayer1Turn) {
		var a = !isPlayer1Turn ? "player1bar" : "player2bar";
		var playerBar = document.getElementById(a);

		if (playerBar.getElementsByClassName("tripple-target")[0].classList.contains("buff-activated")) {
			BuffsAndDebuffs.isTrippleTargetsActivated = false;
			document.removeEventListener("nextTurn", BuffsAndDebuffs._trippleTargetBuffingCallback);
			document.removeEventListener("nextTurn", BuffsAndDebuffs._trippleTargetDebuffingCallback);
			playerBar.getElementsByClassName("tripple-target")[0].classList.remove("buff-activated");

				while (document.getElementsByName("target").length>1) {
				document.getElementsByName("target")[1].parentElement.removeChild(document.getElementsByName("target")[1]);
			};
		};

		if (playerBar.getElementsByClassName("enlarge-the-target")[0].classList.contains("buff-activated")) {
			BuffsAndDebuffs.isEnlargeTheTargetActivated = false;
			document.removeEventListener("nextTurn", BuffsAndDebuffs._enlargeTheTargetCallback);
			playerBar.getElementsByClassName("enlarge-the-target")[0].classList.remove("buff-activated");

			document.getElementsByName("target")[0].style.width = "";
			document.getElementsByName("target")[0].style.height = "";

		};
	};
	BuffsAndDebuffs.purification = purification;


	function bonusPoints(){
		var obj = Object.create(BuffsAndDebuffs.prototype);
		var bonus = document.createElement("div");
		obj.elem = bonus;
		bonus.classList.add("bonus");

		var ranNum = 1 + Math.floor(Math.random()*5);
		obj.elem.style.backgroundImage = `url(${ranNum}.png)`;
		document.getElementById("container").appendChild(bonus);
		obj.changeSize(50);
		obj.renderAtARandomPosition();
		setTimeout(()=>{
			obj.elem.parentElement.removeChild(obj.elem)
			gameState.setScore(self.isPlayer1Turn,ranNum);
		},1000);
	};

	function enlargeTheTarget(activatedOnPlayer1Turn){

		var a = activatedOnPlayer1Turn ? "player1bar" : "player2bar";
		var playerBar = document.getElementById(a);

		playerBar.getElementsByClassName("enlarge-the-target")[0].classList.add("buff-activated");

		BuffsAndDebuffs.isEnlargeTheTargetActivated = true;

		var count = 0;
		document.addEventListener("nextTurn", func);
		function func(){
			if (!count && isBuff && self.isPlayer1Turn !== activatedOnPlayer1Turn) return;

				var num = (count%2) ? -20 : 20;
				var targets = [].slice.call(document.querySelectorAll(".target:not(.buff):not(.debuff)"));
				for (var i = 0; i < targets.length; i++) {
					var obj = {
						elem: targets[i],
						getSize: self.getSize
					};
					self.changeSize.call(obj, num);
				}
		count++;

		if (count>3) {
			BuffsAndDebuffs.isEnlargeTheTargetActivated = false;
			document.removeEventListener("nextTurn", func);
			playerBar.getElementsByClassName("enlarge-the-target")[0].classList.remove("buff-activated");
			count = 0;
			};
		};
		BuffsAndDebuffs._enlargeTheTargetCallback = func;
	};

	function trippleTarget (activatedOnPlayer1Turn) {
		var a = activatedOnPlayer1Turn ? "player1bar" : "player2bar";
		var playerBar = document.getElementById(a);

		playerBar.getElementsByClassName("tripple-target")[0].classList.add("buff-activated");

		BuffsAndDebuffs.isTrippleTargetsActivated = true;
		ball.savedthrowPlayer1 = ball.throwPlayer1;
		ball.savedthrowPlayer2 = ball.throwPlayer2;

		if (activatedOnPlayer1Turn) {
			ball.throwPlayer1 = buffed (ball.throwPlayer1);
			ball.throwPlayer2 = debuffed (ball.throwPlayer2);
		} else {
			ball.throwPlayer2 = buffed (ball.throwPlayer2);
			ball.throwPlayer1 = debuffed (ball.throwPlayer1);
		}

		function buffed(normalThrow) {
			var count = 0;
				document.addEventListener("nextTurn", func);

				function func(){
					if (self.isPlayer1Turn === activatedOnPlayer1Turn) return;

					while (document.getElementsByName("target").length>1) {
					document.getElementsByName("target")[1].parentElement.removeChild(document.getElementsByName("target")[1]);
				}
					count +=1;
					if (count>2) {
						ball.throwPlayer2 = ball.savedthrowPlayer2;
						ball.throwPlayer1 = ball.savedthrowPlayer1;
						playerBar.getElementsByClassName("tripple-target")[0].classList.remove("buff-activated");
						BuffsAndDebuffs.isTrippleTargetsActivated = false;
						document.removeEventListener("nextTurn", func);
					};
				};
				BuffsAndDebuffs._trippleTargetBuffingCallback = func;

			return function(){
				normalThrow.apply(this, arguments);
			};
		};

		function debuffed(normalThrow) {
				document.addEventListener("nextTurn", func)
				function func(){
					if (self.isPlayer1Turn !== activatedOnPlayer1Turn) return;

					var target = document.getElementsByClassName("target")[0]; 
					var target1 = new Target();
					var target2 = new Target();
					target1.elem.style.top = target2.elem.style.top = target.offsetTop + "px";
					target1.elem.style.left = target2.elem.style.left = target.offsetLeft + "px";
					target1.changeSize(target.offsetHeight-target1.getSize());
					target2.changeSize(target.offsetHeight-target2.getSize());
					target1.renderAtARandomPosition();
					target2.renderAtARandomPosition();
					document.removeEventListener("nextTurn", func);
				};
				BuffsAndDebuffs._trippleTargetDebuffingCallback = func;

			return function(){
				normalThrow.apply(this, arguments);
			};
		};
	};
};

BuffsAndDebuffs.prototype = Object.create(Ball.prototype);
BuffsAndDebuffs.prototype.constructor = BuffsAndDebuffs;
BuffsAndDebuffs.buffs = [];

function GameState(){
	var player1Score = 0;
	var player2Score = 0;
	var timerID = null;

	this.timerRestart = function(){
		document.addEventListener("timerStop", ()=>{setTimeout(()=>{clearTimeout(timerID)}, 0)})
		var timer = document.getElementById("timer");
		timer.innerHTML = 20;
		if (timerID) clearTimeout(timerID);
		timer.classList.remove("timers-running-out");
		var time = 19;
		timerID = setInterval(()=>{
			var str = ("0"+time).slice(-2);
			timer.innerHTML = str;
			if (time<6) timer.classList.add("timers-running-out");
			time -=1;
			if (time<0) {
				var event = new Event("timeout");
				event.isPlayer1Turn = Ball.prototype.isPlayer1Turn;
				document.dispatchEvent(event);
			};
		}, 1000);
	}

	this.setScore = function(isPlayer1Turn, num){
		if (isPlayer1Turn) {
			var a = "player1score";
			if (player1Score+num<0) {
				player1Score = 0;
				var str = 0;
			} else {
				var str = player1Score += num;
			}
		} else {
			var a = "player2score";
			if (player2Score+num<0) {
				player2Score = 0;
				var str = 0;
			} else {
			var str = player2Score += num;
			}
		}

		document.getElementById(a).innerHTML = ("0"+str).slice(-2);
		if (+str > 50) {
			var gameOver = new Event("gameOver");
			gameOver.winner = isPlayer1Turn;
			document.dispatchEvent(gameOver);
		};
	};

	var restartTheScore = ()=>{
		this.setScore(true, -player1Score);
		this.setScore(false, -player2Score);
	};

	var onGameOver = ()=>{
		document.dispatchEvent(new Event("timerStop"));
		if (Ball.isUsingTouchScreen) {
			var dragAndDropSaved = ball.elem.ontouchstart;
			ball.elem.ontouchstart = null;
		} else {
			var dragAndDropSaved = ball.elem.onmousedown;
			ball.elem.onmousedown = null;
		}

		var finishNotification = document.getElementsByClassName("finish")[0];
		finishNotification.style.display = "flex";

		a = Ball.prototype.isPlayer1Turn ? "The Red" : "The Blue";
		var theVictor = document.getElementById("winner");
		theVictor.innerHTML = `${a} has won!`;

		document.removeEventListener("gameOver", onGameOver);
		finishNotification.addEventListener("click", func);
		function func(){
			finishNotification.style.display = "none";
			Ball.isUsingTouchScreen ? ball.elem.ontouchstart = dragAndDropSaved : ball.elem.onmousedown = dragAndDropSaved;
			BuffsAndDebuffs.purification(true);
			BuffsAndDebuffs.purification(false);
			restartTheScore();
			Ball.prototype.isPlayer1Turn = true;
			ball.atAStartingPosition(true);

			BuffsAndDebuffs.buffs.forEach(item=>{
				if (item.elem.parentElement !== null) item.elem.parentElement.removeChild(item.elem);
			});
			BuffsAndDebuffs.buffs = [];
			document.addEventListener("gameOver", onGameOver);
		};
	};

	document.addEventListener("gameOver", onGameOver);
}

var target = new Target();
var ball = new Ball( {elem: document.getElementById("bullet")} );
var gameState = new GameState();

document.onselectstart = event=>{return false};

document.addEventListener( "nextTurn", event=>{

	if (document.getElementsByClassName("buff").length + document.getElementsByClassName("debuff").length > 3) return;

	var a = Math.random();
	if ( a<0.2 ) return;
	a = ( a<0.5 ) ? true : false;
	if (document.getElementsByClassName("debuff").length === 3) a = true;
		var buff = new BuffsAndDebuffs(a)
		buff.changeSize(40);
		buff.renderAtARandomPosition();
		BuffsAndDebuffs.buffs.push(buff);
})

document.addEventListener( "timeout", event=>{
	event.isPlayer1Turn ?
		ball.throwPlayer1(Math.random()*10, 50+Math.random()*350):
		ball.throwPlayer2(Math.random()*10, 50+Math.random()*350);
});

})();















