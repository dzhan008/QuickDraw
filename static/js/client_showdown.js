var inGame = false;
var displayText = document.getElementById('MainText');
var prompt = "";
$(document).ready(function(){

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