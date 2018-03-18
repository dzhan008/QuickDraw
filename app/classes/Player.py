class Player:
	def __init__(self, sid, username, imageIndex):
		self.sid = sid
		self.username = username
		self.imageIndex = imageIndex
		self.totalLikes = 0
		self.winStreak = 0
		self.highestVote = 0
		self.points = 0
		self.gamesPlayed = 0
		self.ready = False

	def resetStats(self):
		self.totalLikes = 0
		self.winStreak = 0
		self.highestVote = 0
		self.points = 0
		self.gamesPlayed = 0

	def updateTotalLikes(self, num):
		self.totalLikes += num

	def updateHighestVote(self, num):
		if num > self.highestVote:
			self.highestVote = num

	#You can update the player's points and gamesPlayed here too
	#or create a new function/change it up
	def updateWinStreak(self, outcome):
		if outcome:
			self.winStreak += 1
		else:
			self.winStreak = 0

	def updateStats(self, likeNum, voteNum, outcome):
		self.updateTotalLikes(likeNum)
		self.updateHighestVote(voteNum)
		self.updateWinStreak(outcome)

	def printPlayerInfo(self):
		print "Session ID: " + self.sid
		print "Username: " + self.username
		print "Image index: " + str(self.imageIndex)


