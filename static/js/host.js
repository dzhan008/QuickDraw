var timeLeft = 0;
var timerTag = '#Timer';
const phases = Object.freeze( 
{
    prePhase: 0,
    suspensePhase: 1,
    drawingPhase: 2,
    votingPhase: 3,
    displayWinnerPhase: 4,
    scoreboardPhase: 5,
    transitionPhase: 6,
    loadingPhase: 7,
    endPhase: 8
});
var timerType = phases.prePhase;
var timerID;
var roomCode;
var suspenseTime = 0;
var MAX_COUNTDOWN_TIME = 5;
var MAX_DRAWING_TIME = 10;
var MAX_VOTING_TIME = 15;
var MAX_DISPLAY_WINNER_TIME = 5;
var MAX_DISPLAY_SCOREBOARD_TIME = 5;
var MAX_TRANSITION_TIME = 1;
var MAX_CREDITS_TIME = 15;


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
        suspenseTime = parseInt(msg.data);
        timeLeft = MAX_COUNTDOWN_TIME;
        timerID = setInterval(countdown, 1000);
        timerTag = '#Timer';
        $('#top-text').html("STARTING SHOWDOWN IN");
        $(timerTag).show();
        $('#press-screen').hide();
        $('#comp-one-ready').attr('opacity','0');
        $('#comp-two-ready').attr('opacity', '0');
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
        $('#hostCanvas').empty();
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
    //Change the timer display
    if(timerType == phases.prePhase || timerType == phases.drawingPhase || timerType == phases.votingPhase)
    {
        $(timerTag).html(timeLeft);    
    }
    if(timeLeft == 0)
    {
        //Turns off timer
        clearTimeout(timerID);
        if(timerType == phases.prePhase)
        {
            //Change the scale of the models to make them turn their backs
            $('#comp-one-model').css('transform', 'scaleX(1)');
            $('#comp-two-model').css('transform', 'scaleX(-1)');
            //Set up timer for the drawing phase
            $(timerTag).hide(); //Hide big timer
            timerTag = '#top-text'; //Move the timer to the top
            //Time left will now be the suspense time.
            timeLeft = suspenseTime;
            timerID = setInterval(countdown, 1000);
            timerType = phases.suspensePhase;
        }
        else if(timerType == phases.suspensePhase)
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
            socket.emit('startDrawing', roomCode);
            $.ajax({
                type: "POST",
                url: '/host_canvas',
                data: JSON.stringify( {'roomCode' : $('#roomCode').html() }),
                contentType: 'application/json;charset=UTF-8',
                success: function (data) {
                    console.log(data)  // display the returned data in the console.
                    $('#hostCanvas').html(data);
                }
            });
            
            console.log('Setting models...');
            //modelOneIndex/modelTwoIndex are from the html file, defined because we need to get the indices from flask first
            $('#comp-one-model').attr('src', 'static/images/Draw' + modelOneIndex + '.png' );
            $('#comp-two-model').attr('src', 'static/images/Draw' + modelTwoIndex + '.png');
            
            //Revert the models scales and change their images
            $('#comp-one-model').css('transform', 'scaleX(-1)');
            $('#comp-two-model').css('transform', 'scaleX(1)');
            
            //Changes phases
            timeLeft = MAX_DRAWING_TIME;
            timerID = setInterval(countdown, 1000);
            timerType = phases.drawingPhase;
            
        } 
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
            socket.emit('startVoting', roomCode);
            
            //Set up timer for the voting phase
            timeLeft = MAX_VOTING_TIME;
            timerID = setInterval(countdown, 1000);
            timerType = phases.votingPhase;
        }
        else if(timerType == phases.votingPhase)
        {
            //Do some emit to find out the winner from the server and display it.
            socket.emit('calcRoundWinner', roomCode);
            timeLeft = MAX_DISPLAY_SCOREBOARD_TIME;
            timerID = setInterval(countdown, 1000);
            timerType = phases.displayWinnerPhase;
        }
        else if(timerType == phases.displayWinnerPhase)
        {
            socket.emit('checkNextState', roomCode);
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
                    $('#hostCanvas').empty();
                    unfade();
                }
            });
            timeLeft = MAX_DISPLAY_SCOREBOARD_TIME;
            timerID = setInterval(countdown, 1000);
            timerType = phases.transitionPhase;
        }
        else if(timerType == phases.transitionPhase)
        {
            fade();
            timerLeft = MAX_TRANSITION_TIME;
            timerID = setInterval(countdown, 1000);
            timerType = phases.loadingPhase;
        }
        else if(timerType == phases.loadingPhase)
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
                    unfade();
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
            timerLeft = MAX_CREDITS_TIME;
            timerID = setInterval(countdown, 1000);
            //timerType = phases.bootPhase;
        }
        else if(timerType == phases.bootPhase)
        {
            $.ajax({
            type:'POST',
            url:'/index',
            success: function(data)
            {
                socket.emit('disconnectGame', roomCode);
                $('body').html(data);
            }
            });
        }
    }
    else
    {
        timeLeft--;
    }

}
