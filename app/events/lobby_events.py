from flask import request, session
from flask_socketio import send, emit, join_room, leave_room
from .. import flask_app, socketio
from ..classes import helper
from ..classes import LobbyManager, Player

@socketio.on('createGame')
def createGame(gameCode):
    flask_app.config['LobbyManager'].createGame(request.sid, gameCode)
    join_room(gameCode)
    return

@socketio.on('disconnectGame')
def dcGame(gameCode):
    flask_app.config['LobbyManager'].removeGame(gameCode)
    flask_app.config['LobbyManager'].printGameInfo()
    emit('serverMsg', 'return', room=gameCode)
    return
    #take all the people in the room back to the home screen
    #remove the game

@socketio.on('checkExistUser')
def checkExistUser(formData):
    print "check exists"
    gameState =  flask_app.config['LobbyManager'].checkExistingPlayer(formData['room_code'], formData['user'], request.sid)
    isCompetitor = 0

    #if there are no registered user of that name yet
    #or if the game is still in the lobby
    if gameState == 0 or gameState == 1:
        emit('playerState', {'gameState': gameState, 'isCompetitor': isCompetitor}, room=request.sid)
        return
    elif gameState > 1: #check if the player is a competitor
        game = flask_app.config['LobbyManager'].getGameManager(formData['room_code']);
        competitorSIDs = game.getCompetitorSIDs()
        if request.sid in competitorSIDs: #if competitor
            print "isCompetitor"
            if gameState == 2 or gameState == 3: #prephase and showdown
                emit('start_showdown')
            elif gameState == 4: #drawing phase
                emit('drawingPhase', {'data' : game.currentPrompt})
            elif gameState == 5: #voting phase
                emit('spectate_match') 
        else:
            print "spectator"
            if gameState == 5: #voting phase
                emit('votingPhase')
            else:
                emit('spectate_match')




@socketio.on('playerJoin')
def playerJoin(message):
    if flask_app.config['LobbyManager'].checkDupUsername(message['room_code'], message['user']):
            return
    newPlayer = Player.Player(request.sid, message['user'], message['char_select'])
    flask_app.config['LobbyManager'].addPlayer(message['room_code'], newPlayer)
    join_room(message['room_code'])
    hostSID = flask_app.config['LobbyManager'].getHostSID(message['room_code']);
    if hostSID == 0:
        print "Error in finding hostSID in playerJoin"
        return

    emit('playerJoin', {'username': message['user'], 'charIndex': message['char_select']}, room=hostSID)
    emit('serverMsg', flask_app.config['LobbyManager'].UsersDict[request.sid] + " has joined", room=message['room_code'])

@socketio.on('playerLeave')
def playerLeave(message):
    flask_app.config['LobbyManager'].removePlayer(request.sid)
