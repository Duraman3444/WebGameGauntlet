import * as THREE from 'three';

export class StealthGame {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        // Player movement
        this.player = {
            position: new THREE.Vector3(0, 2, 5),
            rotation: new THREE.Euler(0, 0, 0),
            velocity: new THREE.Vector3(0, 0, 0),
            speed: 5,
            mouseSensitivity: 0.002
        };
        
        // Input handling
        this.keys = {};
        this.mouse = { x: 0, y: 0 };
        this.isPointerLocked = false;
        
        // Performance
        this.clock = new THREE.Clock();
        
        this.init();
    }
    
    init() {
        console.log('🎮 Initializing Simple 3D Explorer...');
        
        this.initThreeJS();
        this.createEnvironment();
        this.setupControls();
        this.animate();
        
        console.log('✅ 3D Explorer initialized successfully!');
    }
    
    initThreeJS() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
        this.scene.fog = new THREE.Fog(0x87CEEB, 1, 100);
        
        // Camera - First person
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        this.camera.position.copy(this.player.position);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Add to DOM
        const gameContainer = document.getElementById('gameContainer');
        if (gameContainer) {
            // Clear any existing canvas
            const existingCanvas = gameContainer.querySelector('canvas');
            if (existingCanvas) {
                existingCanvas.remove();
            }
            
            gameContainer.appendChild(this.renderer.domElement);
            console.log('🎮 Canvas added to DOM');
        }
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        console.log('🔧 Three.js initialized');
    }
    
    createEnvironment() {
        console.log('🏗️ Creating environment...');
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Ground
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x90EE90 });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // Create some buildings/structures
        this.createBuildings();
        
        console.log('✅ Environment created');
    }
    
    createBuildings() {
        // Building materials
        const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
        
        // Building 1
        const building1 = new THREE.BoxGeometry(4, 3, 6);
        const building1Mesh = new THREE.Mesh(building1, wallMaterial);
        building1Mesh.position.set(10, 1.5, 0);
        building1Mesh.castShadow = true;
        building1Mesh.receiveShadow = true;
        this.scene.add(building1Mesh);
        
        // Building 1 roof
        const roof1 = new THREE.BoxGeometry(4.5, 0.5, 6.5);
        const roof1Mesh = new THREE.Mesh(roof1, roofMaterial);
        roof1Mesh.position.set(10, 3.25, 0);
        roof1Mesh.castShadow = true;
        this.scene.add(roof1Mesh);
        
        // Building 2
        const building2 = new THREE.BoxGeometry(6, 4, 4);
        const building2Mesh = new THREE.Mesh(building2, wallMaterial);
        building2Mesh.position.set(-10, 2, 10);
        building2Mesh.castShadow = true;
        building2Mesh.receiveShadow = true;
        this.scene.add(building2Mesh);
        
        // Building 2 roof
        const roof2 = new THREE.BoxGeometry(6.5, 0.5, 4.5);
        const roof2Mesh = new THREE.Mesh(roof2, roofMaterial);
        roof2Mesh.position.set(-10, 4.25, 10);
        roof2Mesh.castShadow = true;
        this.scene.add(roof2Mesh);
        
        // Some decorative cubes
        const cubeMaterial = new THREE.MeshLambertMaterial({ color: 0xFF6B6B });
        for (let i = 0; i < 10; i++) {
            const cube = new THREE.BoxGeometry(1, 1, 1);
            const cubeMesh = new THREE.Mesh(cube, cubeMaterial);
            cubeMesh.position.set(
                (Math.random() - 0.5) * 40,
                0.5,
                (Math.random() - 0.5) * 40
            );
            cubeMesh.castShadow = true;
            cubeMesh.receiveShadow = true;
            this.scene.add(cubeMesh);
        }
        
        // Add some trees (cylinders with green spheres)
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
        
        for (let i = 0; i < 5; i++) {
            // Trunk
            const trunk = new THREE.CylinderGeometry(0.3, 0.3, 3);
            const trunkMesh = new THREE.Mesh(trunk, trunkMaterial);
            const x = (Math.random() - 0.5) * 30;
            const z = (Math.random() - 0.5) * 30;
            trunkMesh.position.set(x, 1.5, z);
            trunkMesh.castShadow = true;
            this.scene.add(trunkMesh);
            
            // Leaves
            const leaves = new THREE.SphereGeometry(2, 8, 8);
            const leavesMesh = new THREE.Mesh(leaves, leavesMaterial);
            leavesMesh.position.set(x, 4, z);
            leavesMesh.castShadow = true;
            this.scene.add(leavesMesh);
        }
    }
    
    setupControls() {
        // Keyboard controls
        document.addEventListener('keydown', (event) => {
            this.keys[event.code] = true;
        });
        
        document.addEventListener('keyup', (event) => {
            this.keys[event.code] = false;
        });
        
        // Mouse controls
        document.addEventListener('mousemove', (event) => {
            if (this.isPointerLocked) {
                this.mouse.x = event.movementX || 0;
                this.mouse.y = event.movementY || 0;
            }
        });
        
        document.addEventListener('click', () => {
            if (!this.isPointerLocked) {
                this.renderer.domElement.requestPointerLock();
            }
        });
        
        // Pointer lock events
        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement === this.renderer.domElement;
        });
        
        console.log('🎮 Controls setup complete');
    }
    
    update(deltaTime) {
        this.updateMovement(deltaTime);
        this.updateMouseLook();
        this.updateCamera();
    }
    
    updateMovement(deltaTime) {
        const moveSpeed = this.player.speed * deltaTime;
        const moveVector = new THREE.Vector3();
        
        // Movement input
        if (this.keys['KeyW']) moveVector.z -= 1;
        if (this.keys['KeyS']) moveVector.z += 1;
        if (this.keys['KeyA']) moveVector.x -= 1;
        if (this.keys['KeyD']) moveVector.x += 1;
        
        // Normalize and apply rotation
        if (moveVector.length() > 0) {
            moveVector.normalize();
            moveVector.applyEuler(this.player.rotation);
            moveVector.multiplyScalar(moveSpeed);
            
            this.player.position.add(moveVector);
        }
        
        // Keep player above ground
        if (this.player.position.y < 2) {
            this.player.position.y = 2;
        }
    }
    
    updateMouseLook() {
        if (this.isPointerLocked) {
            this.player.rotation.y -= this.mouse.x * this.player.mouseSensitivity;
            this.player.rotation.x -= this.mouse.y * this.player.mouseSensitivity;
            
            // Limit vertical rotation
            this.player.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.player.rotation.x));
        }
        
        // Reset mouse delta
        this.mouse.x = 0;
        this.mouse.y = 0;
    }
    
    updateCamera() {
        this.camera.position.copy(this.player.position);
        this.camera.rotation.copy(this.player.rotation);
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = this.clock.getDelta();
        this.update(deltaTime);
        this.renderer.render(this.scene, this.camera);
    }
    
    destroy() {
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        document.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('resize', this.onWindowResize);
        
        console.log('🎮 3D Explorer destroyed');
    }
} 