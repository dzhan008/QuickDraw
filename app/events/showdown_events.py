from flask import request, session
from flask_socketio import send, emit
from .. import flask_app, socketio
from ..classes import helper
import sys

competitors = flask_app.config['competitors']
spectators = flask_app.config['spectators']
lobbyManager = flask_app.config['LobbyManager']

@socketio.on('setSpectator')
def setSpectator():
    spectators.append(request.sid)

#Prephase Events

@socketio.on('ready')
def ready(masterRoomCode):
    game = lobbyManager.getGameManager(masterRoomCode)
    if game.state == 2:
        playerReady = ''
        print 'Ready: ' + masterRoomCode
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
        #If both players have readied
        if players[game.competitors[0]].ready == True and players[game.competitors[1]].ready == True and game.showdownStarted == False:
            x = helper.generateSuspenseTime()
            players[game.competitors[0]].ready = False
            players[game.competitors[1]].ready = False
            game.showdownStarted = True
            #Create a prompt beforehand in case of false start
            game.currentPrompt = helper.generatePrompt()
            emit('startTimer', {'data': x}, room=game.host)
            print 'Player 1 Ready State: ' + str(players[game.competitors[0]].ready)
            print 'Player 2 Ready State: ' + str(players[game.competitors[1]].ready)
            sys.stdout.flush()
        else:
            print 'Player 1 Ready State: ' + str(players[game.competitors[0]].ready)
            print 'Player 2 Ready State: ' + str(players[game.competitors[1]].ready)
            sys.stdout.flush()

@socketio.on('unready')
def unready(masterRoomCode):
    game = lobbyManager.getGameManager(masterRoomCode)
    players = game.activePlayers
    competitorSIDs = game.getCompetitorSIDs()
    playerUnready = ''

    #Check which player unreadied to display to host
    if request.sid == competitorSIDs[0]:
        players[game.competitors[0]].ready = False
        playerUnready = 'one'
    elif request.sid == competitorSIDs[1]:
        players[game.competitors[1]].ready = False
        playerUnready = 'two'

    #This is a false start, therefore we stun the player.
    #We also immediately start the drawing phase.
    if game.state == 2 and game.showdownStarted == True:
        emit('falseStart', room=game.host)
        game.showdownStarted = False
        return
    elif game.state == 2:
        emit('displayUnready', {'data' : playerUnready}, room=game.host)
        return
    elif game.state == 3:
        emit('stun', room=request.sid)
        emit('displayStun', {'data' : playerUnready}, room=game.host)
        if request.sid == competitorSIDs[0]:
            emit('drawingPhase', {'data' : game.currentPrompt}, room=competitorSIDs[1]);
        else:
            emit('drawingPhase', {'data' : game.currentPrompt}, room=competitorSIDs[0]);
        game.state = 4
        game.showdownStarted = False
        emit('falseStart', room=game.host)
        return
    elif game.state == 4:
        emit('drawingPhase', {'data' : game.currentPrompt}, room=request.sid);

@socketio.on('showdown')
def showdown(masterRoomCode):
    game = lobbyManager.getGameManager(masterRoomCode)
    game.state = 3

#Drawing Phase Events

@socketio.on('startDrawing')
def startDrawing(masterRoomCode):
    game = lobbyManager.getGameManager(masterRoomCode)
    game.state = 4
    socketio.emit('displayPrompt', {'data' : game.currentPrompt}, room=game.host)

@socketio.on('canvasData')
def displayDrawing(json):
    game = lobbyManager.getGameManager(json['masterRoomCode'])
    competitorSIDs = game.getCompetitorSIDs()
    if request.sid == competitorSIDs[0]:
        emit('player1Data', json, room=game.host)
    else:
        emit('player2Data', json, room=game.host)

@socketio.on('unstun')
def unstun(masterRoomcode):
    game = lobbyManager.getGameManager(masterRoomcode)
    print 'Unstunning!'
    sys.stdout.flush()
    emit('drawingPhase', {'data' : game.currentPrompt}, room=request.sid)
    emit('displayUnstun', room=game.host)

#Voting Phase Events

@socketio.on('startVoting')
def startVoting(masterRoomCode):
    game = lobbyManager.getGameManager(masterRoomCode)
    game.state = 5
    helper.tellGroup('endDrawing', game.getCompetitorSIDs())
    helper.tellGroup('votingPhase', game.getAudienceSIDs())

@socketio.on('choiceOne')
def choiceOne(masterRoomCode):
    game = lobbyManager.getGameManager(masterRoomCode)
    game.playerOneVotes += 1
    checkVotes(game)

@socketio.on('choiceTwo')
def choiceTwo(masterRoomCode):
    game = lobbyManager.getGameManager(masterRoomCode)
    game.playerTwoVotes += 1
    checkVotes(game)

@socketio.on('calcRoundWinner')
def calcRoundWinner(masterRoomCode):
    game = lobbyManager.getGameManager(masterRoomCode)
    helper.tellGroup('endVoting', game.getAudienceSIDs())
    game.activePlayers[game.competitors[0]].updateHighestVote(game.playerOneVotes)
    game.activePlayers[game.competitors[0]].updateHighestVote(game.playerTwoVotes)
    emit('spectate_match', game.getAudienceSIDs())
    if game.playerOneVotes > game.playerTwoVotes:
        game.activePlayers[game.competitors[0]].points += 1;
        game.activePlayers[game.competitors[0]].updateWinStreak(True)
        game.activePlayers[game.competitors[1]].updateWinStreak(False)
        emit('displayRoundWinner', { 'data': game.activePlayers[game.competitors[0]].username, 
        'player1Votes': game.playerOneVotes, 'player2Votes': game.playerTwoVotes}, room=game.host)
    elif game.playerTwoVotes > game.playerOneVotes:
        game.activePlayers[game.competitors[1]].points += 1;
        game.activePlayers[game.competitors[1]].updateWinStreak(True)
        game.activePlayers[game.competitors[0]].updateWinStreak(False)
        emit('displayRoundWinner', { 'data' : game.activePlayers[game.competitors[1]].username, 
        'player1Votes': game.playerOneVotes, 'player2Votes': game.playerTwoVotes }, room=game.host)
    else:
        emit('displayRoundWinner', { 'data' : 'No One'}, room=game.host)
    game.resetPlayerVotes()

#Main event function that transitions the game from 3 key states:
#1. Moving to the end of the game
#2. Moving to the next set of players
#3. Moving to the scoreboard screen
@socketio.on('checkNextState')
def checkNextState(masterRoomCode):
    game = lobbyManager.getGameManager(masterRoomCode)
    if game.validateEndGame():
        #End the game
        emit('endGame', room=game.host)
    elif game.validateSameGamesPlayed():
        #Move to the next round
        emit('displayScoreboard', room=game.host)
        game.resetPlayerVotes()
    else:
        #Move to the next set of players
        emit('nextGame', room=game.host)
        game.resetPlayerVotes()

def checkVotes(game):
    game.currentVotes += 1
    if game.currentVotes == len(game.getAudienceSIDs()):
        game.currentVotes = 0
        emit('skipVoting', room=game.host)