from flask import request, session
from flask_socketio import send, emit
from .. import flask_app, socketio
from ..classes import helper

competitors = flask_app.config['competitors']
spectators = flask_app.config['spectators']
lobbyManager = flask_app.config['LobbyManager']

@socketio.on('setHost')
def setHost():
    flask_app.config['host'] = request.sid

@socketio.on('setCompetitor')
def setCompetitor():
    competitors.append(request.sid)

@socketio.on('setSpectator')
def setSpectator():
    spectators.append(request.sid)

@socketio.on('ready')
def ready():
    playerReady = ""
    game = lobbyManager.getGameManager(lobbyManager.UsersDict[request.sid])
    competitorSIDs = game.getCompetitorSIDs()
    flask_app.config['playersReady'] += 1
    #Check which player readied to display to host
    if request.sid == competitorSIDs[0]:
        playerReady = 'one'
    elif request.sid == competitorSIDs[1]:
        playerReady = 'two'

    emit('displayReady', {'data' : playerReady}, room=game.host)
    helper.tellGroupWithData('displayready', flask_app.config['playersReady'], competitorSIDs)
    if flask_app.config['playersReady'] == 2:
        x = helper.generateSuspenseTime()
        flask_app.config['showdown'] = True
        emit('startTimer', {'data': x}, room=game.host)

@socketio.on('unready')
def unready():

    global showdown
    game = lobbyManager.getGameManager(lobbyManager.UsersDict[request.sid])
    competitorSIDs = game.getCompetitorSIDs()
    playerUnready = ''
    flask_app.config['playersReady'] -= 1
    #Player let go early!
    if flask_app.config['showdown'] == True:
        helper.tellGroup('falseStart', competitors)
        emit('falseStart', room=game.host)
        #Handle fouls here
        flask_app.config['showdown'] = False
    #Check which player unreadied to display to host
    if request.sid == competitorSIDs[0]:
        playerUnready = 'one'
    elif request.sid == competitorSIDs[1]:
        playerUnready = 'two'

    emit('displayUnready', {'data' : playerUnready}, room=game.host)
    helper.tellGroupWithData('displayready', flask_app.config['playersReady'], competitorSIDs)

#Starting Phase Events

@socketio.on('startDrawing')
def startDrawing():
    game = lobbyManager.getGameManager(lobbyManager.UsersDict[request.sid])
    flask_app.config['currentPrompt'] = helper.generatePrompt()
    helper.tellGroupWithData('drawingPhase', flask_app.config['currentPrompt'], game.getCompetitorSIDs())

@socketio.on('canvasData')
def displayDrawing(json):
    game = lobbyManager.getGameManager(lobbyManager.UsersDict[request.sid])
    competitorSIDs = game.getCompetitorSIDs()
    if request.sid == competitorSIDs[0]:
        emit('player1Data', json, room=game.host);
    else:
        emit('player2Data', json, room=game.host);

#Voting Phase Events

@socketio.on('startVoting')
def startVoting():
    game = lobbyManager.getGameManager(lobbyManager.UsersDict[request.sid])
    helper.tellGroup('votingPhase', game.getAudienceSIDs())

@socketio.on('choiceOne')
def choiceOne():
    flask_app.config['playerOneVotes'] += 1

@socketio.on('choiceTwo')
def choiceTwo():
    flask_app.config['playerTwoVotes'] += 1

@socketio.on('calcRoundWinner')
def calcRoundWinner():
    game = lobbyManager.getGameManager(lobbyManager.UsersDict[request.sid])
    competitorSIDs = game.getCompetitorSIDs()
    if flask_app.config['playerOneVotes'] > flask_app.config['playerTwoVotes']:
        emit('displayRoundWinner', { 'data': competitorSIDs[0] }, room=game.host)
    elif flask_app.config['playerTwoVotes'] > flask_app.config['playerOneVotes']:
        emit('displayRoundWinner', { 'data' : competitorSIDs[1] }, room=game.host)
    else:
        emit('displayRoundWinner', { 'data' : 'No One'}, room=game.host)

