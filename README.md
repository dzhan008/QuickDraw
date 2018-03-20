# QuickDraw

This is a Jackbox-like game for CS179!

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

To run:

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
By default the IP address is 127.0.0.1 (localhost) at port 8888. Enjoy!

# Credits

Darren Houn: Programmer
Quynh Nguyen: Programmer, Artist
David Zhang: Programmer


