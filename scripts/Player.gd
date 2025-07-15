extends CharacterBody2D

# Player controller for Fruit Runners: Multiplayer Gauntlet
# Day 1 implementation - basic movement and jump

@export var speed = 300.0
@export var jump_velocity = -400.0
@export var double_jump_velocity = -350.0

var gravity = ProjectSettings.get_setting("physics/2d/default_gravity")
var can_double_jump = true
var facing_right = true

@onready var sprite = $Sprite2D
@onready var animation_player = $AnimationPlayer
@onready var collision_shape = $CollisionShape2D

# Multiplayer variables (to be implemented in Day 2)
@export var player_id := 1
var is_local_player = false

func _ready():
	# Set up player based on existing assets
	# Will be expanded for multiplayer in Day 2
	pass

func _physics_process(delta):
	# Handle gravity
	if not is_on_floor():
		velocity.y += gravity * delta
	else:
		can_double_jump = true

	# Handle input (will be modified for multiplayer)
	handle_input()
	
	# Handle movement and animation
	handle_movement()
	handle_animation()
	
	# Apply movement
	move_and_slide()

func handle_input():
	# Jump logic
	if Input.is_action_just_pressed("jump"):
		if is_on_floor():
			velocity.y = jump_velocity
		elif can_double_jump:
			velocity.y = double_jump_velocity
			can_double_jump = false
	
	# Movement input
	var direction = Input.get_axis("move_left", "move_right")
	if direction != 0:
		velocity.x = direction * speed
		
		# Handle facing direction
		if direction > 0 and not facing_right:
			flip_sprite()
		elif direction < 0 and facing_right:
			flip_sprite()
	else:
		velocity.x = move_toward(velocity.x, 0, speed)

func handle_movement():
	# Additional movement logic can be added here
	pass

func handle_animation():
	# Basic animation logic using existing assets
	if not is_on_floor():
		if velocity.y < 0:
			play_animation("jump")
		else:
			play_animation("fall")
	elif abs(velocity.x) > 0:
		play_animation("run")
	else:
		play_animation("idle")

func play_animation(anim_name: String):
	if animation_player.has_animation(anim_name):
		animation_player.play(anim_name)

func flip_sprite():
	facing_right = !facing_right
	sprite.flip_h = !facing_right

# Multiplayer functions (to be implemented in Day 2)
func setup_multiplayer(id: int, is_local: bool):
	player_id = id
	is_local_player = is_local
	
	# Set up multiplayer spawner and authority
	# This will be expanded in Day 2

func take_damage(amount: int):
	# Damage system to be implemented
	pass

func collect_fruit(fruit_type: String):
	# Fruit collection system to be implemented
	pass 