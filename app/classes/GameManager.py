import random

class GameManager:
	def __init__(self, gameCode, hostSID):
		#------House keeping-----#
		self.gameCode = gameCode #To join the game and the roomid for emit
		self.host = hostSID #Host client
		self.activePlayers = [] #Player Object
		self.dcPlayers = [] #Index
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
		
	#Test function to make  two random players competitors
	def setCompetitors(self):
		self.competitors = random.sample(range(0, len(self.activePlayers)), 2);
		return

	def getCompetitorSIDs(self):
		competitorSIDs  = []
		for i in range(0, len(self.competitors)):
			competitorSIDs.append(self.activePlayers[self.competitors[i]].sid)
		return competitorSIDs

	#Get SIDs of non active players and spectators
	def getAudienceSIDs(self):
		audience = []
		for i in range(0, len(self.activePlayers)):
			if(i not in self.competitors):
				audience.append(self.activePlayers[i].sid)
		return audience + self.spectators

	def getNameFromSID(self, playerSID):
		for player in self.activePlayers:
			if player.sid == playerSID:
				return player.username
		return ""
	def printPlayers(self):
		print "Number of Players: " + str(len(self.activePlayers))
		for player in self.activePlayers:
			print player.printPlayerInfo()




