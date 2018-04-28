var inGame = false;
var displayText = document.getElementById('MainText');
var prompt = "";
var STUN_DURATION = 3
var timeLeft = STUN_DURATION;;
var timerID;

$(document).ready(function(){
    
//Mouse events
    $("#fire-button").mousedown(function(){
        handleReady();
    });

    $("#fire-button").mouseup(function(){
        handleUnready();
    });
//Touch events
    $("#fire-button").on("touchstart", function(){
        handleReady();
    });
    
    $("#fire-button").on("touchend", function(){
        handleUnready();
    });
    
    if(clientFlag)
    {
       console.log('Warning: Duplicate client showdown file detected.');
       return; 
    }
    
    clientFlag = true;
    
    socket.on('endDrawing', function() {
        $('#content').empty(); 
    });
    
    socket.on('stun', function() {
        $('#content').html('<span class=\'centerContent\'><img style=\"content: url(static/images/Stunned.png)\"></span>');
        timerID = setInterval(stun, 1000);
        stun();
        console.log('Stun active.');
    });
    
//This should avoid the context menu on chrome when pressing and holding.
    window.oncontextmenu = function(event) {
     event.preventDefault();
     event.stopPropagation();
     return false;
};
     
});

//Handles ready case for mouse and touch inputs.
function handleReady()
{
    socket.emit('ready', masterRoomCode);
    $('#showdown_gun').attr("src", "/static/images/GunTilt.png");
    $('#showdown_btn_text').html('');
}

//Handles unready case for mouse and touch inputs.
function handleUnready()
{
    socket.emit('unready', masterRoomCode);
    $('#showdown_gun').attr("src", "/static/images/Gun.png");
    $('#showdown_btn_text').html('Press and hold to ready your gun partner!');
}

//Timer function
function stun()
{
    if(timeLeft == 0)
    {
        clearTimeout(timerID);
        console.log("Unstunning...");
        socket.emit('unstun', masterRoomCode);
        timeLeft = STUN_DURATION;
    }
    else
    {
        timeLeft--;
    }
}