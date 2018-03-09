from flask import render_template, request
from ..classes import *
from .. import flask_app

#Main Page
#Currently renders a simple form for going into a game.
@flask_app.route('/index')
def index():
    form = forms.LoginForm()
    return render_template('index.html', title='Home', form=form)

    #Handles the login of a player for a game.
@flask_app.route('/index', methods=['GET', 'POST'])
def login():
    #Populate a new form with the input
    form = forms.LoginForm(request.values)
    #Validate the input based off of the LoginForm class
    if form.validate_on_submit():
        #Render a sample html file that displays the username and room code
        return render_template('login.html', user=form.name.data, room_code=form.room_code.data)
    #Rerender the index html with error messages for the respective fields
    return render_template('index.html', title='Home', form=form)