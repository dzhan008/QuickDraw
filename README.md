# QuickDraw

It is 1812. Right in the outskirts of town stands you and your opponent. You are gripping your holster tightly, squaring off with your rival waiting for the cue. Time passes, and you cannot remain any longer until-

BANG!

You unleash a pen and paper from your holster. The top of the paper reads “Gun” and you quickly start sketching out the drawing. You are frantically tracing your art, making sure that it is perfect. Just one more stroke and then it is complete!

RING!

Time is up. You both stop and hand your drawings to the referee who shows them to the audience. The audience cheers loudly for yours, and the duel has been won. You sigh in relief and blow on your notepad before putting it back to your holster.

Welcome to Quick Draw.

Quick draw is a fun party game that involves quick reflexes and hilarious drawings! Face off in an intense one-on-one western showdown against your friends, but instead of drawing your guns, you actually have to draw! Other players will vote on who had the best “quick draw”. All you need is your smartphone. Need at least 3 players.

Want to play now? Click [here](https://quick-draw-game.herokuapp.com/)!

# Creating a new Virtual Environment

Before you can run the application, you must use a virtual environment. You can install it with pip:

```sh
pip install virtualenv
```

Then, run this command to create the environment:

```sh
virtualenv --python=../../Python27/python.exe VENV_NAME
```

**This project requires python 2.7.14 to run.** You can change the directory to any python directory for specific versions or remove --python to use the default version.

To run, make sure you are in the directory where your virtual environment is located. Then enter this command:

```sh
source VENV_NAME/Scripts/activate 
```

# How to Run Application

Make sure you have the following modules installed:
flask
flask-wtf
flask_socketio
python-firebase


Then run:
```sh
python quickdraw.py
```
By default the IP address is 127.0.0.1 (localhost) at port 8888. Change the host and port settings in quickdraw.py. Make sure all clients connect to the exact address and port. Enjoy!

# How to Play

***Better instructions coming soon!***

You can go onto the game by entering the IP address specified by the flask module. You can choose to either create a game or join one. Note that to play a game, one client must create a game. This client is known as the **host**.

Once a host is made, a room code is generated. Other clients can join the game using that room code as well as set their name and avatar.

When everyone is ready, the host can start the game. Afterwards, the game will pit two players into a **showdown**.

Two players will have their screens changed, and they will be prompted to touch/click on their screen. Both players must press and hold on it to ready up. Once they do so, they must not let go until a signal is heard. This will move onto our **drawing phase**.

During the drawing phase, the two competitors must draw as fast as possible with the given prompt. This will be displayed onto the host's screen as well as the drawings in real time. You are given a limited time to draw, so draw fast!

After time is up, the other players who did not compete as well as the spectators may vote on the better drawing. The one with the most votes wins the round!

The game will play until everyone has played a certain amount of games. The player with the most points wins!

# Credits

Darren Houn: Programmer

Quynh Nguyen: Programmer, Artist

David Zhang: Programmer


