from flask import render_template, request
from .. import flask_app
from ..classes import helper

#Mutable variables like lists/objects can be passed as a reference
competitors = flask_app.config['competitors']
lobbyManager = flask_app.config['LobbyManager']

@flask_app.route('/name')
def name():
    return render_template('name.html', user=request.cookies.get('roomCode'))
    #Test function to queue a host and two competitors together
@flask_app.route('/queue')
def queue():

    #Immutable primitive variables like ints and string cannot be placed into a new variable.
    #So, we must reference flask_app.config for the players integer I made.

    if flask_app.config['players'] == 0:
        flask_app.config['players'] += 1
        return render_template('host_showdown.html')
    elif flask_app.config['players'] < 3:
        flask_app.config['players'] += 1
        return render_template('client_showdown.html')
    return render_template('queue.html')

@flask_app.route('/host_showdown', methods=['GET', 'POST'])
def host():
    data = request.get_json()
    game = lobbyManager.getGameManager(data['roomCode'])
    game.setCompetitors()
    competitorSIDs = []
    competitorObjs = []
    #Loop through the current competitors and grab their names
    for i in range(0, len(game.competitors)):
        competitorSIDs.append(game.activePlayers[game.competitors[i]].sid)
        competitorObjs.append(game.activePlayers[game.competitors[i]])
    helper.tellGroup('start_showdown', competitorSIDs)
    return render_template('host_showdown.html', playerOne=competitorObjs[0].username, 
                          playerTwo=competitorObjs[1].username, 
                          modelOne=competitorObjs[0].imageIndex,
                          modelTwo=competitorObjs[1].imageIndex);

@flask_app.route('/client_showdown', methods=['GET', 'POST'])
def showdown():
    return render_template('client_showdown.html');

#Displays a client canvas for a player who needs to draw
@flask_app.route('/client_draw', methods=['GET', 'POST'])
def displayDrawingPhase():
    return render_template('client_canvas.html')

#Displays the canvases to be changed in real time to the host
@flask_app.route('/host_canvas', methods=['GET', 'POST'])
def displayHostCanvas():
    data = request.get_json()
    game = lobbyManager.getGameManager(data['roomCode'])
    return render_template('host_canvas.html', competitor_1=game.competitors[0], 
                          competitor_2=game.competitors[1])

@flask_app.route('/host_voting', methods=['GET', 'POST'])
def displayHostVoting():
    return render_template('host_voting.html')

@flask_app.route('/client_voting', methods=['GET', 'POST'])
def displayClientVoting():
    data = request.get_json()
    game = lobbyManager.getGameManager(data['roomCode'])
    return render_template('client_voting.html', competitor_1=game.activePlayers[game.competitors[0]].username, 
                          competitor_2=game.activePlayers[game.competitors[1]].username)

@flask_app.route('/host_scoreboard', methods=['GET', 'POST'])
def displayScoreboard():
    data = request.get_json()
    game = lobbyManager.getGameManager(data['roomCode'])
    return render_template('host_scoreboard.html', data=game.getPlayerPoints())