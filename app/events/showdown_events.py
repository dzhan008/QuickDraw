from flask import request
from flask_socketio import send, emit
from .. import flask_app, socketio
from ..classes import helper

competitors = flask_app.config['competitors']
spectators = flask_app.config['spectators']

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

    flask_app.config['playersReady'] += 1
    #Check which player readied to display to host
    if request.sid == competitors[0]:
        playerReady = 'one'
    elif request.sid == competitors[1]:
        playerReady = 'two'

    emit('displayReady', {'data' : playerReady}, room=flask_app.config['host'])
    helper.tellGroupWithData('displayready', flask_app.config['playersReady'], competitors)
    if flask_app.config['playersReady'] == 2:
        x = helper.generateSuspenseTime()
        flask_app.config['showdown'] = True
        emit('startTimer', {'data': x}, room=flask_app.config['host'])

@socketio.on('unready')
def unready():

    global showdown
    playerUnready = ''
    flask_app.config['playersReady'] -= 1
    #Player let go early!
    if flask_app.config['showdown'] == True:
        helper.tellGroup('falseStart', competitors)
        emit('falseStart', room=flask_app.config['host'])
        #Handle fouls here
        flask_app.config['showdown'] = False
    #Check which player unreadied to display to host
    if request.sid == competitors[0]:
        playerUnready = 'one'
    elif request.sid == competitors[1]:
        playerUnready = 'two'

    emit('displayUnready', {'data' : playerUnready}, room=flask_app.config['host'])
    helper.tellGroupWithData('displayready', flask_app.config['playersReady'], competitors)

#Starting Phase Events

@socketio.on('startDrawing')
def startDrawing():
    flask_app.config['currentPrompt'] = helper.generatePrompt()
    helper.tellGroupWithData('drawingPhase', flask_app.config['currentPrompt'], competitors)

#Voting Phase Events

@socketio.on('startVoting')
def startVoting():
    helper.tellGroup('votingPhase', spectators)

@socketio.on('choiceOne')
def choiceOne():
    flask_app.config['playerOneVotes'] += 1

@socketio.on('choiceTwo')
def choiceTwo():
    flask_app.config['playerTwoVotes'] += 1

@socketio.on('calcRoundWinner')
def calcRoundWinner():
    if flask_app.config['playerOneVotes'] > flask_app.config['playerTwoVotes']:
        emit('displayRoundWinner', { 'data': competitors[0] }, room=flask_app.config['host'])
    elif flask_app.config['playerTwoVotes'] > flask_app.config['playerOneVotes']:
        emit('displayRoundWinner', { 'data' : competitors[1] }, room=flask_app.config['host'])
    else:
        emit('displayRoundWinner', { 'data' : 'No One'}, room=flask_app.config['host'])

