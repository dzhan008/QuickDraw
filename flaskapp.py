from flask import Flask, flash, render_template, Response, request, redirect, jsonify
from forms import LoginForm
from firebase import firebase, FirebaseApplication, FirebaseAuthentication
from flask_socketio import SocketIO, send, emit
from random import *

#This is the main flask application that will handle all the html rendering/routing.

flask_app = Flask('flaskapp')
#This secret key is used for authentication purposes, mainly needed for WtForms
flask_app.config['SECRET_KEY'] = "cs-179-quick-draw"

#Initialize the firebase database
firebase = FirebaseApplication('https://quick-draw-c995f.firebaseio.com', None)
authentication = FirebaseAuthentication('0y4WJyZ1Rc9FGUghX020kQupblZUA31oJzpxoHqo', 'dzhan008@ucr.edu', extra={'id' : 1})
firebase.authentication = authentication

#Initialize the socketIO object
socketio = SocketIO(flask_app)

#Variables
HOST = '10.25.3.89'
PORT = 8888
clients = []

#Main Page
#Currently renders a simple form for going into a game.
@flask_app.route('/index')
def index():
    form = LoginForm()
    return render_template('index.html', title='Home', form=form)

#Handles the login of a player for a game.
@flask_app.route('/index', methods=['GET', 'POST'])
def login():
    #Populate a new form with the input
    form = LoginForm(request.values)

    #Validate the input based off of the LoginForm class
    if form.validate_on_submit():
        #Put information of room into firebase
        putData = {'Room Code' : form.room_code.data, 'Name' : form.name.data }
        #firebase.put('/rooms', str(form.room_code.data), putData)
        #data = firebase.get('/rooms/ABCD/Name', None)
        #Render a sample html file that displays the username and room code
        #return jsonify (data={'message': 'Hello {}'.format(form.name.data)})
        return render_template('login.html', user=form.name.data, room_code=form.room_code.data)
    #Rerender the index html with error messages for the respective fields
    return render_template('index.html', title='Home', form=form)
@flask_app.route('/draw', methods=['GET', 'POST'])
def displayDrawingPhase():
    return render_template('drawingphase.html') 

@flask_app.route('/showdown')
def showdown():
    return render_template('showdown.html')

@flask_app.route('/showdown', methods =["GET" , "POST"])
def buttonPress():
    if request.method == "POST":
        return
    return

@socketio.on('connect')
def handle_connect():
    clients.append(request.sid)

@socketio.on('disconnect')
def handle_disconnect():
    clients.remove(request.sid)

playersReady = 0
showdown = False

@socketio.on('ready')
def ready(message):
    global playersReady
    global showdown
    playersReady += 1
    x = randint(3,8)
    broadcastWithData('displayready', playersReady)
    if playersReady == 2:
        showdown = True
        for playerid in clients:
            emit('response', {'data': x}, room=playerid)

@socketio.on('unready')
def unready():
    global playersReady
    global showdown
    playersReady -= 1
    #Player let go early!
    if showdown == True:
        broadcast('falseStart')
        showdown = False

    broadcastWithData('displayready', playersReady)

#Emits an event to all clients to a room
def broadcast(event):
    for playerid in clients:
        emit(event, room=playerid)

#Emits an event with some associated data to a room
def broadcastWithData(event, data):
    for playerid in clients:
        emit(event, {'data' : data}, room=playerid)

#Run the application.
socketio.run(flask_app,host=HOST, port=PORT)
#flask_app.run(host=HOST, port=PORT)
