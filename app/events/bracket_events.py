from flask import request
from flask_socketio import send, emit
from .. import flask_app, socketio
from ..classes import helper

#@socketio.on('gameReady')
@flask_app.route('/matchmaking')
def matchmaking(gameCode):
    reference = LobbyManager.getGameManager(gameCode)
    reference.choosePlayers()
         
