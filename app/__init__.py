from flask import Flask, request
from firebase import firebase, FirebaseApplication, FirebaseAuthentication
from flask_socketio import SocketIO, send, emit
from classes.LobbyManager import LobbyManager 

socketio = SocketIO()
#Initialize the firebase database
firebase = FirebaseApplication('https://quick-draw-c995f.firebaseio.com', None)
authentication = FirebaseAuthentication('0y4WJyZ1Rc9FGUghX020kQupblZUA31oJzpxoHqo', 'dzhan008@ucr.edu', extra={'id' : 1})
firebase.authentication = authentication

#Variables for testing
clients = []
players = 0
playersReady = 0
playerOneVotes = 0;
playerTwoVotes = 0;
competitors = []
spectators = []
showdown = False
host = None
currentPrompt = None
LobbyManager = LobbyManager() 

def create_app():
    global flask_app
#This is the main flask application that will handle all the html rendering/routing.
    flask_app = Flask('flaskapp')
#This secret key is used for authentication purposes, mainly needed for WtForms
    flask_app.config['SECRET_KEY'] = "cs-179-quick-draw"
    #Assign variables to config object
    flask_app.config['debug'] = 0
    flask_app.config['competitors'] = competitors
    flask_app.config['players'] = players
    flask_app.config['playersReady'] = playersReady
    flask_app.config['playerOneVotes'] = playerOneVotes
    flask_app.config['playerTwoVotes'] = playerTwoVotes
    flask_app.config['spectators'] = spectators
    flask_app.config['showdown'] = showdown
    flask_app.config['host'] = host
    flask_app.config['currentPrompt'] = currentPrompt
    flask_app.config['LobbyManager'] = LobbyManager

    #Initialize the socketIO object
    socketio.init_app(flask_app)
    #MUST BE IMPORTED AFTER THE CREATION OF THE FLASK APP
    from routes import *
    from events import *
    return flask_app

@socketio.on('connect')
def handle_connect():
    clients.append(request.sid)
    print "Client connected"
    #emit('changeWeb', {'data': }, broadcast=True);

@socketio.on('disconnect')
def handle_disconnect():
    print "Client disconnected"
    clients.remove(request.sid)
    gameCode = LobbyManager.checkHostDisconnect(request.sid)
    if gameCode:
        emit('serverMsg', 'return', room=gameCode)
        return
    userName = LobbyManager.getNameFromSID(request.sid)
    hostSID = LobbyManager.removePlayer(request.sid)
    if userName != "":
        emit('playerLeave', userName, room=hostSID)






