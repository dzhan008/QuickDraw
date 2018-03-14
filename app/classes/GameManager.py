class GameManager:
	def __init__(self, gameCode, hostSID):
		#------House keeping-----#
		self.gameCode = gameCode #To join the game and the roomid for emit
		self.host = hostSID #Host client
		self.activePlayers = [] #Player Object
		self.dcPlayers = [] #Index
                self.playersChoose = [] #Index
		self.competitors = [] #Index
		self.spectators = [] #sessionIDs

		#-----Game Info-----#
		self.roundCount = 0
		self.roundMax = 0
		self.state = 1 #1=Lobby 2=Showdown 3=Vote
		
	#the playerObj is created in flaskapp under playerJoin
	def addPlayer(self, playerObj):
		self.activePlayers.append(playerObj)

	#remove player if they leave lobby
	def removePlayer(self, playerSID):
		for player in self.activePlayers:
			if player.sid == playerSID:
				#remove them from the lobby
				if self.state == 1:
					self.activePlayers.remove(player)
				#mark them as DC
				else:
					self.dcPlayers.append(self.activePlayers.index(player))
				return 1 #return 1 if we found a player
		return 0
	def getNameFromSID(self, playerSID):
		for player in self.activePlayers:
			if player.sid == playerSID:
				return player.username
		return ""
	def printPlayers(self):
		print "Number of Players: " + str(len(self.activePlayers))
		for player in self.activePlayers:
			print player.printPlayerInfo()


	def choosePlayers(self):
                tempmin = 100
		for player in self.activePlayers:
			if tempmin > player.gamesPlayed:
				tempmin = player.gamesPlayed
		for i in len(activePlayers):
			if activePlayers[i].gamesPlayed == tempmin:
				playersChoose.append(i)
			
