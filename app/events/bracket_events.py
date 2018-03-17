from flask import request
from flask_socketio import send, emit
from .. import flask_app, socketio
from ..classes import helper, GameManager, LobbyManager

@socketio.on('gameReady')
def matchmaking():
#def matchmaking(gameCode):
    GMref = GameManager.GameManager("1234", 0)
#    reference = LobbyManager.getGameManager(gameCode)
    flask_app.config["LobbyManager"].createGame("0", "1234")
    reference = flask_app.config["LobbyManager"].getGameManager("1234")
    reference.createDummyChars()
    reference.choosePlayers()
    reference.validateEndGame()         
    print ("END!!!!!!!!!!: ")
    print (reference.validateEndGame())

