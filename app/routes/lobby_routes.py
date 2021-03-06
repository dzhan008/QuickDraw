from flask import render_template, request, jsonify, make_response, session
from ..classes import *
from .. import flask_app
import string
import random  

#Main Page
@flask_app.route('/')
def main():
    return render_template('index.html')

@flask_app.route('/index', methods=['GET', 'POST'])
def index():
    print "Returning Index"
    return render_template('index.html')

@flask_app.route('/home', methods=['GET', 'POST'])
def home():
    return render_template('home.html')

#Join Game Form Page
@flask_app.route('/join', methods=['GET', 'POST'])
def join():
    form = forms.LoginForm()
    return render_template('join.html', title='Home', form=form)

#Validate form values .
@flask_app.route('/login', methods=['GET', 'POST'])
def login():
    #Populate a new form with the input
    form = forms.LoginForm(request.values)
    #Validate the input based off of the LoginForm class
    if form.validate_on_submit():
        checkValid = flask_app.config['LobbyManager'] .roomValidation(form.room_code.data, form.name.data)
        if checkValid == 0:
            resp = make_response(render_template('login.html', user=form.name.data, room_code=form.room_code.data, char_select=form.char_select.data))
            return resp
        return jsonify(error=checkValid)
    #Rerender the index html with error messages for the respective fields
    return jsonify(error=4) #error4 is didn't fill out correctly

def randCode(size = 4):
    chars = string.ascii_uppercase + string.digits
    return ''.join(random.choice(chars) for _ in range(size))

#Create a game
@flask_app.route('/create', methods=['GET', 'POST'])
def create():
    gameCode = randCode()
    while (flask_app.config['LobbyManager'].checkDupGameCode(gameCode)):
        gameCode = randCode()
    #LobbyManager.createGame()
    return render_template('host_lobby.html', code=gameCode)
