var inGame = false;
var displayText = document.getElementById('MainText');
var prompt = "";
var socket;
$(document).ready(function(){

    socket = io.connect('http://' + document.domain + ':' + location.port );
    
    socket.on('connect', function() {
        console.log('Competitor connected.');
        socket.emit('setCompetitor');
    });

//Provides a display of how many players are ready.
    socket.on('displayready', function(msg) {
        console.log('Incrementing Ready counter.');
        document.getElementById('PlayersReady').innerHTML = msg.data + " Players Ready";
    });
    
//Handles case that someone let go of the screen too early.
    socket.on('falseStart', function() {
        console.log('False Start!');
        displayText.innerHTML = 'Someone let go early! False start!';
    });
//Migrate player to drawing phase.    
    socket.on('drawingPhase', function(reply) {
        inGame = true;
        prompt = reply.data;
    })
    
//Mouse events
    $("button").mousedown(function(){
        handleReady();
    });

    $("button").mouseup(function(){
        handleUnready();
    });
//Touch events
    $("button").on("touchstart", function(){
        handleReady();
    });
    
    $("button").on("touchend", function(){
        handleUnready();
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
    socket.emit('ready');
}

//Handles unready case for mouse and touch inputs.
function handleUnready()
{
    if(inGame) {
        $.ajax({
            type: "POST",
            url: '/draw',
            //data: JSON.stringify( {'num' : '0', 'hi' : 'baka'} ) , //NEW
            //contentType: 'application/json;charset=UTF-8', //NEW
            success: function (data) {
                console.log(data)  // display the returned data in the console.
                $('body').html(data);
                $('#prompt').html(prompt);
            }
        });
    }
    else {
        socket.emit('unready');  
    }
}