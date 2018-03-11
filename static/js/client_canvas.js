var paint;
var canvasDiv;
var canvas;
var context;
var canvasWidth = 500;
var canvasHeight = 700;
var clickX = new Array();
var clickY = new Array();
var switchSend = 1;

//Canvas of the other player
var previousSize = 0;
var count = 0;
$( document ).ready(function() {
	canvasDiv = document.getElementById('canvasDiv');
	canvas = document.createElement('canvas');
	canvas.setAttribute('width', canvasWidth);
	canvas.setAttribute('height', canvasHeight);
	canvas.setAttribute('id', 'canvas');
	canvasDiv.appendChild(canvas);
	context = canvas.getContext("2d");


	if(typeof G_vmlCanvasManager != 'undefined') {
		canvas = G_vmlCanvasManager.initElement(canvas);
	}

	function start(e)
	{
		console.log(e);
		e.preventDefault();
		paint = true;
		addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
		//addClick(e.touches["0"].pageX - this.offsetLeft, e.touches["0"].pageY - this.offsetTop);
		redraw();
	}

	function draw(e)
	{
		if(paint)
		{
			addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
			//addClick(e.touches["0"].pageX - this.offsetLeft, e.touches["0"].pageY - this.offsetTop);
			redraw();
		}
	}
	function stop(e)
	{
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

	function addClick(x, y)
	{
	  clickX.push(x);
	  clickY.push(y);
	}

	function redraw(){
		var sliceClickX = clickX.slice(previousSize);
		var sliceClickY = clickY.slice(previousSize);
		// console.log(clickX);
		// console.log(sliceClickX);
		// console.log("_________");
		setTimeout(function() {socket.emit('canvasData', {sliceClickX, sliceClickY});}, 3000);
		previousSize = clickX.length - 1;
		context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas

		context.strokeStyle = "#df4b26";
		context.lineJoin = "round";
		context.lineWidth = 5;
				
		for(var i=0; i < clickX.length; i++) {		
			context.beginPath();
			if(i)
			{
				context.moveTo(clickX[i-1], clickY[i-1]);
			}
			else
			{
			   context.moveTo(clickX[i]-1, clickY[i]);
			}
			context.lineTo(clickX[i], clickY[i]);
			context.closePath();
			context.stroke();
		}


	}
	init();
});
