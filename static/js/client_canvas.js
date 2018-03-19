var paint;
var canvasDiv;
var canvas;
var context;
var canvasWidth = 500;
var canvasHeight = 700;
var prevX = 0;
var prevY = 0;
var switchSend = 1;

//Canvas of the other player
var previousSize = 0;
var count = 0;
$( document ).ready(function() {
    console.log('Making canvas!');
	canvasDiv = document.getElementById('canvasDiv');
	canvas = document.createElement('canvas');
	canvas.setAttribute('width', canvasWidth);
	canvas.setAttribute('height', canvasHeight);
	canvas.setAttribute('id', 'canvas');
	canvasDiv.appendChild(canvas);
	context = canvas.getContext("2d");
	context.strokeStyle = "#cc99b5";
	context.lineJoin = "round";
	context.lineWidth = 5;


	if(typeof G_vmlCanvasManager != 'undefined') {
		canvas = G_vmlCanvasManager.initElement(canvas);
	}

	function start(e)
	{
		e.preventDefault();
		if (e.type == "mousedown")
		{
			prevX = e.pageX - this.offsetLeft;
			prevY = e.pageY - this.offsetTop;
		}
		else //touch event
		{
			prevX = e.touches["0"].pageX - this.offsetLeft;
			prevY = e.touches["0"].pageY - this.offsetTop;
		}	
		paint = true;
	}

	var lastMove = 0;
	function draw(e)
	{
		e.preventDefault();
		var currX = 0;
		var currY = 0;
		if (e.type == "mousemove")
		{
			currX = e.pageX - this.offsetLeft;
			currY = e.pageY - this.offsetTop;
		}
		else //touch event
		{
			currX = e.touches["0"].pageX - this.offsetLeft;
			currY = e.touches["0"].pageY - this.offsetTop;
		}
		if(Date.now() - lastMove > 30) {
			// Do stuff
			lastMove = Date.now();
		
			if(paint){
				var sliceClickX = [prevX, currX];
				var sliceClickY = [prevY, currY];
				socket.emit('canvasData', {sliceClickX, sliceClickY, masterRoomCode});
				context.moveTo(sliceClickX[0], sliceClickY[0]);
				context.lineTo(sliceClickX[1], sliceClickY[1]);
				context.closePath();
				context.stroke();
				prevX = currX;
				prevY = currY;
				//redraw();
			}
		}
	}
	function stop(e)
	{
		e.preventDefault();
		paint = false;
	}

	function init() {
	    canvas.addEventListener("touchstart",start,false);
	    canvas.addEventListener("touchmove",draw,false);
	    canvas.addEventListener("touchend",stop,false);
	    canvas.addEventListener("mousedown",start,false);
	    canvas.addEventListener("mousemove",draw,false);
	    canvas.addEventListener("mouseup",stop,false);
	    canvas.addEventListener("mouseout",stop,false);
	}

	init();
});
