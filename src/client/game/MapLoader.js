import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

export class MapLoader {
    constructor(scene, assetManager) {
        this.scene = scene;
        this.assetManager = assetManager;
        
        // Loaders for different formats
        this.gltfLoader = new GLTFLoader();
        this.fbxLoader = new FBXLoader();
        this.objLoader = new OBJLoader();
        
        // Map conversion settings
        this.conversionSettings = {
            // Scale factor for different game maps
            scaleFactors: {
                'cod_shipment': 0.8,
                'cod_rust': 1.0,
                'cod_nuketown': 0.9,
                'cs_dust2': 1.2,
                'cs_mirage': 1.1,
                'default': 1.0
            },
            
            // Stealth conversion rules
            stealthElements: {
                // Areas that should become cover spots
                coverSpots: ['crates', 'barrels', 'containers', 'walls'],
                
                // Areas for enemy patrol routes
                patrolRoutes: ['corridors', 'open_areas', 'walkways'],
                
                // Good locations for objectives
                objectiveSpots: ['corners', 'elevated_areas', 'secure_rooms'],
                
                // Lighting modifications
                lighting: {
                    ambientLevel: 0.3,
                    shadowIntensity: 0.8,
                    addDarkZones: true
                }
            }
        };
        
        // Available classic maps
        this.availableMaps = {
            'cod_shipment': {
                name: 'Shipment',
                game: 'Call of Duty',
                size: 'small',
                theme: 'industrial',
                description: 'Tight quarters combat in a shipping container yard',
                stealthProfile: {
                    difficulty: 'hard',
                    coverDensity: 'high',
                    patrolComplexity: 'medium',
                    objectiveCount: 3
                }
            },
            'cod_rust': {
                name: 'Rust',
                game: 'Call of Duty',
                size: 'small',
                theme: 'industrial',
                description: 'Abandoned industrial facility with multi-level gameplay',
                stealthProfile: {
                    difficulty: 'medium',
                    coverDensity: 'medium',
                    patrolComplexity: 'high',
                    objectiveCount: 4
                }
            },
            'cod_nuketown': {
                name: 'Nuketown',
                game: 'Call of Duty',
                size: 'small',
                theme: 'suburban',
                description: 'Nuclear test town with house-to-house combat',
                stealthProfile: {
                    difficulty: 'medium',
                    coverDensity: 'medium',
                    patrolComplexity: 'medium',
                    objectiveCount: 5
                }
            },
            'cs_dust2': {
                name: 'Dust 2',
                game: 'Counter-Strike',
                size: 'medium',
                theme: 'desert',
                description: 'Classic Middle Eastern town with long sightlines',
                stealthProfile: {
                    difficulty: 'hard',
                    coverDensity: 'low',
                    patrolComplexity: 'high',
                    objectiveCount: 4
                }
            },
            'cs_mirage': {
                name: 'Mirage',
                game: 'Counter-Strike',
                size: 'medium',
                theme: 'desert',
                description: 'Moroccan-inspired map with varied engagement distances',
                stealthProfile: {
                    difficulty: 'medium',
                    coverDensity: 'medium',
                    patrolComplexity: 'high',
                    objectiveCount: 6
                }
            }
        };
        
        // Current loaded map
        this.currentMap = null;
        this.mapGroup = new THREE.Group();
        this.scene.add(this.mapGroup);
        
        console.log('🗺️ MapLoader initialized with', Object.keys(this.availableMaps).length, 'available maps');
    }
    
    async loadMapFromSketchfab(sketchfabUrl, mapId) {
        console.log(`📥 Loading map from Sketchfab: ${sketchfabUrl}`);
        
        try {
            // Clear existing map
            this.clearCurrentMap();
            
            // Extract model URL and format
            const modelInfo = this.extractSketchfabInfo(sketchfabUrl);
            
            // Load the model based on format
            let model;
            switch (modelInfo.format) {
                case 'gltf':
                    model = await this.loadGLTF(modelInfo.url);
                    break;
                case 'fbx':
                    model = await this.loadFBX(modelInfo.url);
                    break;
                case 'obj':
                    model = await this.loadOBJ(modelInfo.url);
                    break;
                default:
                    throw new Error(`Unsupported format: ${modelInfo.format}`);
            }
            
            // Apply map-specific transformations
            this.applyMapTransformations(model, mapId);
            
            // Convert to stealth environment
            await this.convertToStealthMap(model, mapId);
            
            // Add to scene
            this.mapGroup.add(model);
            this.currentMap = { model, mapId, info: this.availableMaps[mapId] };
            
            console.log(`✅ Map loaded successfully: ${this.availableMaps[mapId]?.name || mapId}`);
            
            return model;
            
        } catch (error) {
            console.error('❌ Failed to load map:', error);
            throw error;
        }
    }
    
    async loadGLTF(url) {
        return new Promise((resolve, reject) => {
            this.gltfLoader.load(
                url,
                (gltf) => resolve(gltf.scene),
                (progress) => console.log('Loading progress:', progress),
                (error) => reject(error)
            );
        });
    }
    
    async loadFBX(url) {
        return new Promise((resolve, reject) => {
            this.fbxLoader.load(
                url,
                (fbx) => resolve(fbx),
                (progress) => console.log('Loading progress:', progress),
                (error) => reject(error)
            );
        });
    }
    
    async loadOBJ(url) {
        return new Promise((resolve, reject) => {
            this.objLoader.load(
                url,
                (obj) => resolve(obj),
                (progress) => console.log('Loading progress:', progress),
                (error) => reject(error)
            );
        });
    }
    
    extractSketchfabInfo(url) {
        // Parse Sketchfab URL to extract model info
        // This is a simplified version - in reality, you'd use Sketchfab's API
        const modelId = url.match(/models\/([^\/]+)/)?.[1];
        
        return {
            id: modelId,
            url: url,
            format: 'gltf', // Most Sketchfab models are available in GLTF
            downloadUrl: `${url}/download` // This would need proper API integration
        };
    }
    
    applyMapTransformations(model, mapId) {
        const scaleFactor = this.conversionSettings.scaleFactors[mapId] || 
                           this.conversionSettings.scaleFactors.default;
        
        model.scale.multiplyScalar(scaleFactor);
        
        // Apply specific transformations based on map
        switch (mapId) {
            case 'cod_shipment':
                model.position.set(0, 0, 0);
                model.rotation.y = 0;
                break;
            case 'cod_rust':
                model.position.set(0, 0, 0);
                model.rotation.y = Math.PI / 4; // 45 degree rotation
                break;
            case 'cs_dust2':
                model.position.set(0, 0, 0);
                model.rotation.y = Math.PI / 2; // 90 degree rotation
                break;
            default:
                model.position.set(0, 0, 0);
                break;
        }
    }
    
    async convertToStealthMap(model, mapId) {
        console.log(`🔄 Converting ${mapId} to stealth environment...`);
        
        const mapInfo = this.availableMaps[mapId];
        if (!mapInfo) {
            console.warn(`No conversion profile found for ${mapId}`);
            return;
        }
        
        // Analyze the map geometry
        const analysis = this.analyzeMapGeometry(model);
        
        // Apply stealth lighting
        this.applyStealthLighting(model, mapInfo.stealthProfile);
        
        // Add stealth elements
        this.addStealthElements(model, analysis, mapInfo.stealthProfile);
        
        // Create patrol routes
        this.createPatrolRoutes(analysis, mapInfo.stealthProfile);
        
        // Place objectives
        this.placeObjectives(analysis, mapInfo.stealthProfile);
        
        console.log(`✅ Map converted to stealth environment`);
    }
    
    analyzeMapGeometry(model) {
        const analysis = {
            coverSpots: [],
            patrolRoutes: [],
            objectiveSpots: [],
            lightingNodes: [],
            doorways: [],
            windows: [],
            elevatedAreas: []
        };
        
        model.traverse((child) => {
            if (child.isMesh) {
                const position = child.position.clone();
                const size = new THREE.Box3().setFromObject(child).getSize(new THREE.Vector3());
                
                // Classify geometry based on size and position
                if (size.y > 2 && size.x < 2 && size.z < 2) {
                    // Likely a pillar or wall - good for cover
                    analysis.coverSpots.push({
                        position: position.clone(),
                        size: size.clone(),
                        type: 'vertical_cover'
                    });
                } else if (size.y < 1 && (size.x > 2 || size.z > 2)) {
                    // Likely a crate or low wall - good for cover
                    analysis.coverSpots.push({
                        position: position.clone(),
                        size: size.clone(),
                        type: 'horizontal_cover'
                    });
                } else if (size.y < 0.5 && size.x > 5 && size.z > 5) {
                    // Likely floor - good for patrol routes
                    analysis.patrolRoutes.push({
                        position: position.clone(),
                        size: size.clone(),
                        type: 'floor'
                    });
                } else if (position.y > 3) {
                    // Elevated area - good for objectives
                    analysis.elevatedAreas.push({
                        position: position.clone(),
                        size: size.clone(),
                        type: 'elevated'
                    });
                }
            }
        });
        
        return analysis;
    }
    
    applyStealthLighting(model, stealthProfile) {
        const lightingSettings = this.conversionSettings.stealthElements.lighting;
        
        // Reduce overall lighting for stealth atmosphere
        model.traverse((child) => {
            if (child.isMesh && child.material) {
                if (child.material.emissive) {
                    child.material.emissive.multiplyScalar(lightingSettings.ambientLevel);
                }
                
                // Enhance shadows
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        // Add strategic lighting
        this.addStealthLights(model, stealthProfile);
    }
    
    addStealthLights(model, stealthProfile) {
        const lights = [];
        
        // Add dim ambient lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.mapGroup.add(ambientLight);
        lights.push(ambientLight);
        
        // Add strategic spotlights for guard positions
        for (let i = 0; i < 3; i++) {
            const spotlight = new THREE.SpotLight(0xffffff, 0.5, 20, Math.PI / 6, 0.5, 1);
            spotlight.position.set(
                (Math.random() - 0.5) * 40,
                8,
                (Math.random() - 0.5) * 40
            );
            spotlight.target.position.set(
                spotlight.position.x,
                0,
                spotlight.position.z
            );
            spotlight.castShadow = true;
            
            this.mapGroup.add(spotlight);
            this.mapGroup.add(spotlight.target);
            lights.push(spotlight);
        }
        
        console.log(`💡 Added ${lights.length} stealth lights`);
    }
    
    addStealthElements(model, analysis, stealthProfile) {
        // Add additional cover elements
        analysis.coverSpots.forEach((spot, index) => {
            if (Math.random() < 0.3) { // 30% chance to add additional cover
                const cover = this.assetManager.createPlaceholderMesh('cover');
                cover.position.copy(spot.position);
                cover.position.y += 0.5;
                this.mapGroup.add(cover);
            }
        });
        
        // Add security cameras
        for (let i = 0; i < 2; i++) {
            const camera = this.assetManager.createPlaceholderMesh('camera');
            camera.position.set(
                (Math.random() - 0.5) * 30,
                4,
                (Math.random() - 0.5) * 30
            );
            this.mapGroup.add(camera);
        }
        
        // Add laser grids in strategic locations
        for (let i = 0; i < 3; i++) {
            const laser = this.assetManager.createPlaceholderMesh('laser');
            laser.position.set(
                (Math.random() - 0.5) * 25,
                1.5,
                (Math.random() - 0.5) * 25
            );
            laser.rotation.y = Math.random() * Math.PI * 2;
            this.mapGroup.add(laser);
        }
        
        console.log(`🛡️ Added stealth elements to map`);
    }
    
    createPatrolRoutes(analysis, stealthProfile) {
        const routes = [];
        
        // Create simple patrol routes based on floor analysis
        const patrolPoints = analysis.patrolRoutes.slice(0, 6);
        
        patrolPoints.forEach((point, index) => {
            const route = {
                id: `patrol_${index}`,
                points: [
                    point.position.clone(),
                    point.position.clone().add(new THREE.Vector3(10, 0, 0)),
                    point.position.clone().add(new THREE.Vector3(10, 0, 10)),
                    point.position.clone().add(new THREE.Vector3(0, 0, 10))
                ],
                speed: 2,
                waitTime: 3
            };
            routes.push(route);
        });
        
        console.log(`🚶 Created ${routes.length} patrol routes`);
        return routes;
    }
    
    placeObjectives(analysis, stealthProfile) {
        const objectives = [];
        
        // Place primary objective
        const primarySpot = analysis.elevatedAreas[0] || analysis.coverSpots[0];
        if (primarySpot) {
            const objective = this.assetManager.createPlaceholderMesh('objective');
            objective.position.copy(primarySpot.position);
            objective.position.y += 2;
            this.mapGroup.add(objective);
            objectives.push({ type: 'primary', position: primarySpot.position });
        }
        
        // Place secondary objectives
        for (let i = 0; i < stealthProfile.objectiveCount - 1; i++) {
            const spot = analysis.coverSpots[i + 1] || analysis.patrolRoutes[i];
            if (spot) {
                const objective = this.assetManager.createPlaceholderMesh('pickup');
                objective.position.copy(spot.position);
                objective.position.y += 1;
                this.mapGroup.add(objective);
                objectives.push({ type: 'secondary', position: spot.position });
            }
        }
        
        console.log(`🎯 Placed ${objectives.length} objectives`);
        return objectives;
    }
    
    clearCurrentMap() {
        if (this.currentMap) {
            this.mapGroup.clear();
            this.currentMap = null;
            console.log('🗑️ Cleared current map');
        }
    }
    
    getCurrentMap() {
        return this.currentMap;
    }
    
    getAvailableMaps() {
        return this.availableMaps;
    }
    
    // Method to load a map from a local file (for testing)
    async loadLocalMap(filePath, mapId) {
        console.log(`📂 Loading local map: ${filePath}`);
        
        try {
            const extension = filePath.split('.').pop().toLowerCase();
            let model;
            
            switch (extension) {
                case 'gltf':
                case 'glb':
                    model = await this.loadGLTF(filePath);
                    break;
                case 'fbx':
                    model = await this.loadFBX(filePath);
                    break;
                case 'obj':
                    model = await this.loadOBJ(filePath);
                    break;
                default:
                    throw new Error(`Unsupported file format: ${extension}`);
            }
            
            this.applyMapTransformations(model, mapId);
            await this.convertToStealthMap(model, mapId);
            
            this.mapGroup.add(model);
            this.currentMap = { model, mapId, info: this.availableMaps[mapId] };
            
            console.log(`✅ Local map loaded successfully`);
            return model;
            
        } catch (error) {
            console.error('❌ Failed to load local map:', error);
            throw error;
        }
    }
} 