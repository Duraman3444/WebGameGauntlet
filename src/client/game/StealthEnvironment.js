import * as THREE from 'three';

export class StealthEnvironment {
    constructor(scene, assetManager) {
        this.scene = scene;
        this.assetManager = assetManager;
        
        // Environment containers
        this.environmentGroup = new THREE.Group();
        this.securityGroup = new THREE.Group();
        this.lightingGroup = new THREE.Group();
        this.propsGroup = new THREE.Group();
        
        // Security systems
        this.lasers = [];
        this.cameras = [];
        this.spotlights = [];
        this.alarms = [];
        
        // Environment state
        this.alertLevel = 'GREEN'; // GREEN, YELLOW, RED
        this.emergencyLighting = false;
        this.securityActive = true;
        
        // Timing
        this.time = 0;
        
        // Create environment
        this.createEnvironment();
        
        // Add groups to scene
        this.scene.add(this.environmentGroup);
        this.scene.add(this.securityGroup);
        this.scene.add(this.lightingGroup);
        this.scene.add(this.propsGroup);
        
        console.log('🏢 StealthEnvironment initialized');
    }
    
    createEnvironment() {
        // Create facility structure
        this.createFacilityStructure();
        
        // Create security systems
        this.createSecuritySystems();
        
        // Create lighting
        this.createLighting();
        
        // Create props and furniture
        this.createProps();
        
        // Create objectives
        this.createObjectives();
    }
    
    createFacilityStructure() {
        console.log('🏗️ Creating facility structure...');
        
        // Ground floor
        const floor = this.assetManager.createTexturedMesh('plane', 'concrete');
        floor.scale.set(50, 1, 50);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = 0;
        floor.receiveShadow = true;
        this.environmentGroup.add(floor);
        
        // Ceiling
        const ceiling = this.assetManager.createPlaceholderMesh('ceiling');
        ceiling.scale.set(50, 1, 50);
        ceiling.position.y = 4;
        this.environmentGroup.add(ceiling);
        
        // Walls
        this.createWalls();
        
        // Doors
        this.createDoors();
        
        // Pillars
        this.createPillars();
    }
    
    createWalls() {
        const wallPositions = [
            // Outer walls
            { pos: [0, 2, 25], scale: [50, 4, 1], rot: [0, 0, 0] },
            { pos: [0, 2, -25], scale: [50, 4, 1], rot: [0, 0, 0] },
            { pos: [25, 2, 0], scale: [1, 4, 50], rot: [0, 0, 0] },
            { pos: [-25, 2, 0], scale: [1, 4, 50], rot: [0, 0, 0] },
            
            // Inner walls (creating rooms)
            { pos: [10, 2, 0], scale: [1, 4, 20], rot: [0, 0, 0] },
            { pos: [-10, 2, 0], scale: [1, 4, 20], rot: [0, 0, 0] },
            { pos: [0, 2, 10], scale: [20, 4, 1], rot: [0, 0, 0] },
            { pos: [0, 2, -10], scale: [20, 4, 1], rot: [0, 0, 0] }
        ];
        
        wallPositions.forEach(wall => {
            const wallMesh = this.assetManager.createTexturedMesh('box', 'concrete');
            wallMesh.position.set(...wall.pos);
            wallMesh.scale.set(...wall.scale);
            wallMesh.rotation.set(...wall.rot);
            wallMesh.castShadow = true;
            wallMesh.receiveShadow = true;
            this.environmentGroup.add(wallMesh);
        });
    }
    
    createDoors() {
        const doorPositions = [
            { pos: [0, 1.5, 10], rot: [0, 0, 0] },
            { pos: [0, 1.5, -10], rot: [0, 0, 0] },
            { pos: [10, 1.5, 5], rot: [0, Math.PI/2, 0] },
            { pos: [-10, 1.5, -5], rot: [0, Math.PI/2, 0] }
        ];
        
        doorPositions.forEach(door => {
            const doorMesh = this.assetManager.createPlaceholderMesh('door');
            doorMesh.position.set(...door.pos);
            doorMesh.rotation.set(...door.rot);
            doorMesh.castShadow = true;
            doorMesh.userData = { type: 'door', isLocked: false };
            this.environmentGroup.add(doorMesh);
        });
    }
    
    createPillars() {
        const pillarPositions = [
            [15, 2, 15],
            [15, 2, -15],
            [-15, 2, 15],
            [-15, 2, -15]
        ];
        
        pillarPositions.forEach(pos => {
            const pillar = this.assetManager.createPlaceholderMesh('cover');
            pillar.position.set(...pos);
            pillar.scale.set(1, 4, 1);
            pillar.castShadow = true;
            pillar.receiveShadow = true;
            this.environmentGroup.add(pillar);
        });
    }
    
    createSecuritySystems() {
        console.log('🔐 Creating security systems...');
        
        // Create laser security grid
        this.createLaserGrid();
        
        // Create security cameras
        this.createSecurityCameras();
        
        // Create motion sensors
        this.createMotionSensors();
        
        // Create alarm systems
        this.createAlarmSystems();
    }
    
    createLaserGrid() {
        const laserConfigs = [
            // Horizontal lasers
            { start: [-20, 1, 5], end: [20, 1, 5], color: 0xff0000 },
            { start: [-20, 1.5, -5], end: [20, 1.5, -5], color: 0xff0000 },
            { start: [-20, 2, 0], end: [20, 2, 0], color: 0xff0000 },
            
            // Vertical lasers
            { start: [5, 0.5, -20], end: [5, 0.5, 20], color: 0xff0000 },
            { start: [-5, 1, -20], end: [-5, 1, 20], color: 0xff0000 },
            
            // Diagonal lasers
            { start: [-15, 1, -15], end: [15, 1, 15], color: 0xff4444 },
            { start: [15, 1.5, -15], end: [-15, 1.5, 15], color: 0xff4444 }
        ];
        
        laserConfigs.forEach((config, index) => {
            const laser = this.createLaser(config.start, config.end, config.color);
            laser.userData = { id: index, type: 'laser', active: true };
            this.lasers.push(laser);
            this.securityGroup.add(laser);
        });
    }
    
    createLaser(start, end, color = 0xff0000) {
        const startPos = new THREE.Vector3(...start);
        const endPos = new THREE.Vector3(...end);
        const direction = endPos.clone().sub(startPos);
        const length = direction.length();
        direction.normalize();
        
        // Laser beam
        const laserGeometry = new THREE.CylinderGeometry(0.02, 0.02, length, 8);
        const laserMaterial = new THREE.MeshLambertMaterial({
            color: color,
            transparent: true,
            opacity: 0.8,
            emissive: color,
            emissiveIntensity: 0.5
        });
        
        const laser = new THREE.Mesh(laserGeometry, laserMaterial);
        laser.position.copy(startPos).add(endPos).multiplyScalar(0.5);
        laser.lookAt(endPos);
        laser.rotateX(Math.PI / 2);
        
        // Add emitter and receiver
        const emitter = this.assetManager.createPlaceholderMesh('pickup', 0x444444);
        emitter.scale.set(0.5, 0.5, 0.5);
        emitter.position.copy(startPos);
        laser.add(emitter);
        
        const receiver = this.assetManager.createPlaceholderMesh('pickup', 0x444444);
        receiver.scale.set(0.5, 0.5, 0.5);
        receiver.position.copy(endPos).sub(startPos);
        laser.add(receiver);
        
        // Store laser properties
        laser.userData.startPos = startPos;
        laser.userData.endPos = endPos;
        laser.userData.active = true;
        laser.userData.breached = false;
        
        return laser;
    }
    
    createSecurityCameras() {
        const cameraPositions = [
            { pos: [20, 3, 20], target: [0, 1, 0], range: 15 },
            { pos: [-20, 3, 20], target: [0, 1, 0], range: 15 },
            { pos: [20, 3, -20], target: [0, 1, 0], range: 15 },
            { pos: [-20, 3, -20], target: [0, 1, 0], range: 15 },
            { pos: [0, 3, 0], target: [10, 1, 0], range: 20 }
        ];
        
        cameraPositions.forEach((config, index) => {
            const camera = this.createSecurityCamera(config.pos, config.target, config.range);
            camera.userData = { id: index, type: 'camera', active: true };
            this.cameras.push(camera);
            this.securityGroup.add(camera);
        });
    }
    
    createSecurityCamera(position, target, range) {
        const cameraGroup = new THREE.Group();
        
        // Camera body
        const cameraBody = this.assetManager.createPlaceholderMesh('camera');
        cameraBody.scale.set(1, 1, 1.5);
        cameraGroup.add(cameraBody);
        
        // Camera lens
        const lens = this.assetManager.createPlaceholderMesh('pickup', 0x000000);
        lens.scale.set(0.3, 0.3, 0.1);
        lens.position.set(0, 0, 0.8);
        cameraGroup.add(lens);
        
        // Spotlight
        const spotlight = new THREE.SpotLight(0xffffff, 1, range, Math.PI / 6, 0.5, 2);
        spotlight.position.set(0, 0, 1);
        spotlight.target.position.set(0, 0, 10);
        spotlight.castShadow = true;
        cameraGroup.add(spotlight);
        cameraGroup.add(spotlight.target);
        
        // Position camera
        cameraGroup.position.set(...position);
        cameraGroup.lookAt(...target);
        
        // Store camera properties
        cameraGroup.userData.spotlight = spotlight;
        cameraGroup.userData.range = range;
        cameraGroup.userData.active = true;
        cameraGroup.userData.rotationSpeed = 0.5;
        cameraGroup.userData.detectionCone = Math.PI / 6;
        
        return cameraGroup;
    }
    
    createMotionSensors() {
        const sensorPositions = [
            [0, 2.5, 15],
            [0, 2.5, -15],
            [15, 2.5, 0],
            [-15, 2.5, 0]
        ];
        
        sensorPositions.forEach(pos => {
            const sensor = this.assetManager.createPlaceholderMesh('pickup', 0x00ff00);
            sensor.position.set(...pos);
            sensor.scale.set(0.3, 0.3, 0.3);
            sensor.userData = { type: 'motion_sensor', active: true, range: 5 };
            this.securityGroup.add(sensor);
        });
    }
    
    createAlarmSystems() {
        const alarmPositions = [
            [22, 3, 22],
            [-22, 3, 22],
            [22, 3, -22],
            [-22, 3, -22]
        ];
        
        alarmPositions.forEach(pos => {
            const alarm = this.assetManager.createPlaceholderMesh('pickup', 0xff0000);
            alarm.position.set(...pos);
            alarm.scale.set(0.4, 0.4, 0.4);
            alarm.userData = { type: 'alarm', active: false };
            this.alarms.push(alarm);
            this.securityGroup.add(alarm);
        });
    }
    
    createLighting() {
        console.log('💡 Creating lighting system...');
        
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.lightingGroup.add(ambientLight);
        
        // Main facility lights
        this.createFacilityLights();
        
        // Emergency lighting
        this.createEmergencyLights();
        
        // Security lighting
        this.createSecurityLights();
    }
    
    createFacilityLights() {
        const lightPositions = [
            [0, 3.5, 0],
            [10, 3.5, 10],
            [10, 3.5, -10],
            [-10, 3.5, 10],
            [-10, 3.5, -10]
        ];
        
        lightPositions.forEach(pos => {
            const light = new THREE.PointLight(0xffffff, 1, 15);
            light.position.set(...pos);
            light.castShadow = true;
            light.shadow.mapSize.width = 1024;
            light.shadow.mapSize.height = 1024;
            this.lightingGroup.add(light);
            
            // Light fixture
            const fixture = this.assetManager.createPlaceholderMesh('pickup', 0xffff00);
            fixture.position.set(...pos);
            fixture.scale.set(0.3, 0.1, 0.3);
            this.lightingGroup.add(fixture);
        });
    }
    
    createEmergencyLights() {
        const emergencyPositions = [
            [24, 3, 24],
            [-24, 3, 24],
            [24, 3, -24],
            [-24, 3, -24]
        ];
        
        emergencyPositions.forEach(pos => {
            const emergencyLight = new THREE.PointLight(0xff0000, 0, 10);
            emergencyLight.position.set(...pos);
            emergencyLight.userData = { type: 'emergency', active: false };
            this.lightingGroup.add(emergencyLight);
            
            // Emergency light fixture
            const fixture = this.assetManager.createPlaceholderMesh('pickup', 0xff0000);
            fixture.position.set(...pos);
            fixture.scale.set(0.2, 0.2, 0.2);
            this.lightingGroup.add(fixture);
        });
    }
    
    createSecurityLights() {
        // Security lights are handled by cameras
    }
    
    createProps() {
        console.log('📦 Creating props and furniture...');
        
        // Create cover objects
        this.createCoverObjects();
        
        // Create interactive objects
        this.createInteractiveObjects();
        
        // Create decorative objects
        this.createDecorativeObjects();
    }
    
    createCoverObjects() {
        const coverPositions = [
            { pos: [5, 0.75, 5], type: 'cover', scale: [2, 1.5, 0.5] },
            { pos: [-5, 0.75, -5], type: 'cover', scale: [2, 1.5, 0.5] },
            { pos: [15, 0.75, 0], type: 'cover', scale: [0.5, 1.5, 3] },
            { pos: [-15, 0.75, 0], type: 'cover', scale: [0.5, 1.5, 3] }
        ];
        
        coverPositions.forEach(cover => {
            const coverMesh = this.assetManager.createPlaceholderMesh(cover.type);
            coverMesh.position.set(...cover.pos);
            coverMesh.scale.set(...cover.scale);
            coverMesh.castShadow = true;
            coverMesh.receiveShadow = true;
            coverMesh.userData = { type: 'cover', canHide: true };
            this.propsGroup.add(coverMesh);
        });
    }
    
    createInteractiveObjects() {
        const interactablePositions = [
            { pos: [18, 0.5, 18], type: 'pickup', userData: { type: 'keycard', id: 'red' } },
            { pos: [-18, 0.5, -18], type: 'pickup', userData: { type: 'keycard', id: 'blue' } },
            { pos: [0, 0.5, 18], type: 'pickup', userData: { type: 'intel', id: 'documents' } },
            { pos: [12, 1, 12], type: 'pickup', userData: { type: 'terminal', id: 'security' } }
        ];
        
        interactablePositions.forEach(obj => {
            const mesh = this.assetManager.createPlaceholderMesh(obj.type);
            mesh.position.set(...obj.pos);
            mesh.userData = { ...obj.userData, interactable: true };
            
            // Add glow effect for important objects
            if (obj.userData.type === 'keycard') {
                mesh.material.emissive = new THREE.Color(0x004400);
                mesh.material.emissiveIntensity = 0.3;
            }
            
            this.propsGroup.add(mesh);
        });
    }
    
    createDecorativeObjects() {
        // Add some decorative elements
        const decorativePositions = [
            { pos: [8, 0.5, 8], type: 'cover', scale: [1, 1, 1] },
            { pos: [-8, 0.5, -8], type: 'cover', scale: [1, 1, 1] },
            { pos: [0, 0.5, 8], type: 'cover', scale: [1, 1, 1] },
            { pos: [8, 0.5, 0], type: 'cover', scale: [1, 1, 1] }
        ];
        
        decorativePositions.forEach(obj => {
            const mesh = this.assetManager.createPlaceholderMesh(obj.type, 0x8B4513);
            mesh.position.set(...obj.pos);
            mesh.scale.set(...obj.scale);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.userData = { type: 'decorative' };
            this.propsGroup.add(mesh);
        });
    }
    
    createObjectives() {
        console.log('🎯 Creating objectives...');
        
        // Main objective
        const mainObjective = this.assetManager.createPlaceholderMesh('objective');
        mainObjective.position.set(0, 1, -20);
        mainObjective.userData = { type: 'main_objective', id: 'data_core', completed: false };
        
        // Add pulsing glow effect
        mainObjective.material.emissive = new THREE.Color(0x444400);
        mainObjective.material.emissiveIntensity = 0.5;
        
        this.propsGroup.add(mainObjective);
        
        // Secondary objectives
        const secondaryObjectives = [
            { pos: [20, 1, 0], id: 'security_terminal' },
            { pos: [-20, 1, 0], id: 'backup_data' },
            { pos: [0, 1, 20], id: 'communication_hub' }
        ];
        
        secondaryObjectives.forEach(obj => {
            const objective = this.assetManager.createPlaceholderMesh('objective', 0x4444ff);
            objective.position.set(...obj.pos);
            objective.userData = { type: 'secondary_objective', id: obj.id, completed: false };
            objective.material.emissive = new THREE.Color(0x000044);
            objective.material.emissiveIntensity = 0.3;
            this.propsGroup.add(objective);
        });
    }
    
    update(deltaTime) {
        this.time += deltaTime;
        
        // Update security systems
        this.updateSecuritySystems(deltaTime);
        
        // Update lighting
        this.updateLighting(deltaTime);
        
        // Update animations
        this.updateAnimations(deltaTime);
    }
    
    updateSecuritySystems(deltaTime) {
        // Update laser animations
        this.updateLasers(deltaTime);
        
        // Update camera rotations
        this.updateCameras(deltaTime);
        
        // Update alarm states
        this.updateAlarms(deltaTime);
    }
    
    updateLasers(deltaTime) {
        this.lasers.forEach(laser => {
            if (laser.userData.active) {
                // Animate laser intensity
                const intensity = 0.5 + Math.sin(this.time * 5) * 0.2;
                laser.material.emissiveIntensity = intensity;
                laser.material.opacity = 0.6 + intensity * 0.4;
            }
        });
    }
    
    updateCameras(deltaTime) {
        this.cameras.forEach(camera => {
            if (camera.userData.active) {
                // Rotate camera back and forth
                const rotationAmount = Math.sin(this.time * camera.userData.rotationSpeed) * 0.5;
                camera.rotation.y = rotationAmount;
                
                // Update spotlight target
                const spotlight = camera.userData.spotlight;
                if (spotlight) {
                    spotlight.target.position.set(
                        Math.sin(rotationAmount) * 10,
                        1,
                        Math.cos(rotationAmount) * 10
                    );
                }
            }
        });
    }
    
    updateAlarms(deltaTime) {
        this.alarms.forEach(alarm => {
            if (alarm.userData.active) {
                // Flashing alarm effect
                const flash = Math.sin(this.time * 10) > 0;
                alarm.material.emissiveIntensity = flash ? 1 : 0;
            }
        });
    }
    
    updateLighting(deltaTime) {
        // Update emergency lighting
        if (this.emergencyLighting) {
            this.lightingGroup.children.forEach(child => {
                if (child.userData && child.userData.type === 'emergency') {
                    child.intensity = 0.5 + Math.sin(this.time * 8) * 0.3;
                }
            });
        }
    }
    
    updateAnimations(deltaTime) {
        // Animate objective items
        this.propsGroup.children.forEach(child => {
            if (child.userData.type === 'main_objective' || child.userData.type === 'secondary_objective') {
                child.rotation.y += deltaTime * 0.5;
                child.position.y = child.userData.baseY || child.position.y;
                child.position.y += Math.sin(this.time * 2) * 0.1;
                child.userData.baseY = child.position.y - Math.sin(this.time * 2) * 0.1;
            }
        });
    }
    
    // Security system controls
    triggerAlarm() {
        this.alertLevel = 'RED';
        this.emergencyLighting = true;
        
        this.alarms.forEach(alarm => {
            alarm.userData.active = true;
        });
        
        console.log('🚨 ALARM TRIGGERED!');
    }
    
    deactivateAlarm() {
        this.alertLevel = 'GREEN';
        this.emergencyLighting = false;
        
        this.alarms.forEach(alarm => {
            alarm.userData.active = false;
        });
        
        console.log('✅ Alarm deactivated');
    }
    
    disableLaser(laserId) {
        if (this.lasers[laserId]) {
            this.lasers[laserId].userData.active = false;
            this.lasers[laserId].visible = false;
            console.log(`🔓 Laser ${laserId} disabled`);
        }
    }
    
    enableLaser(laserId) {
        if (this.lasers[laserId]) {
            this.lasers[laserId].userData.active = true;
            this.lasers[laserId].visible = true;
            console.log(`🔒 Laser ${laserId} enabled`);
        }
    }
    
    // Collision detection
    checkLaserCollision(playerPosition, playerRadius = 0.4) {
        for (let laser of this.lasers) {
            if (!laser.userData.active) continue;
            
            const start = laser.userData.startPos;
            const end = laser.userData.endPos;
            
            // Simple line-sphere collision
            const distance = this.distanceToLineSegment(playerPosition, start, end);
            if (distance < playerRadius) {
                if (!laser.userData.breached) {
                    laser.userData.breached = true;
                    this.triggerAlarm();
                    return true;
                }
            } else {
                laser.userData.breached = false;
            }
        }
        return false;
    }
    
    distanceToLineSegment(point, start, end) {
        const line = end.clone().sub(start);
        const pointToStart = point.clone().sub(start);
        const projection = pointToStart.dot(line) / line.lengthSq();
        
        if (projection < 0) {
            return pointToStart.length();
        } else if (projection > 1) {
            return point.distanceTo(end);
        } else {
            const projectionPoint = start.clone().add(line.multiplyScalar(projection));
            return point.distanceTo(projectionPoint);
        }
    }
    
    // Public getters
    get currentAlertLevel() {
        return this.alertLevel;
    }
    
    get isAlarmActive() {
        return this.alertLevel === 'RED';
    }
    
    get activeLasers() {
        return this.lasers.filter(laser => laser.userData.active);
    }
    
    get activeCameras() {
        return this.cameras.filter(camera => camera.userData.active);
    }
    
    // Cleanup
    destroy() {
        // Remove all groups from scene
        this.scene.remove(this.environmentGroup);
        this.scene.remove(this.securityGroup);
        this.scene.remove(this.lightingGroup);
        this.scene.remove(this.propsGroup);
        
        // Dispose of all geometries and materials
        [this.environmentGroup, this.securityGroup, this.lightingGroup, this.propsGroup].forEach(group => {
            group.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        });
        
        console.log('🧹 StealthEnvironment destroyed');
    }
} 