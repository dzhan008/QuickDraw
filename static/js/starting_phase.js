var minTime = 2;
var maxTime = 10;
var timeLeft = Math.floor((Math.random() * (maxTime - minTime + 1) + minTime));
var bang = document.getElementById('MainText');
var timerID;
var socket;
var inGame = false;
$(document).ready(function(){

    socket = io.connect('http://' + document.domain + ':' + location.port );
    
    socket.on('connect', function() {
        
        console.log('Emmitted message.');
    });
    
    socket.on('response', function(msg){
        console.log(msg);
        timeLeft = parseInt(msg.data);
        timerID = setInterval(countdown, 1000);
    });
    
    socket.on('displayready', function(msg) {
        console.log('Incrementing Ready counter.');
        document.getElementById('PlayersReady').innerHTML = msg.data + " Players Ready";
    });
    
    //Handles case that someone let go of the screen too early.
    socket.on('falseStart', function() {
        clearInterval(timerID);
        console.log('False Start!');
        bang.innerHTML = 'Someone let go early! False start!';
    });
    //Mouse events
    $("button").mousedown(function(){
        socket.emit('ready', {data: 'I\'m connected!'});
    });

    $("button").mouseup(function(){
        socket.emit('unready')
    });
    //Touch events
    $("button").on("touchstart", function(){
        socket.emit('ready', {data: 'I\'m connected!'});
    });
    
    $("button").on("touchend", function(){
        var url = "{{ url_for('draw') }}"; // send the form data here.
        if(inGame) {
            //socket.emit('drawingPhase');
            $.ajax({
                type: "POST",
                url: '/draw',
                //data: ,
                success: function (data) {
                    console.log(data)  // display the returned data in the console.
                    $('body').html(data);
                }
            });
        }
        else {
            socket.emit('unready');   
        }
    }); 
    
    //This should avoid the context menu on chrome when pressing and holding.
    window.oncontextmenu = function(event) {
     event.preventDefault();
     event.stopPropagation();
     return false;
};
    
    
});


function countdown() 
{
    if(timeLeft == 0)
    {
        clearTimeout(timerID);
        inGame = true;
        bang.innerHTML = 'BANG!';
    }
    else
    {
        bang.innerHTML = timeLeft + ' seconds remaining';
        timeLeft--;
    }
}