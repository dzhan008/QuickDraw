var timeLeft = 0;
var timerTag = '#Timer';
const phases = Object.freeze( 
{
    prePhase: 0,
    drawingPhase: 1,
    votingPhase: 2,
    scoreboardPhase: 3,
    endPhase: 4
});
var timerType = phases.prePhase;
var timerID;
var roomCode;

var MAX_VOTING_TIME = 5;
var MAX_DRAWING_TIME = 5;



//Old clientside code for randomly setting a time, not sure if better to do it clientside than serverside
/*
var minTime = 2;
var maxTime = 10;
var timeLeft = Math.floor((Math.random() * (maxTime - minTime + 1) + minTime));
*/

$(document).ready(function(){
    
    roomCode = $('#roomCode').html();
        
    //Grabs random time from server and starts timer
    socket.on('startTimer', function(msg){
        console.log(msg);
        timeLeft = parseInt(msg.data);
        timerID = setInterval(countdown, 1000);
        timerTag = '#Timer';
        $('#top-text').html("STARTING SHOWDOWN IN");
        $(timerTag).show();
        $('#press-screen').hide();
        //$('#comp-one-ready').hide();
        //$('#comp-two-ready').hide();
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
        $(timerTag).empty();
        $(timerTag).hide();
        $('#press-screen').show();
        $('#Canvas').empty();
        timerType = phases.prePhase;
        $('#comp-one-ready').removeClass('ready').addClass('notReady');
        $('#comp-two-ready').removeClass('ready').addClass('notReady');
    });
    
    socket.on('displayRoundWinner', function(msg){
        $('#bottom-text').html("The winner is " + msg.data + "!"); 
    });
    
    socket.on('displayScoreboard', function(){
        //Set up timer for the scoreboard transition
        timeLeft = 1;
        timerID = setInterval(countdown, 1000);
        timerType = phases.scoreboardPhase;
    });
    
    socket.on('endGame', function(){
        timeLeft = 1;
        timerID = setInterval(countdown, 1000);
        timerType = phases.endPhase;
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

function fade()
{
    $('.overlay').animate({
            opacity: 1,
        }, 1000, function() {
    });

}

function unfade()
{
    $('.overlay').animate({
            opacity: 0,
        }, 1000, function() {
                        // Animation complete.
    });
}
//Countdown timer for all phases
function countdown() 
{
    if(timeLeft == 0)
    {
        //Turns off timer
        clearTimeout(timerID);
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
            //Do some emit to find out the winner from the server and display it.
            socket.emit('calcRoundWinner');
            //END GAME SOMEWHERE HERE
            //TODO:
            //HAVE TWO SOCKET FUNCTIONS TO CHANGE TIMERTYPE DEPENDING ON IF GAME IS OVER NOT
            fade();
        }
        else if(timerType == phases.scoreboardPhase)
        {
            $.ajax({
                type:'POST',
                url:'/host_scoreboard',
                data: JSON.stringify( {'roomCode' : roomCode }),
                contentType: 'application/json;charset=UTF-8',
                success: function(data)
                {
                    $('body').removeClass('home');
                    $('body').addClass('scoreboardBG');
                    $('#showdown').html(data);
                    unfade();
                }
            });
            timeLeft = 5;
            timerID = setInterval(countdown, 1000);
            timerType = phases.transitionPhase;
        }
        else if(timerType == phases.transitionPhase)
        {
            console.log(roomCode);
            $.ajax({
                type:'POST',
                url:'/host_showdown',
                data: JSON.stringify( {'roomCode' : roomCode }),
                contentType: 'application/json;charset=UTF-8',
                success: function(data)
                {
                    //Do an error check if there isn't enough players
                    $('#showdown').html(data);
                    $('body').removeClass('scoreboardBG');
                    $('body').addClass('home');
                    $('#roomCode').html(roomCode);
                }
            });
            //Start the new round here.
            timerType = phases.prePhase;
        }
        else if(timerType == phases.endPhase)
        {
            //Declare the winner here, but make sure to grab stats in flask route
            $.ajax({
                type:'POST',
                url:'/host_finale',
                data: JSON.stringify( {'roomCode' : roomCode }),
                contentType: 'application/json;charset=UTF-8',
                success: function(data)
                {
                    //Do an error check if there isn't enough players
                    $('#showdown').html(data);
                    $('body').removeClass('scoreboardBG');
                    $('body').addClass('home');
                    $('#roomCode').html(roomCode);
                    unfade();
                }
            });
        }
    }
    else
    {
        if(timerType == phases.prePhase || timerType == phases.drawingPhase || timerType == phases.votingPhase)
        {
            $(timerTag).html(timeLeft);    
        }
        timeLeft--;
    }
}
