from app import create_app, socketio

HOST = '192.168.1.108'
PORT = 8888
app = create_app()

if __name__ == '__main__':
	socketio.run(app,host=HOST, port=PORT)
	#If you want to run this without socketio, replace the above line with the one below.
	#app.run(host=HOST, port=PORT)