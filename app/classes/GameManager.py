import random
import sys

class GameManager:
	def __init__(self, gameCode, hostSID):
		#------House keeping-----#
		self.gameCode = gameCode #To join the game and the roomid for emit
		self.host = hostSID #Host client
		self.activePlayers = [] #Player Object
		self.dcPlayers = [] #Index
		self.competitors = [] #Index
		self.spectators = [] #sessionIDs
		self.playersChoose = []

		#-----Game Info-----#
		self.roundCount = 0
		self.gamesMax = 6 # The max amount of games one player can play
		self.roundMax = 2 # The max amount of rounds per game
		self.state = 1 #1=Lobby 2=Pre 3=Showdown 4=Draw 4=Vote
		self.currentPrompt = ''
		self.showdownStarted = False
		self.gameEnd = False
		self.currentVotes = 0
		self.playerOneVotes = 0
		self.playerTwoVotes = 0
		
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
		if len(self.competitors) == 1:
			playerChooseIndex = random.sample(range(0, len(self.playersChoose)), 1);
			self.competitors.append(self.playersChoose[playerChooseIndex[0]])
		else:
			if len(self.competitors) > 0:
				del self.competitors[:]
			playerChooseIndices = random.sample(range(0, len(self.playersChoose)), 2);
			for i in playerChooseIndices:
				self.competitors.append(self.playersChoose[i])
				print (" ***: ")
				print (i)
		for i in range(0, len(self.competitors)):
			print ("Name: " + self.activePlayers[self.competitors[i]].username)
			print ("Games Played: %d" , self.activePlayers[self.competitors[i]].gamesPlayed)
			self.activePlayers[self.competitors[i]].gamesPlayed += 1
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

	def getPlayerPoints(self):
		playerPoints = []
		for i in range(0, len(self.activePlayers)):
			playerDict = {'name' : self.activePlayers[i].username, 'score' : self.activePlayers[i].points}
			playerPoints.append(playerDict)
		return playerPoints

	def getWinner(self):
		winnerIndex = 0
		for i in range(0, len(self.activePlayers)):
			if self.activePlayers[winnerIndex].points < self.activePlayers[i].points:
				winnerIndex = i
		return self.activePlayers[winnerIndex]

	def resetPlayerVotes(self):
		self.playerOneVotes = 0
		self.playerTwoVotes = 0

#Player selection Functions
	def choosePlayers(self):
		if len(self.playersChoose) > 0:
			del self.playersChoose[:]
		tempmin = 100
		for player in self.activePlayers:
			if tempmin > player.gamesPlayed:
				tempmin = player.gamesPlayed
				print ("tempmin: %d", tempmin)
		for i in range(len(self.activePlayers)):
			if self.activePlayers[i].gamesPlayed == tempmin:
				self.playersChoose.append(i)
				print ("\nPlayers in queue: ")
				print (self.activePlayers[i].username)
		for i in range(len(self.playersChoose)):
			print ("--------------> Players actually in queue: ")
			print (self.activePlayers[self.playersChoose[i]].username)
	
		if len(self.playersChoose) == 1:
			if len(self.competitors) > 0:
				del self.competitors[:]
			self.competitors.append(self.playersChoose[0])
			if len(self.playersChoose) > 0:
				del self.playersChoose[:]
			tempmin = tempmin + 1
			for i in range(len(self.activePlayers)):
				if self.activePlayers[i].gamesPlayed == tempmin:
					self.playersChoose.append(i)
					print ("\nPlayers in queue(len(1)): ")
					print (self.activePlayers[i].username)

	#Checks if all players have played the same number of games already.
	def validateSameGamesPlayed(self):
		#Get the number of games the first player has played
		temp = self.activePlayers[0].gamesPlayed

		#Check each player and see if their number of games played is the same
		#as the first player's. If not, then not all players have played the same
		#amount of games.
		for i in range(len(self.activePlayers)):
			if self.activePlayers[i].gamesPlayed != temp:
				return False
		return True

	def validateEndGame(self):
		isFair = True
		#Check if any player has played more than the maximum allow games
		#This prevents the game from dragging on for too long
		for i in range(len(self.activePlayers)):
			if self.activePlayers[i].gamesPlayed == self.gamesMax:
				return True

		#If all players played the same amount of games, check if their total
		#games played is more than the amount every player should play
		#End the game if this is true.
		if self.validateSameGamesPlayed():
			#Increment the round count
			self.roundCount += 1
			print str(self.roundCount) + ' rounds has been played!'
			sys.stdout.flush()
			if self.roundCount >= self.roundMax:
				self.gameEnd = True
			else:
				self.gameEnd = False
		return self.gameEnd

	def addSpectator(self, specSID):
		self.spectators.append(specSID)

	def removeSpectator(self, specSID):
		if specSID in self.spectators:
			self.spectators.remove(specSID)
			return 1
		return 0

	def getHighestWinStreak(self):
		winnerIndex = 0
		for i in range(0, len(self.activePlayers)):
			if self.activePlayers[winnerIndex].highestWinStreak < self.activePlayers[i].highestWinStreak:
				winnerIndex = i
		return self.activePlayers[winnerIndex]

	def getHighestVote(self):
		winnerIndex = 0
		for i in range(0, len(self.activePlayers)):
			if self.activePlayers[winnerIndex].highestVote < self.activePlayers[i].highestVote:
				winnerIndex = i
		return self.activePlayers[winnerIndex]


