import * as THREE from 'three';

export class Environment {
    constructor(scene) {
        this.scene = scene;
        this.objects = [];
        
        this.init();
    }

    init() {
        this.createGround();
        this.createWalls();
        this.createObstacles();
        this.createCollectibles();
        this.createSkybox();
    }

    createGround() {
        // Create main ground plane
        const groundGeometry = new THREE.PlaneGeometry(50, 50);
        const groundMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x4a5d23,
            side: THREE.DoubleSide
        });
        
        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.position.y = 0;
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);
        
        // Add some texture variation
        const patches = [];
        for (let i = 0; i < 10; i++) {
            const patchGeometry = new THREE.CircleGeometry(Math.random() * 3 + 1, 8);
            const patchMaterial = new THREE.MeshLambertMaterial({ 
                color: new THREE.Color().setHSL(0.25, 0.5, 0.3 + Math.random() * 0.2)
            });
            
            const patch = new THREE.Mesh(patchGeometry, patchMaterial);
            patch.rotation.x = -Math.PI / 2;
            patch.position.set(
                (Math.random() - 0.5) * 40,
                0.01,
                (Math.random() - 0.5) * 40
            );
            patch.receiveShadow = true;
            this.scene.add(patch);
            patches.push(patch);
        }
        
        this.objects.push(this.ground, ...patches);
    }

    createWalls() {
        const wallHeight = 5;
        const wallThickness = 0.5;
        const arenaSize = 25;
        
        // Create boundary walls
        const walls = [
            // North wall
            { pos: [0, wallHeight/2, arenaSize], size: [arenaSize*2, wallHeight, wallThickness] },
            // South wall
            { pos: [0, wallHeight/2, -arenaSize], size: [arenaSize*2, wallHeight, wallThickness] },
            // East wall
            { pos: [arenaSize, wallHeight/2, 0], size: [wallThickness, wallHeight, arenaSize*2] },
            // West wall
            { pos: [-arenaSize, wallHeight/2, 0], size: [wallThickness, wallHeight, arenaSize*2] }
        ];
        
        walls.forEach(wall => {
            const geometry = new THREE.BoxGeometry(...wall.size);
            const material = new THREE.MeshLambertMaterial({ 
                color: 0x8B4513,
                transparent: true,
                opacity: 0.8
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(...wall.pos);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.scene.add(mesh);
            this.objects.push(mesh);
        });
    }

    createObstacles() {
        // Create various obstacles for interesting gameplay
        const obstacles = [
            // Pillars
            { pos: [5, 2, 5], size: [1, 4, 1], color: 0x696969 },
            { pos: [-5, 2, 5], size: [1, 4, 1], color: 0x696969 },
            { pos: [5, 2, -5], size: [1, 4, 1], color: 0x696969 },
            { pos: [-5, 2, -5], size: [1, 4, 1], color: 0x696969 },
            
            // Platforms
            { pos: [0, 2, 0], size: [4, 0.5, 4], color: 0x8B4513 },
            { pos: [10, 1, 10], size: [3, 0.5, 3], color: 0x8B4513 },
            { pos: [-10, 1, -10], size: [3, 0.5, 3], color: 0x8B4513 },
            
            // Ramps
            { pos: [8, 0.5, 0], size: [2, 1, 6], color: 0x654321, rotation: [0, 0, 0.2] },
            { pos: [-8, 0.5, 0], size: [2, 1, 6], color: 0x654321, rotation: [0, 0, -0.2] },
        ];
        
        obstacles.forEach(obstacle => {
            const geometry = new THREE.BoxGeometry(...obstacle.size);
            const material = new THREE.MeshLambertMaterial({ color: obstacle.color });
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(...obstacle.pos);
            
            if (obstacle.rotation) {
                mesh.rotation.set(...obstacle.rotation);
            }
            
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.scene.add(mesh);
            this.objects.push(mesh);
        });
    }

    createCollectibles() {
        // Create collectible items scattered around
        this.collectibles = [];
        
        for (let i = 0; i < 15; i++) {
            const geometry = new THREE.OctahedronGeometry(0.3);
            const material = new THREE.MeshLambertMaterial({ 
                color: 0xFFD700,
                emissive: 0x444400
            });
            
            const collectible = new THREE.Mesh(geometry, material);
            collectible.position.set(
                (Math.random() - 0.5) * 40,
                0.5,
                (Math.random() - 0.5) * 40
            );
            
            collectible.castShadow = true;
            collectible.userData = { type: 'collectible', value: 10 };
            
            this.scene.add(collectible);
            this.collectibles.push(collectible);
        }
        
        this.objects.push(...this.collectibles);
    }

    createSkybox() {
        // Create a simple gradient skybox
        const skyboxGeometry = new THREE.SphereGeometry(100, 32, 32);
        const skyboxMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x87CEEB,
            side: THREE.BackSide,
            fog: false
        });
        
        this.skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
        this.scene.add(this.skybox);
        this.objects.push(this.skybox);
        
        // Add some clouds
        for (let i = 0; i < 8; i++) {
            const cloudGeometry = new THREE.SphereGeometry(2 + Math.random() * 3, 8, 8);
            const cloudMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xffffff,
                transparent: true,
                opacity: 0.8
            });
            
            const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
            cloud.position.set(
                (Math.random() - 0.5) * 100,
                20 + Math.random() * 10,
                (Math.random() - 0.5) * 100
            );
            
            cloud.scale.set(
                1 + Math.random(),
                0.5 + Math.random() * 0.5,
                1 + Math.random()
            );
            
            this.scene.add(cloud);
            this.objects.push(cloud);
        }
    }

    update(deltaTime) {
        // Animate collectibles
        this.collectibles.forEach(collectible => {
            collectible.rotation.y += deltaTime * 2;
            collectible.position.y = 0.5 + Math.sin(Date.now() * 0.001 + collectible.position.x) * 0.1;
        });
        
        // Animate skybox clouds
        this.objects.forEach(obj => {
            if (obj.userData && obj.userData.type === 'cloud') {
                obj.rotation.y += deltaTime * 0.1;
            }
        });
    }

    getCollectibleAt(position, radius = 1) {
        for (let i = 0; i < this.collectibles.length; i++) {
            const collectible = this.collectibles[i];
            if (collectible.position.distanceTo(position) < radius) {
                return { index: i, collectible };
            }
        }
        return null;
    }

    removeCollectible(index) {
        if (index >= 0 && index < this.collectibles.length) {
            const collectible = this.collectibles[index];
            this.scene.remove(collectible);
            collectible.geometry.dispose();
            collectible.material.dispose();
            this.collectibles.splice(index, 1);
            
            // Remove from objects array
            const objIndex = this.objects.indexOf(collectible);
            if (objIndex !== -1) {
                this.objects.splice(objIndex, 1);
            }
        }
    }

    checkCollision(position, radius = 0.5) {
        // Simple collision detection with obstacles
        // This is a basic implementation - you might want to use a physics engine for more complex games
        
        // Check boundary collision
        const boundary = 24;
        if (Math.abs(position.x) > boundary || Math.abs(position.z) > boundary) {
            return true;
        }
        
        // Check obstacle collision (simplified)
        const obstacles = this.objects.filter(obj => 
            obj.userData && obj.userData.type === 'obstacle'
        );
        
        for (const obstacle of obstacles) {
            const distance = position.distanceTo(obstacle.position);
            if (distance < radius + 1) { // Assuming obstacle radius of 1
                return true;
            }
        }
        
        return false;
    }

    destroy() {
        // Clean up all objects
        this.objects.forEach(obj => {
            this.scene.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
        });
        
        this.objects = [];
        this.collectibles = [];
        
        console.log('🌍 Environment destroyed');
    }
} 