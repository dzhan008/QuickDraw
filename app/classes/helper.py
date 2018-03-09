from random import *
from .. import firebase, socketio

MIN_TIME = 3
MAX_TIME = 8

#Put all helper functions here

#Emits an event to all clients to a subset list of clients
def tellGroup(event, group):
    for clientid in group:
        socketio.emit(event, room=clientid)

#Emits an event with some associated data to a subset list of clients
def tellGroupWithData(event, data, group):
    for clientid in group:
        socketio.emit(event, {'data' : data}, room=clientid)

#Randomly pulls a word from firebase to be used a prompt.
def generatePrompt():
    promptData = firebase.get('/prompts', None)
    randId = randint(0, len(promptData) - 1)
    return promptData[randId]

def generateSuspenseTime():
	return randint(MIN_TIME, MAX_TIME)
