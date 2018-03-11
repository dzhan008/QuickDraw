from flask import render_template
from .. import flask_app

#Mutable variables like lists/objects can be passed as a reference
competitors = flask_app.config['competitors']

@flask_app.route('/name')
def name():
    return render_template('name.html', user=competitors)
#Displays a client canvas for a player who needs to draw
@flask_app.route('/draw', methods=['GET', 'POST'])
def displayDrawingPhase():
    return render_template('client_canvas.html')

#Displays the canvases to be changed in real time to the host
@flask_app.route('/host_canvas', methods=['GET', 'POST'])
def displayHostCanvas():
    return render_template('host_canvas.html', competitor_1=competitors[0], competitor_2=competitors[1])

@flask_app.route('/host_voting', methods=['GET', 'POST'])
def displayHostVoting():
    return render_template('host_voting.html')

@flask_app.route('/client_voting', methods=['GET', 'POST'])
def displayClientVoting():
    return render_template('client_voting.html', competitor_1=competitors[0], competitor_2=competitors[1])

    #Test function to queue a host and two competitors together
@flask_app.route('/queue')
def queue():

    #Immutable primitive variables like ints and string cannot be placed into a new variable.
    #So, we must reference flask_app.config for the players integer I made.

    if flask_app.config['players'] == 0:
        flask_app.config['players'] += 1
        return render_template('host.html')
    elif flask_app.config['players'] < 3:
        flask_app.config['players'] += 1
        return render_template('showdown.html')
    return render_template('queue.html')