const MAX_DRAWING_TIME = 5;
const MAX_VOTING_TIME = 10;
const phases = Object.freeze( 
{
    prePhase: 0,
    drawingPhase: 1,
    votingPhase: 2,
});

//Old clientside code for randomly setting a time, not sure if better to do it clientside than serverside
/*
var minTime = 2;
var maxTime = 10;
var timeLeft = Math.floor((Math.random() * (maxTime - minTime + 1) + minTime));
*/
var timeLeft = 0;
var timerTag = '#Timer';
var timerType = phases.prePhase;
var timerID;
var socket;

$(document).ready(function(){
    socket = io.connect('http://' + document.domain + ':' + location.port );
    socket.on('connect', function() {
        console.log('Host connected.');
        socket.emit('setHost');
    });
        
    //Grabs random time from server and starts timer
    socket.on('startTimer', function(msg){
        console.log(msg);
        timeLeft = parseInt(msg.data);
        timerID = setInterval(countdown, 1000);
        $('#top-text').html("STARTING SHOWDOWN IN");
        $('#press-screen').hide();
        $('#comp-one-ready').hide();
        $('#comp-two-ready').hide();
    });
    
    socket.on('displayReady', function(msg) {
        var competitor = '#comp-' + msg.data + '-ready';
        console.log(competitor);
        $(competitor).removeClass('notReady').addClass('ready');
    });
    
    socket.on('displayUnready', function(msg) {
        var competitor = '#comp-' + msg.data + '-ready';
        console.log(competitor);
        $(competitor).removeClass('ready').addClass('notReady');
    });
    //Stops timer due to false start on one of the client
    socket.on('falseStart', function(){
        clearTimeout(timerID);
        $('#top-text').html('Timer stopped due to false start.');
    });
    
    socket.on('displayRoundWinner', function(msg){
        $('#bottom-text').html("The winner is " + msg.data + "!"); 
    });

    $("button").mouseup(function(){
        var url = "{{ url_for('draw') }}"; // send the form data here.
        if(inGame) {
            $.ajax({
                type: "POST",
                url: '/draw',
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
    
});

//Countdown timer for all phases
function countdown() 
{
    if(timeLeft == 0)
    {
        //Turns off timer
        clearTimeout(timerID);
        var roomCode = $('#roomCode').html();
        console.log(roomCode);
        if(timerType == phases.prePhase)
        {
            //Create an audio object/promise and play it
            var audio = new Audio('static/audio/Cow.mp3');
            var playPromise = audio.play();

            if(playPromise !== undefined) {
                playPromise.then(function() {
                    
                }).catch(function(error) {
                    
                });
            }
            //Start the drawing phase for the clients, and also grab the main real time canvases of both clients
            socket.emit('startDrawing');
            $.ajax({
                type: "POST",
                url: '/host_canvas',
                data: JSON.stringify( {'roomCode' : $('#roomCode').html() }),
                contentType: 'application/json;charset=UTF-8',
                success: function (data) {
                    console.log(data)  // display the returned data in the console.
                    $('#Canvas').html(data);
                }
            });
            //Set up timer for the drawing phase
            $(timerTag).hide() //Hide big timer
            timerTag = '#top-text' //Move the timer to the top
            timeLeft = MAX_DRAWING_TIME;
            timerID = setInterval(countdown, 1000);
            timerType = phases.drawingPhase;
            console.log('Setting models...');
            //Set competitor sprites to drawing
            //modelOneIndex/modelTwoIndex are from the html file, defined because we need to get the indices from flask first
            $('#comp-one-model').attr('src', 'static/images/Draw' + modelOneIndex + '.png' );
            $('#comp-two-model').attr('src', 'static/images/Draw' + modelTwoIndex + '.png');
            
        } //May have to move this into a new function in the event competitors end earlier
        else if(timerType == phases.drawingPhase)
        {
            $('#bottom-text').html('Vote for the best drawing!');
            socket.emit('stopDrawing');
            $.ajax({
                type: "POST",
                url: '/host_voting',
                success: function (data) {
                    console.log(data)  // display the returned data in the console.
                    $('#Voting').html(data);
                }
            });
            
            //Starts the voting phase for the clients.
            socket.emit('startVoting');
            
            //Set up timer for the voting phase
            timeLeft = MAX_VOTING_TIME;
            timerID = setInterval(countdown, 1000);
            timerType = phases.votingPhase;
        }
        else if(timerType == phases.votingPhase)
        {
            socket.emit('calcRoundWinner');
            //Do some emit to find out the winner from the server and display it.
        }
    }
    else
    {
        $(timerTag).html(timeLeft);
        timeLeft--;
    }
}
