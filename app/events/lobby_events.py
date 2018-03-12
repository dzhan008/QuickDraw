from flask import request
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

@socketio.on('startGame')
def startGame(gameCode):
    game = flask_app.config['LobbyManager'].getGameManager(gameCode)
    game.setCompetitors()
    competitorSIDs = []
    for x in range(0, len(game.competitors)):
         competitorSIDs.append(game.activePlayers[game.competitors[x]].sid)
    helper.tellGroup('start_showdown', competitorSIDs)

@socketio.on('checkExistUser')
def checkExistUser(formData):
    print "check exists"
    gameState =  flask_app.config['LobbyManager'].checkExistingPlayer(formData['room_code'], formData['user'], request.sid)
    emit('playerState', gameState, room=request.sid)

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
    emit('serverMsg', message['user'] + " has joined", room=message['room_code'])

@socketio.on('playerLeave')
def playerLeave(message):
    flask_app.config['LobbyManager'].removePlayer(request.sid)
