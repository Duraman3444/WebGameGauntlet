import * as THREE from 'three';

export class Player {
    constructor(scene, camera, isLocal = false) {
        this.scene = scene;
        this.camera = camera;
        this.isLocal = isLocal;
        
        // Player properties
        this.position = new THREE.Vector3(0, 1, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.rotation = new THREE.Euler(0, 0, 0);
        
        // Movement settings
        this.speed = 5;
        this.jumpForce = 8;
        this.gravity = -20;
        this.mouseSensitivity = 0.002;
        
        // State
        this.isGrounded = false;
        this.isMoving = false;
        this.health = 100;
        
        // Input state
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false
        };
        
        // Mouse look
        this.mouseX = 0;
        this.mouseY = 0;
        this.pitch = 0;
        this.yaw = 0;
        
        // Create player mesh
        this.createPlayerMesh();
        
        // Setup controls if local player
        if (this.isLocal) {
            this.setupControls();
        }
    }

    createPlayerMesh() {
        // Create a simple capsule for the player
        const geometry = new THREE.CapsuleGeometry(0.3, 1.4, 4, 8);
        const material = new THREE.MeshLambertMaterial({ 
            color: this.isLocal ? 0x00ff00 : 0xff0000 
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.scene.add(this.mesh);
        
        // Create a simple head indicator
        const headGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const headMaterial = new THREE.MeshLambertMaterial({ 
            color: this.isLocal ? 0x00aa00 : 0xaa0000 
        });
        
        this.head = new THREE.Mesh(headGeometry, headMaterial);
        this.head.position.set(0, 0.8, 0);
        this.mesh.add(this.head);
        
        // Add a simple weapon/hand indicator
        const handGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.4);
        const handMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        
        this.hand = new THREE.Mesh(handGeometry, handMaterial);
        this.hand.position.set(0.3, 0.5, -0.3);
        this.mesh.add(this.hand);
    }

    setupControls() {
        // Keyboard controls
        document.addEventListener('keydown', (event) => {
            switch(event.code) {
                case 'KeyW':
                    this.keys.forward = true;
                    break;
                case 'KeyS':
                    this.keys.backward = true;
                    break;
                case 'KeyA':
                    this.keys.left = true;
                    break;
                case 'KeyD':
                    this.keys.right = true;
                    break;
                case 'Space':
                    this.keys.jump = true;
                    event.preventDefault();
                    break;
            }
        });

        document.addEventListener('keyup', (event) => {
            switch(event.code) {
                case 'KeyW':
                    this.keys.forward = false;
                    break;
                case 'KeyS':
                    this.keys.backward = false;
                    break;
                case 'KeyA':
                    this.keys.left = false;
                    break;
                case 'KeyD':
                    this.keys.right = false;
                    break;
                case 'Space':
                    this.keys.jump = false;
                    break;
            }
        });

        // Mouse controls
        document.addEventListener('mousemove', (event) => {
            if (document.pointerLockElement) {
                this.mouseX = event.movementX;
                this.mouseY = event.movementY;
            }
        });

        // Pointer lock events
        document.addEventListener('pointerlockchange', () => {
            if (document.pointerLockElement) {
                console.log('🔒 Pointer locked');
            } else {
                console.log('🔓 Pointer unlocked');
            }
        });
    }

    requestPointerLock() {
        document.body.requestPointerLock();
    }

    update(deltaTime) {
        if (this.isLocal) {
            this.updateControls(deltaTime);
        }
        
        this.updatePhysics(deltaTime);
        this.updateMesh();
    }

    updateControls(deltaTime) {
        // Mouse look
        if (document.pointerLockElement) {
            this.yaw -= this.mouseX * this.mouseSensitivity;
            this.pitch -= this.mouseY * this.mouseSensitivity;
            
            // Clamp pitch
            this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
            
            // Update camera rotation
            this.camera.rotation.order = 'YXZ';
            this.camera.rotation.y = this.yaw;
            this.camera.rotation.x = this.pitch;
        }

        // Movement
        const moveDirection = new THREE.Vector3();
        
        if (this.keys.forward) moveDirection.z -= 1;
        if (this.keys.backward) moveDirection.z += 1;
        if (this.keys.left) moveDirection.x -= 1;
        if (this.keys.right) moveDirection.x += 1;
        
        // Normalize movement
        moveDirection.normalize();
        
        // Apply camera rotation to movement
        if (moveDirection.length() > 0) {
            moveDirection.applyEuler(new THREE.Euler(0, this.yaw, 0));
            this.velocity.x = moveDirection.x * this.speed;
            this.velocity.z = moveDirection.z * this.speed;
            this.isMoving = true;
        } else {
            this.velocity.x *= 0.8; // Friction
            this.velocity.z *= 0.8;
            this.isMoving = false;
        }
        
        // Jumping
        if (this.keys.jump && this.isGrounded) {
            this.velocity.y = this.jumpForce;
            this.isGrounded = false;
        }
        
        // Reset mouse delta
        this.mouseX = 0;
        this.mouseY = 0;
    }

    updatePhysics(deltaTime) {
        // Apply gravity
        this.velocity.y += this.gravity * deltaTime;
        
        // Update position
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        
        // Simple ground collision
        if (this.position.y <= 1) {
            this.position.y = 1;
            this.velocity.y = 0;
            this.isGrounded = true;
        }
        
        // Simple boundary collision
        const boundary = 20;
        this.position.x = Math.max(-boundary, Math.min(boundary, this.position.x));
        this.position.z = Math.max(-boundary, Math.min(boundary, this.position.z));
    }

    updateMesh() {
        // Update mesh position
        this.mesh.position.copy(this.position);
        
        // Update camera position (first person)
        if (this.isLocal) {
            this.camera.position.copy(this.position);
            this.camera.position.y += 0.6; // Eye level
        }
        
        // Rotate mesh to face movement direction
        if (this.isMoving && !this.isLocal) {
            const direction = this.velocity.clone().normalize();
            this.mesh.lookAt(
                this.position.x + direction.x,
                this.position.y,
                this.position.z + direction.z
            );
        }
    }

    setPosition(position) {
        this.position.copy(position);
        this.mesh.position.copy(position);
        
        if (this.isLocal) {
            this.camera.position.copy(position);
            this.camera.position.y += 0.6;
        }
    }

    getPosition() {
        return this.position.clone();
    }

    getRotation() {
        return { yaw: this.yaw, pitch: this.pitch };
    }

    setRotation(yaw, pitch) {
        this.yaw = yaw;
        this.pitch = pitch;
        
        if (!this.isLocal) {
            this.mesh.rotation.y = yaw;
        }
    }

    takeDamage(amount) {
        this.health -= amount;
        console.log(`💔 Player took ${amount} damage. Health: ${this.health}`);
        
        if (this.health <= 0) {
            this.destroy();
        }
    }

    destroy() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
        
        console.log('💥 Player destroyed');
    }
} 