var inGame = false;
var displayText = document.getElementById('MainText');
var prompt = "";
$(document).ready(function(){

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

    socket.on('endDrawing', function() {
        $('#content').empty(); 
    });
    
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
}

//Handles unready case for mouse and touch inputs.
function handleUnready()
{
    socket.emit('unready', masterRoomCode);
}