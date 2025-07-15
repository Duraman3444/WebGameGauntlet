extends Area2D

# Fruit collectible script for Fruit Runners: Multiplayer Gauntlet
# Day 1 basic collection implementation

@export var fruit_type = "apple"
@export var score_value = 100
@export var bob_speed = 2.0
@export var bob_height = 10.0

var start_position: Vector2
var time_passed = 0.0
var is_collected = false

@onready var sprite = $Sprite2D
@onready var animation_player = $AnimationPlayer
@onready var collision_shape = $CollisionShape2D
@onready var collect_sound = $CollectSound

func _ready():
	start_position = global_position
	setup_fruit_type()
	
	# Connect collection signal
	body_entered.connect(_on_body_entered)
	
	# Start floating animation
	start_floating()

func setup_fruit_type():
	# Set up fruit based on existing assets
	match fruit_type:
		"apple":
			score_value = 100
		"banana":
			score_value = 80
		"cherries":
			score_value = 120
		"kiwi":
			score_value = 90
		"melon":
			score_value = 150
		"orange":
			score_value = 110
		"pineapple":
			score_value = 200
		"strawberry":
			score_value = 85

func _process(delta):
	if is_collected:
		return
	
	# Floating animation
	time_passed += delta
	var bob_offset = sin(time_passed * bob_speed) * bob_height
	global_position.y = start_position.y + bob_offset

func start_floating():
	# Simple floating animation using existing assets
	var tween = create_tween()
	tween.set_loops()
	tween.tween_property(sprite, "modulate:a", 0.7, 1.0)
	tween.tween_property(sprite, "modulate:a", 1.0, 1.0)

func _on_body_entered(body):
	if body.is_in_group("player") and not is_collected:
		collect(body)

func collect(player):
	if is_collected:
		return
	
	is_collected = true
	
	# Visual feedback
	create_collection_effect()
	
	# Play sound
	if collect_sound:
		collect_sound.play()
	
	# Update player score (implement in Day 2)
	# player.collect_fruit(fruit_type)
	
	# Notify game manager
	var game_manager = get_node("/root/GameManager")
	if game_manager:
		var player_id = player.get("player_id", 1)
		var current_score = game_manager.players.get(player_id, {}).get("score", 0)
		game_manager.update_player_score(player_id, current_score + score_value)
	
	# Remove fruit
	queue_free()

func create_collection_effect():
	# Create particle effect using existing assets
	var particles = preload("res://systems/FruitParticles.tscn")
	if particles:
		var particle_instance = particles.instantiate()
		get_parent().add_child(particle_instance)
		particle_instance.global_position = global_position
		particle_instance.emitting = true
	
	# Scale up and fade out effect
	var tween = create_tween()
	tween.parallel().tween_property(sprite, "scale", Vector2(1.5, 1.5), 0.3)
	tween.parallel().tween_property(sprite, "modulate:a", 0.0, 0.3)

func despawn_after_time(time: float):
	# Auto-despawn after time limit
	await get_tree().create_timer(time).timeout
	if not is_collected:
		var tween = create_tween()
		tween.tween_property(sprite, "modulate:a", 0.0, 1.0)
		await tween.finished
		queue_free()

# Multiplayer functions (Day 2 implementation)
func setup_multiplayer():
	# Set up multiplayer authority and synchronization
	pass

func sync_collection():
	# Synchronize fruit collection across clients
	pass 