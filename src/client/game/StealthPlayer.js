import * as THREE from 'three';

export class StealthPlayer {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        
        // Player properties
        this.position = new THREE.Vector3(0, 0, 0);
        this.rotation = new THREE.Euler(0, 0, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        
        // Movement settings
        this.walkSpeed = 3;
        this.runSpeed = 6;
        this.crouchSpeed = 1.5;
        this.mouseSensitivity = 0.002;
        
        // State
        this.isGrounded = true;
        this.isCrouching = false;
        this.isAiming = false;
        this.health = 100;
        this.stamina = 100;
        this.detectionLevel = 0;
        
        // Create player mesh
        this.createPlayerMesh();
        
        // Setup mouse controls
        this.setupMouseControls();
        
        // Store initial camera position
        this.baseCameraHeight = 2;
        this.crouchCameraHeight = 1;
    }

    createPlayerMesh() {
        // Create a simple character representation
        const bodyGeometry = new THREE.CapsuleGeometry(0.3, 1.6, 4, 8);
        const bodyMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x000080 // Dark blue tactical suit
        });
        
        this.mesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.mesh.position.copy(this.position);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.scene.add(this.mesh);
        
        // Add a simple weapon
        const weaponGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.6);
        const weaponMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        this.weapon = new THREE.Mesh(weaponGeometry, weaponMaterial);
        this.weapon.position.set(0.2, 0.3, -0.3);
        this.mesh.add(this.weapon);
        
        // Add a simple head/helmet
        const headGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
        this.head = new THREE.Mesh(headGeometry, headMaterial);
        this.head.position.set(0, 0.9, 0);
        this.mesh.add(this.head);
    }

    setupMouseControls() {
        this.mouseX = 0;
        this.mouseY = 0;
        
        document.addEventListener('mousemove', (event) => {
            if (document.pointerLockElement) {
                this.mouseX = event.movementX;
                this.mouseY = event.movementY;
            }
        });
        
        document.addEventListener('click', () => {
            document.body.requestPointerLock();
        });
    }

    update(deltaTime, controls) {
        this.updateMovement(deltaTime, controls);
        this.updateMouseLook(deltaTime);
        this.updateAnimations(deltaTime);
        this.updatePosition();
    }

    updateMovement(deltaTime, controls) {
        // Determine current speed based on state
        let currentSpeed = this.walkSpeed;
        if (controls.sprint && this.stamina > 0) {
            currentSpeed = this.runSpeed;
            this.stamina = Math.max(0, this.stamina - deltaTime * 30);
        } else if (controls.crouch) {
            currentSpeed = this.crouchSpeed;
            this.isCrouching = true;
        } else {
            this.isCrouching = false;
        }
        
        // Calculate movement direction
        const moveDirection = new THREE.Vector3();
        if (controls.moveForward) moveDirection.z -= 1;
        if (controls.moveBackward) moveDirection.z += 1;
        if (controls.moveLeft) moveDirection.x -= 1;
        if (controls.moveRight) moveDirection.x += 1;
        
        // Normalize movement
        moveDirection.normalize();
        
        // Apply player rotation to movement
        if (moveDirection.length() > 0) {
            moveDirection.applyEuler(new THREE.Euler(0, this.rotation.y, 0));
            this.velocity.x = moveDirection.x * currentSpeed;
            this.velocity.z = moveDirection.z * currentSpeed;
        } else {
            this.velocity.x *= 0.8; // Friction
            this.velocity.z *= 0.8;
        }
        
        // Handle crouching
        if (this.isCrouching) {
            this.mesh.scale.y = 0.6;
        } else {
            this.mesh.scale.y = 1.0;
        }
        
        // Regenerate stamina when not sprinting
        if (!controls.sprint && this.stamina < 100) {
            this.stamina = Math.min(100, this.stamina + deltaTime * 20);
        }
    }

    updateMouseLook(deltaTime) {
        if (document.pointerLockElement) {
            // Update player rotation (horizontal)
            this.rotation.y -= this.mouseX * this.mouseSensitivity;
            
            // Update head rotation (vertical) - limited range
            this.head.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, 
                this.head.rotation.x - this.mouseY * this.mouseSensitivity));
        }
        
        // Reset mouse delta
        this.mouseX = 0;
        this.mouseY = 0;
    }

    updateAnimations(deltaTime) {
        // Simple head bob when moving
        if (this.velocity.length() > 0.1) {
            this.head.position.y = 0.9 + Math.sin(Date.now() * 0.01) * 0.02;
        }
    }

    updatePosition() {
        // Update position
        this.position.add(this.velocity.clone().multiplyScalar(1/60)); // Assuming 60 FPS
        
        // Simple ground collision
        if (this.position.y < 0) {
            this.position.y = 0;
            this.isGrounded = true;
        }
        
        // Apply position to mesh
        this.mesh.position.copy(this.position);
        this.mesh.rotation.y = this.rotation.y;
    }

    // Actions
    shoot() {
        console.log('🔫 Shooting...');
        // Implement shooting logic
    }

    melee() {
        console.log('🥊 Melee attack...');
        // Implement melee attack
    }

    interact() {
        console.log('🔧 Interacting...');
        // Implement interaction logic
    }

    takeDamage(amount) {
        this.health -= amount;
        console.log(`💔 Player took ${amount} damage. Health: ${this.health}`);
        
        if (this.health <= 0) {
            console.log('💀 Player eliminated');
            // Handle player death
        }
    }

    // Getters
    getPosition() {
        return this.position.clone();
    }

    getRotation() {
        return this.rotation.clone();
    }

    getDetectionLevel() {
        return this.detectionLevel;
    }

    isDetected() {
        return this.detectionLevel > 80;
    }

    // Setters
    setDetectionLevel(level) {
        this.detectionLevel = Math.max(0, Math.min(100, level));
    }

    destroy() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
        console.log('🧹 StealthPlayer destroyed');
    }
} 