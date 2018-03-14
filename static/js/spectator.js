$(document).ready(function(){

    socket = io.connect('http://' + document.domain + ':' + location.port );
    
    socket.on('connect', function() {
        console.log('Spectator connected.');
        socket.emit('setSpectator');
    });
    
    socket.on('votingPhase', function() {
        $.ajax({
            type: "POST",
            url: '/client_voting',
            success: function (data) {
                console.log(data)  // display the returned data in the console.
                $('#MainText').html(data);
            }
        });
    });
});