extends CharacterBody2D

# Enemy script for Fruit Runners: Multiplayer Gauntlet
# Day 1 basic AI implementation

@export var speed = 80.0
@export var patrol_distance = 100.0
@export var chase_distance = 150.0
@export var attack_damage = 10
@export var enemy_type = "goblin"

var gravity = ProjectSettings.get_setting("physics/2d/default_gravity")
var direction = 1
var start_position: Vector2
var target_player: CharacterBody2D = null
var health = 50
var max_health = 50

enum EnemyState {
	PATROL,
	CHASE,
	ATTACK,
	DEAD
}

var current_state = EnemyState.PATROL

@onready var sprite = $Sprite2D
@onready var animation_player = $AnimationPlayer
@onready var collision_shape = $CollisionShape2D
@onready var detection_area = $DetectionArea

func _ready():
	start_position = global_position
	setup_enemy_type()
	
	# Connect detection area signals
	if detection_area:
		detection_area.body_entered.connect(_on_detection_area_body_entered)
		detection_area.body_exited.connect(_on_detection_area_body_exited)

func setup_enemy_type():
	# Set up enemy based on existing assets
	match enemy_type:
		"goblin":
			speed = 80.0
			attack_damage = 10
			health = 50
		"mushroom":
			speed = 50.0
			attack_damage = 8
			health = 30
		"skeleton":
			speed = 100.0
			attack_damage = 15
			health = 60
		"slime":
			speed = 60.0
			attack_damage = 5
			health = 25

func _physics_process(delta):
	if current_state == EnemyState.DEAD:
		return
	
	# Apply gravity
	if not is_on_floor():
		velocity.y += gravity * delta
	
	# State machine
	match current_state:
		EnemyState.PATROL:
			patrol_behavior()
		EnemyState.CHASE:
			chase_behavior()
		EnemyState.ATTACK:
			attack_behavior()
	
	# Apply movement
	move_and_slide()
	
	# Update animation
	update_animation()

func patrol_behavior():
	# Simple patrol between two points
	var distance_from_start = global_position.x - start_position.x
	
	if abs(distance_from_start) >= patrol_distance:
		direction *= -1
	
	velocity.x = direction * speed
	
	# Check for edges or walls
	if is_on_wall():
		direction *= -1

func chase_behavior():
	if target_player:
		var distance_to_player = global_position.distance_to(target_player.global_position)
		
		# Too far away, return to patrol
		if distance_to_player > chase_distance * 1.5:
			current_state = EnemyState.PATROL
			target_player = null
			return
		
		# Close enough to attack
		if distance_to_player < 50:
			current_state = EnemyState.ATTACK
			return
		
		# Move towards player
		var direction_to_player = (target_player.global_position - global_position).normalized()
		velocity.x = direction_to_player.x * speed * 1.2  # Faster when chasing
		
		# Update sprite direction
		if direction_to_player.x > 0:
			sprite.flip_h = false
		else:
			sprite.flip_h = true

func attack_behavior():
	# Simple attack logic
	velocity.x = 0
	
	if target_player:
		var distance_to_player = global_position.distance_to(target_player.global_position)
		
		if distance_to_player > 60:
			current_state = EnemyState.CHASE
		else:
			# Deal damage to player (implement in Day 2)
			# target_player.take_damage(attack_damage)
			pass

func update_animation():
	# Basic animation logic using existing assets
	if current_state == EnemyState.DEAD:
		play_animation("death")
	elif current_state == EnemyState.ATTACK:
		play_animation("attack")
	elif abs(velocity.x) > 0:
		play_animation("walk")
	else:
		play_animation("idle")

func play_animation(anim_name: String):
	if animation_player and animation_player.has_animation(anim_name):
		animation_player.play(anim_name)

func take_damage(amount: int):
	health -= amount
	
	# Visual feedback
	sprite.modulate = Color.RED
	await get_tree().create_timer(0.1).timeout
	sprite.modulate = Color.WHITE
	
	if health <= 0:
		die()

func die():
	current_state = EnemyState.DEAD
	collision_shape.disabled = true
	
	# Death animation and cleanup
	play_animation("death")
	await get_tree().create_timer(2.0).timeout
	queue_free()

func _on_detection_area_body_entered(body):
	if body.is_in_group("player"):
		target_player = body
		current_state = EnemyState.CHASE

func _on_detection_area_body_exited(body):
	if body == target_player:
		target_player = null
		current_state = EnemyState.PATROL

# Multiplayer functions (Day 2 implementation)
func setup_multiplayer():
	# Set up multiplayer authority and synchronization
	pass

func sync_state():
	# Synchronize enemy state across clients
	pass 