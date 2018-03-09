$(document).ready(function(){
    
//Mouse events
    $("#competitor_1").mousedown(function(){
        choiceOne();
    });

    $("#competitor_2").mousedown(function(){
        choiceTwo();
    });
//Touch events
    $("#competitor_1").on("touchstart", function(){
        choiceOne();
    });
    
    $("#competitor_2").on("touchstart", function(){
        choiceTwo();
    });
    
//This should avoid the context menu on chrome when pressing and holding.
    window.oncontextmenu = function(event) {
     event.preventDefault();
     event.stopPropagation();
     return false;
    };

});

function choiceOne()
{
    socket.emit('choiceOne');
    $('#MainText').html("Thanks for voting!");
}

function choiceTwo()
{
    socket.emit('choiceTwo');
    $('#MainText').html("Thanks for voting!");
}