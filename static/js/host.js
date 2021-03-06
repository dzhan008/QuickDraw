var timeLeft = 0;
var timerTag = '#Timer';
var phases = Object.freeze( 
{
    prePhase: 0,
    suspensePhase: 1,
    drawingPhase: 2,
    waitingPhase: 3,
    votingPhase: 4,
    displayWinnerPhase: 5,
    scoreboardPhase: 6,
    transitionPhase: 7,
    loadingPhase: 8,
    endPhase: 9
});
var nextPhase = phases.prePhase;
var currentPhase = phases.prePhase;
var timerID;
var hostRoomCode;
var suspenseTime = 0;
var MAX_COUNTDOWN_TIME = 3; //3
var MAX_DRAWING_TIME = 10; //10
var MAX_WAIT_TIME = 2; //2
var MAX_VOTING_TIME = 15;  //15
var MAX_DISPLAY_WINNER_TIME = 3; //3
var MAX_DISPLAY_SCOREBOARD_TIME = 5; //5
var MAX_TRANSITION_TIME = 1;
var MAX_CREDITS_TIME = 30; //30

var stunnedPlayer = 'one';

var suspenseAudio = new Audio('static/audio/music/showdown.mp3');
var drawingAudio = new Audio('static/audio/music/drawing2.mp3');
var votingAudio = new Audio('static/audio/music/voting.mp3');


//Old clientside code for randomly setting a time, not sure if better to do it clientside than serverside
/*
var minTime = 2;
var maxTime = 10;
var timeLeft = Math.floor((Math.random() * (maxTime - minTime + 1) + minTime));
*/

$(document).ready(function(){
    
    if (window.hostRoomCode != undefined)
    {
        console.log('Warning: Duplicate host file detected.');
        hostRoomCode = $('#roomCode').html();
        console.log(hostRoomCode);
        return;
    }
    
    hostRoomCode = $('#roomCode').html();
    console.log(hostRoomCode);
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
        $('#comp-one-ready').css('opacity','0');
        $('#comp-two-ready').css('opacity', '0');
    });
    
    socket.on('displayReady', function(msg) {
        if(currentPhase == phases.prePhase)
        {
            var competitor = '#comp-' + msg.data + '-ready';
            console.log(competitor);
            $(competitor).removeClass('notReady').addClass('ready');
            playSFX('sfx_revolver_cock');
        }
    });
    
    socket.on('displayUnready', function(msg) {
        if(currentPhase == phases.prePhase)
        {
            var competitor = '#comp-' + msg.data + '-ready';
            console.log(competitor);
            $(competitor).removeClass('ready').addClass('notReady');
        }
    });
    //Stops timer due to false start on one of the client
    socket.on('falseStart', function(){
        clearTimeout(timerID);
        
        if(currentPhase == phases.suspensePhase)
        {
            setTimer(MAX_DRAWING_TIME, phases.drawingPhase);
            setupDrawPhase();
            //Play music
            var playPromise = drawingAudio.play();
            
            if(playPromise !== undefined) {
                playPromise.then(function() {
                    
                }).catch(function(error) {
                    
                });
            } 
            suspenseAudio.pause();
            suspenseAudio.currentTime = 0;
        }
        else if(currentPhase == phases.prePhase)
        {
            $('#top-text').html('Timer stopped due to false start.');
            currentPhase = phases.prePhase;
            $(timerTag).empty();
            $(timerTag).hide();
            $('#press-screen').show();
            $('#hostCanvas').empty();
            $('#comp-one-ready').removeClass('ready').addClass('notReady');
            $('#comp-two-ready').removeClass('ready').addClass('notReady');
            $('#comp-one-ready').css('opacity','1');
            $('#comp-two-ready').css('opacity', '1');
        }

    });
    
    socket.on('displayStun', function(player){
        stunnedPlayer = player.data;
        if(stunnedPlayer == "one")
        {
            //modelOneIndex/modelTwoIndex are from the html file, defined because we need to get the indices from flask first
            $('#comp-one-model').attr('src', 'static/images/Stun' + modelOneIndex + '.png' );
            $('#comp-two-model').attr('src', 'static/images/Draw' + modelTwoIndex + '.png');
        }
        else(stunnedPlayer == "two")
        {
            $('#comp-one-model').attr('src', 'static/images/Draw' + modelOneIndex + '.png');
            $('#comp-two-model').attr('src', 'static/images/Stun' + modelTwoIndex + '.png' );
        }
    });
    
    socket.on('displayUnstun', function(){
        if(stunnedPlayer == "one")
        {
            $('#comp-one-model').attr('src', 'static/images/Draw' + modelOneIndex + '.png' );   
        }
        else(stunnedPlayer == "two")
        {
            $('#comp-two-model').attr('src', 'static/images/Draw' + modelTwoIndex + '.png' );   
        }
    });
    
    socket.on('displayRoundWinner', function(msg){
        if (msg.data != 'No One')
        {
            displayVoteNumber(msg.player1Votes, msg.player2Votes);
            if (msg.data == $('#p1Span').html()) displayBulletHoles(context2);
            else displayBulletHoles(context1);
        }
        $('#top-text').html("The winner is " + msg.data + "!"); 
    });
    
    socket.on('displayPrompt', function(msg){
        $('#top-text').html('Prompt: ' + msg.data);
    });
    
    socket.on('nextGame', function(msg){
        nextPhase = phases.loadingPhase;
        
    });
    
    socket.on('displayScoreboard', function(){
        nextPhase = phases.scoreboardPhase;
    });
    
    socket.on('endGame', function(){
        nextPhase = phases.endPhase;
    });
    
    socket.on('skipVoting', function(){
        timeLeft = 0; 
    });

    $("button").mouseup(function(){
        var url = "{{ url_for('draw') }}"; // send the form data here.
        if(inGame) {
            $.ajax({
                type: "POST",
                url: '/draw',
                success: function (data) {
                    //console.log(data)  // display the returned data in the console.
                    $('body').html(data);
                }
            });
        }
        else {
            socket.emit('unready');   
        }
    });
    
});

function displayVoteNumber(p1Votes, p2Votes)
{
    context1.fillStyle = "black";
    context1.font = "bold 120px Summer";
    context1.fillText("" + p1Votes, (canvasWidth / 2) - 17, (canvasHeight / 2) + 8);
    context2.fillStyle = "black";
    context2.font = "bold 120px Summer";
    context2.fillText("" + p2Votes, (canvasWidth / 2) - 17, (canvasHeight / 2) + 8);

}
function displayBulletHoles(context)
{
    base_image = new Image();
    base_image.src = '../static/images/bulletHole.png';
    base_image.onload = function(){
        (function myLoop (i) {          
            setTimeout(function () {   
                var randomX=Math.min(canvasWidth-80,Math.random()*canvasWidth);
                var randomY=Math.min(canvasHeight-100,Math.random()*canvasHeight);
                context.drawImage(base_image, randomX, randomY);                
                playSFX('sfx_revolver_shot');
                if (--i) myLoop(i);
            }, 400)
        })(3);
    }
}

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

function setupDrawPhase()
{
    //Start the drawing phase for the clients, and also grab the main real time canvases of both clients
    socket.emit('startDrawing', hostRoomCode);
    $.ajax({
        type: "POST",
        url: '/host_canvas',
        data: JSON.stringify( {'roomCode' : $('#roomCode').html() }),
        contentType: 'application/json;charset=UTF-8',
        success: function (data) {
            //console.log(data)  // display the returned data in the console.
            $('#hostCanvas').html(data);
        }
    });
    
    console.log('Setting models...');
    //Revert the models scales and change their images
    $('#comp-one-model').css('transform', 'scaleX(-1)');
    $('#comp-two-model').css('transform', 'scaleX(1)');
}

//Set a new timer with the provided time and the phase to attach the timer to.
function setTimer(time, phase)
{
    timeLeft = time;
    timerID = setInterval(countdown, 1000);
    currentPhase = phase;
}

//Countdown timer for all phases
function countdown() 
{
    //Change the timer display
    if(currentPhase == phases.prePhase || currentPhase == phases.drawingPhase || currentPhase == phases.votingPhase && timeLeft != 0)
    {
        $(timerTag).html(timeLeft);    
    }
    
    if(currentPhase == phases.prePhase)
    {
        if(timeLeft == 3 || timeLeft == 2 || timeLeft == 1)
        {
            playSFX("sfx_revolver_spin");
        }
    }
    else if(currentPhase == phases.drawingPhase)
    {
        if(timeLeft == 3 || timeLeft == 2 || timeLeft == 1)
        {
            playSFX("sfx_countdown");
        }
    }
    
    if(timeLeft == 0)
    {
        //Turns off timer
        clearTimeout(timerID);
        if(currentPhase == phases.prePhase)
        {
            socket.emit('showdown', hostRoomCode);
            //Change the scale of the models to make them turn their backs
            $('#comp-one-model').css('transform', 'scaleX(1)');
            $('#comp-two-model').css('transform', 'scaleX(-1)');
            //Set up timer for the drawing phase
            $('#top-text').html("");
            
            $(timerTag).hide(); //Hide big timer
            timerTag = '#corner-timer'; //Move the timer to the top
            //Time left will now be the suspense time.
            $(timerTag).show();
            
            //Set up the new timer and change phases
            setTimer(suspenseTime, phases.suspensePhase);
            //Create an audio object/promise and play it
            var playPromise = suspenseAudio.play();

            if(playPromise !== undefined) {
                playPromise.then(function() {
                    
                }).catch(function(error) {
                    
                });
            }
        }
        else if(currentPhase == phases.suspensePhase)
        {
            //Create an audio object/promise and play it
            //var suspenseSound = playSFX('sfx_cow');
            
            //Create an audio object/promise and play it
            var suspenseSound = playSFX('sfx_cow');
            
            suspenseSound.addEventListener("ended", function() {
                var playPromise = drawingAudio.play();
    
                if(playPromise !== undefined) {
                    playPromise.then(function() {
                        
                    }).catch(function(error) {
                        
                    });
                }  
                suspenseAudio.pause();
                suspenseAudio.currentTime = 0;
            });
            
            setupDrawPhase();
            
            //Changes phases
            setTimer(MAX_DRAWING_TIME, phases.drawingPhase);
        } 
        else if(currentPhase == phases.drawingPhase)
        {
            playSFX("sfx_countdown_long2");
            drawingAudio.pause();
            drawingAudio.currentTime = 0;
            
            $('#top-text').html('Finished!');
            socket.emit('stopDrawing');
            
            //Set up timer for the voting phase
            setTimer(MAX_WAIT_TIME, phases.waitingPhase);
        }
        else if(currentPhase == phases.waitingPhase)
        {
            $('#top-text').html('Vote for the best drawing!');
            //Starts the voting phase for the clients.
            socket.emit('startVoting', hostRoomCode);
            votingAudio = playMusic('voting');
            //Set up timer for the voting phase
            setTimer(MAX_VOTING_TIME, phases.votingPhase);
            
            $('#comp-one-model').attr('src', 'static/images/Idle' + modelOneIndex + '.png' );
            $('#comp-two-model').attr('src', 'static/images/Idle' + modelTwoIndex + '.png');
        }
        else if(currentPhase == phases.votingPhase)
        {
            //Do some emit to find out the winner from the server and display it.
            socket.emit('calcRoundWinner', hostRoomCode);
            setTimer(MAX_DISPLAY_WINNER_TIME, phases.displayWinnerPhase);
        }
        else if(currentPhase == phases.displayWinnerPhase)
        {
            socket.emit('checkNextState', hostRoomCode);
            setTimer(MAX_TRANSITION_TIME, phases.transitionPhase);
            votingAudio.pause();
            votingAudio.currentTime = 0;
        }
        else if(currentPhase == phases.scoreboardPhase)
        {
            $.ajax({
                type:'POST',
                url:'/host_scoreboard',
                data: JSON.stringify( {'roomCode' : hostRoomCode }),
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
            setTimer(MAX_DISPLAY_SCOREBOARD_TIME, phases.transitionPhase);
            //Force the next phase to be loading since we want a fade transition
            //to it
            nextPhase = phases.loadingPhase;
        }
        else if(currentPhase == phases.transitionPhase)
        {
            fade();
            setTimer(MAX_TRANSITION_TIME, nextPhase);
        }
        else if(currentPhase == phases.loadingPhase)
        {
            console.log(hostRoomCode);
            $.ajax({
                type:'POST',
                url:'/host_showdown',
                data: JSON.stringify( {'roomCode' : hostRoomCode }),
                contentType: 'application/json;charset=UTF-8',
                success: function(data)
                {
                    //Do an error check if there isn't enough players
                    $('#showdown').html(data);
                    $('body').removeClass('scoreboardBG');
                    $('body').addClass('home');
                    $('#roomCode').html(hostRoomCode);
                    $('#hostCanvas').empty();
                    unfade();
                }
            });
            //Start the new round here.
            currentPhase = phases.prePhase;
        }
        else if(currentPhase == phases.endPhase)
        {
            //Declare the winner here, but make sure to grab stats in flask route
            $.ajax({
                type:'POST',
                url:'/host_finale',
                data: JSON.stringify( {'roomCode' : hostRoomCode }),
                contentType: 'application/json;charset=UTF-8',
                success: function(data)
                {
                    //Do an error check if there isn't enough players
                    $('#showdown').html(data);
                    $('body').removeClass('scoreboardBG');
                    $('body').addClass('home');
                    $('#roomCode').html(hostRoomCode);
                    $('#hostCanvas').empty();
                    unfade();
                }
            });
            setTimer(MAX_CREDITS_TIME, phases.bootPhase)
        }
        else if(currentPhase == phases.bootPhase)
        {
            socket.emit('disconnectGame', hostRoomCode);
            currentPhase = phases.prePhase;
        }
    }
    else
    {
        timeLeft--;
    }

}
