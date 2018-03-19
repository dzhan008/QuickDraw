from flask import request, session
from flask_socketio import send, emit
from .. import flask_app, socketio
from ..classes import helper

competitors = flask_app.config['competitors']
spectators = flask_app.config['spectators']
lobbyManager = flask_app.config['LobbyManager']

@socketio.on('setSpectator')
def setSpectator():
    spectators.append(request.sid)

@socketio.on('ready')
def ready(masterRoomCode):
    playerReady = ''
    print 'Ready: ' + masterRoomCode
    game = lobbyManager.getGameManager(masterRoomCode)
    players = game.activePlayers
    competitorSIDs = game.getCompetitorSIDs()
    #Check which player readied to display to host
    if request.sid == competitorSIDs[0]:
        playerReady = 'one'
        players[game.competitors[0]].ready = True
    elif request.sid == competitorSIDs[1]:
        playerReady = 'two'
        players[game.competitors[1]].ready = True

    emit('displayReady', {'data' : playerReady}, room=game.host)
    if players[game.competitors[0]].ready == True and players[game.competitors[1]].ready == True:
        players[game.competitors[0]].ready = False
        players[game.competitors[1]].ready = False
        x = helper.generateSuspenseTime()
        game.state = 3
        emit('startTimer', {'data': x}, room=game.host)

@socketio.on('unready')
def unready(masterRoomCode):
    game = lobbyManager.getGameManager(masterRoomCode)
    players = game.activePlayers
    competitorSIDs = game.getCompetitorSIDs()
    playerUnready = ''
    #Player let go early!
    if game.state == 3:
        helper.tellGroup('falseStart', competitors)
        emit('falseStart', room=game.host)
        game.state = 2
        #Handle fouls here
        game.showdownStarted = False

    #Check which player unreadied to display to host
    if request.sid == competitorSIDs[0]:
        players[game.competitors[0]].ready = False
        playerUnready = 'one'
    elif request.sid == competitorSIDs[1]:
        players[game.competitors[1]].ready = False
        playerUnready = 'two'
    if game.state == 2:
        emit('displayUnready', {'data' : playerUnready}, room=game.host)
    if game.state == 4:
        emit('drawingPhase', {'data' : game.currentPrompt}, room=request.sid);

#Starting Phase Events

@socketio.on('startDrawing')
def startDrawing(masterRoomCode):
    game = lobbyManager.getGameManager(masterRoomCode)
    game.currentPrompt = helper.generatePrompt()
    game.state = 4

@socketio.on('canvasData')
def displayDrawing(json):
    game = lobbyManager.getGameManager(json['masterRoomCode'])
    competitorSIDs = game.getCompetitorSIDs()
    if request.sid == competitorSIDs[0]:
        emit('player1Data', json, room=game.host);
    else:
        emit('player2Data', json, room=game.host);

#Voting Phase Events

@socketio.on('startVoting')
def startVoting(masterRoomCode):
    game = lobbyManager.getGameManager(masterRoomCode)
    game.state = 5
    helper.tellGroup('endDrawing', game.getCompetitorSIDs())
    helper.tellGroup('votingPhase', game.getAudienceSIDs())

@socketio.on('choiceOne')
def choiceOne():
    flask_app.config['playerOneVotes'] += 1

@socketio.on('choiceTwo')
def choiceTwo():
    flask_app.config['playerTwoVotes'] += 1

@socketio.on('calcRoundWinner')
def calcRoundWinner(masterRoomCode):
    game = lobbyManager.getGameManager(masterRoomCode)
    if flask_app.config['playerOneVotes'] > flask_app.config['playerTwoVotes']:
        game.activePlayers[game.competitors[0]].points += 1;
        emit('displayRoundWinner', { 'data': game.activePlayers[game.competitors[0]].username }, room=game.host)
    elif flask_app.config['playerTwoVotes'] > flask_app.config['playerOneVotes']:
        game.activePlayers[game.competitors[1]].points += 1;
        emit('displayRoundWinner', { 'data' : game.activePlayers[game.competitors[1]].username }, room=game.host)
    else:
        emit('displayRoundWinner', { 'data' : 'No One'}, room=game.host)

@socketio.on('checkNextState')
def checkNextState(masterRoomCode):
    game = lobbyManager.getGameManager(masterRoomCode)
    if game.roundCount == game.roundMax:
        emit('endGame', room=game.host)
    else:
        emit('displayScoreboard', room=game.host)
        game.roundCount += 1