extends Node

# Game Manager for Fruit Runners: Multiplayer Gauntlet
# Handles game state, multiplayer coordination, and progression

signal game_started
signal game_ended
signal player_scored(player_id: int, score: int)
signal level_completed

enum GameState {
	MENU,
	LOBBY,
	PLAYING,
	PAUSED,
	GAME_OVER
}

var current_state = GameState.MENU
var players = {}
var current_level = 1
var game_time = 0.0
var max_game_time = 300.0  # 5 minutes per level

# Multiplayer variables (Day 2 implementation)
var is_host = false
var max_players = 4
var connected_players = []

# Game configuration
var fruits_to_win = 10
var enable_enemies = true
var level_progression = true

func _ready():
	# Initialize game systems
	setup_game()
	
	# Connect to multiplayer signals (Day 2)
	# multiplayer.peer_connected.connect(_on_peer_connected)
	# multiplayer.peer_disconnected.connect(_on_peer_disconnected)

func _process(delta):
	if current_state == GameState.PLAYING:
		game_time += delta
		
		# Check win conditions
		check_win_conditions()
		
		# Check time limit
		if game_time >= max_game_time:
			end_game("Time's up!")

func setup_game():
	print("🎮 Setting up Fruit Runners: Multiplayer Gauntlet")
	
	# Load game configuration
	load_game_config()
	
	# Set up level
	setup_level(current_level)

func load_game_config():
	# Load configuration from existing assets
	# This will be expanded with save/load system
	pass

func setup_level(level_num: int):
	print("🏗️ Setting up level: ", level_num)
	current_level = level_num
	
	# Spawn fruits using existing assets
	spawn_fruits()
	
	# Spawn enemies using existing assets
	if enable_enemies:
		spawn_enemies()

func spawn_fruits():
	# Fruit spawning logic using existing fruit sprites
	# This will be expanded in Day 2 with multiplayer synchronization
	var fruit_types = ["apple", "banana", "cherries", "kiwi", "melon", "orange", "pineapple", "strawberry"]
	
	for i in range(fruits_to_win):
		var fruit_type = fruit_types[randi() % fruit_types.size()]
		print("🍎 Spawning fruit: ", fruit_type)
		# Actual spawning logic to be implemented

func spawn_enemies():
	# Enemy spawning logic using existing enemy sprites
	# This will be expanded in Day 2 with multiplayer synchronization
	var enemy_types = ["goblin", "mushroom", "skeleton", "slime"]
	
	for i in range(3):
		var enemy_type = enemy_types[randi() % enemy_types.size()]
		print("👹 Spawning enemy: ", enemy_type)
		# Actual spawning logic to be implemented

func start_game():
	print("🚀 Starting game!")
	current_state = GameState.PLAYING
	game_time = 0.0
	game_started.emit()

func end_game(reason: String):
	print("🏁 Game ended: ", reason)
	current_state = GameState.GAME_OVER
	game_ended.emit()

func pause_game():
	if current_state == GameState.PLAYING:
		current_state = GameState.PAUSED
		get_tree().paused = true

func resume_game():
	if current_state == GameState.PAUSED:
		current_state = GameState.PLAYING
		get_tree().paused = false

func check_win_conditions():
	# Check if any player has reached the fruit goal
	for player_id in players.keys():
		if players[player_id].score >= fruits_to_win:
			end_game("Player " + str(player_id) + " wins!")
			return

func add_player(player_id: int):
	players[player_id] = {
		"score": 0,
		"character": "pink_man",  # Default character
		"is_alive": true
	}
	print("➕ Added player: ", player_id)

func remove_player(player_id: int):
	if player_id in players:
		players.erase(player_id)
		print("➖ Removed player: ", player_id)

func update_player_score(player_id: int, new_score: int):
	if player_id in players:
		players[player_id].score = new_score
		player_scored.emit(player_id, new_score)
		print("📊 Player ", player_id, " score: ", new_score)

func next_level():
	if level_progression:
		current_level += 1
		setup_level(current_level)
		level_completed.emit()
		print("⬆️ Advanced to level: ", current_level)

# Multiplayer functions (Day 2 implementation)
func create_lobby():
	print("🌐 Creating multiplayer lobby...")
	# Multiplayer lobby creation logic
	pass

func join_lobby(address: String):
	print("🔗 Joining multiplayer lobby at: ", address)
	# Multiplayer lobby joining logic
	pass

func _on_peer_connected(id: int):
	print("🤝 Peer connected: ", id)
	add_player(id)

func _on_peer_disconnected(id: int):
	print("👋 Peer disconnected: ", id)
	remove_player(id)

# Input handling for game management
func _input(event):
	if event.is_action_pressed("ui_cancel"):  # ESC key
		if current_state == GameState.PLAYING:
			pause_game()
		elif current_state == GameState.PAUSED:
			resume_game()
	
	# Debug keys (remove in production)
	if event.is_action_pressed("ui_accept"):  # Enter key
		if current_state == GameState.MENU:
			add_player(1)  # Add local player
			start_game() 