import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class MapLoader {
  constructor(scene) {
    this.scene = scene;
    this.loader = new GLTFLoader();
    this.currentMap = null;
    this.mapCollisionMeshes = [];
    this.mapName = null;
    this.loadedMaps = new Map();
  }

  async loadMap(mapPath, mapName = 'default') {
    try {
      console.log(`🗺️ Loading map: ${mapPath}`);
      
      // Clear current map if exists
      if (this.currentMap) {
        this.clearCurrentMap();
      }

      // Load the GLB/GLTF file
      const gltf = await this.loadGLTF(mapPath);
      
      // Process the loaded model
      const mapGroup = this.processMapModel(gltf, mapName);
      
      // Add to scene
      this.scene.add(mapGroup);
      
      // Store references
      this.currentMap = mapGroup;
      this.mapName = mapName;
      this.loadedMaps.set(mapName, mapGroup);
      
      // Calculate spawn point inside the map
      const spawnPoint = this.findOptimalSpawnPoint();
      
      console.log(`✅ Map loaded successfully: ${mapName}`);
      console.log(`📍 Spawn point: ${spawnPoint.x.toFixed(2)}, ${spawnPoint.y.toFixed(2)}, ${spawnPoint.z.toFixed(2)}`);
      
      return { mapGroup, spawnPoint };
      
    } catch (error) {
      console.error(`❌ Failed to load map ${mapPath}:`, error);
      throw error;
    }
  }

  loadGLTF(path) {
    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        (gltf) => resolve(gltf),
        (progress) => {
          const percentage = (progress.loaded / progress.total) * 100;
          console.log(`📦 Loading progress: ${percentage.toFixed(1)}%`);
        },
        (error) => reject(error)
      );
    });
  }

  processMapModel(gltf, mapName) {
    const mapGroup = new THREE.Group();
    mapGroup.name = `map_${mapName}`;
    
    // Clone the scene to avoid modifying the original
    const model = gltf.scene.clone();
    
    // Process materials and lighting
    this.optimizeMapMaterials(model);
    
    // Set up shadows
    this.setupMapShadows(model);
    
    // Generate collision meshes
    this.generateCollisionMeshes(model);
    
    // Scale the model if needed
    this.scaleMapModel(model, mapName);
    
    // Position the model
    this.positionMapModel(model, mapName);
    
    mapGroup.add(model);
    
    return mapGroup;
  }

  optimizeMapMaterials(model) {
    model.traverse((child) => {
      if (child.isMesh) {
        // Optimize materials for performance
        if (child.material) {
          // Reduce shadow casting for better performance
          child.receiveShadow = true;
          child.castShadow = false; // Disable shadow casting for map objects
          
          // Optimize material properties
          if (child.material.map) {
            child.material.map.generateMipmaps = false;
            child.material.map.minFilter = THREE.LinearFilter;
            child.material.map.magFilter = THREE.LinearFilter;
            child.material.map.anisotropy = 1; // Reduce anisotropic filtering
          }
          
          // Enable vertex colors if available
          if (child.geometry.attributes.color) {
            child.material.vertexColors = true;
          }
          
          // Optimize material for performance
          if (child.material.normalMap) {
            child.material.normalMap.generateMipmaps = false;
          }
          
          // Reduce material complexity
          child.material.transparent = false;
          child.material.alphaTest = 0;
        }
        
        // Optimize geometry
        if (child.geometry) {
          child.geometry.computeBoundingSphere();
          child.geometry.computeBoundingBox();
        }
      }
    });
  }

  setupMapShadows(model) {
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }

  generateCollisionMeshes(model) {
    // Clear existing collision meshes
    this.mapCollisionMeshes = [];
    
    model.traverse((child) => {
      if (child.isMesh) {
        // Create collision mesh from geometry
        const collisionMesh = child.clone();
        collisionMesh.material = new THREE.MeshBasicMaterial({
          transparent: true,
          opacity: 0,
          wireframe: true
        });
        collisionMesh.visible = false; // Hide collision mesh
        collisionMesh.userData = {
          isCollision: true,
          originalMesh: child,
          isMapCollision: true
        };
        
        // Ensure geometry is properly set up for raycasting
        if (collisionMesh.geometry) {
          collisionMesh.geometry.computeBoundingSphere();
          collisionMesh.geometry.computeBoundingBox();
        }
        
        this.mapCollisionMeshes.push(collisionMesh);
        this.scene.add(collisionMesh);
      }
    });
    
    console.log(`🔗 Generated ${this.mapCollisionMeshes.length} collision meshes for ${this.mapName}`);
  }

  scaleMapModel(model, mapName) {
    // Different scaling based on map name/type
    const scaleFactors = {
      'dust2': 0.1,
      'de_dust2_-_cs_map': 0.1,
      'de_dust2': 0.1,
      'cs_dust2': 0.1,
      'shipment': 0.08,
      'nuketown': 0.12,
      'mirage': 0.1,
      'inferno': 0.1,
      'cache': 0.1,
      'default': 0.1
    };
    
    const scaleFactor = scaleFactors[mapName] || scaleFactors.default;
    model.scale.setScalar(scaleFactor);
    
    console.log(`📏 Scaled map by factor: ${scaleFactor} for ${mapName}`);
    
    // Store scale factor for collision detection
    this.mapScaleFactor = scaleFactor;
  }

  positionMapModel(model, mapName) {
    // Center the model at origin
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    
    model.position.sub(center);
    model.position.y = 0; // Keep at ground level
    
    console.log(`📍 Positioned map at origin`);
  }

  clearCurrentMap() {
    if (this.currentMap) {
      this.scene.remove(this.currentMap);
      
      // Clear collision meshes
      this.mapCollisionMeshes.forEach(mesh => {
        this.scene.remove(mesh);
      });
      this.mapCollisionMeshes = [];
      
      // Dispose of materials and geometries
      this.currentMap.traverse((child) => {
        if (child.geometry) {
          child.geometry.dispose();
        }
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(material => material.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      
      this.currentMap = null;
      this.mapName = null;
      
      console.log('🗑️ Cleared current map');
    }
  }

  findOptimalSpawnPoint() {
    if (!this.currentMap) {
      return new THREE.Vector3(0, 2, 0);
    }

    const box = new THREE.Box3().setFromObject(this.currentMap);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Try to find a good spawn point inside the map
    // Start from the center and move upward to find a clear position
    const spawnPoint = center.clone();
    spawnPoint.y = box.min.y + size.y * 0.1; // Start slightly above the bottom
    
    // Try different positions to find one that's not inside geometry
    const testPositions = [
      spawnPoint.clone(),
      spawnPoint.clone().add(new THREE.Vector3(size.x * 0.2, 0, 0)),
      spawnPoint.clone().add(new THREE.Vector3(-size.x * 0.2, 0, 0)),
      spawnPoint.clone().add(new THREE.Vector3(0, 0, size.z * 0.2)),
      spawnPoint.clone().add(new THREE.Vector3(0, 0, -size.z * 0.2)),
      spawnPoint.clone().add(new THREE.Vector3(0, size.y * 0.3, 0))
    ];
    
    for (const testPos of testPositions) {
      if (this.isValidSpawnPosition(testPos)) {
        return testPos;
      }
    }
    
    // Fallback to center position raised up
    return new THREE.Vector3(center.x, center.y + size.y * 0.3, center.z);
  }

  isValidSpawnPosition(position) {
    // Simple check to ensure the position is not inside solid geometry
    const raycaster = new THREE.Raycaster();
    const directions = [
      new THREE.Vector3(0, -1, 0), // Down
      new THREE.Vector3(0, 1, 0),  // Up
      new THREE.Vector3(1, 0, 0),  // Right
      new THREE.Vector3(-1, 0, 0), // Left
      new THREE.Vector3(0, 0, 1),  // Forward
      new THREE.Vector3(0, 0, -1)  // Backward
    ];
    
    let clearDirections = 0;
    
    for (const direction of directions) {
      raycaster.set(position, direction);
      const intersections = raycaster.intersectObjects(this.scene.children, true);
      
      // If there's no intersection within 1 unit, this direction is clear
      if (intersections.length === 0 || intersections[0].distance > 1) {
        clearDirections++;
      }
    }
    
    // Position is valid if at least 3 directions are clear
    return clearDirections >= 3;
  }

  checkCollisionWithMap(position, radius = 0.5) {
    if (!this.currentMap || this.mapCollisionMeshes.length === 0) return [];
    
    const collisions = [];
    const raycaster = new THREE.Raycaster();
    
    // Check collision in multiple directions around the player
    const directions = [
      new THREE.Vector3(1, 0, 0),   // Right
      new THREE.Vector3(-1, 0, 0),  // Left
      new THREE.Vector3(0, 0, 1),   // Forward
      new THREE.Vector3(0, 0, -1),  // Backward
      new THREE.Vector3(0, -1, 0),  // Down
    ];
    
    for (const direction of directions) {
      raycaster.set(position, direction);
      const intersections = raycaster.intersectObjects(this.mapCollisionMeshes, false);
      
      for (const intersection of intersections) {
        if (intersection.distance < radius) {
          collisions.push({
            object: intersection.object,
            point: intersection.point,
            distance: intersection.distance,
            normal: intersection.face ? intersection.face.normal : new THREE.Vector3(0, 1, 0),
            direction: direction
          });
        }
      }
    }
    
    return collisions;
  }

  getGroundHeight(position) {
    if (!this.currentMap || this.mapCollisionMeshes.length === 0) return 0;
    
    const raycaster = new THREE.Raycaster();
    raycaster.set(position, new THREE.Vector3(0, -1, 0));
    
    // First try to raycast against collision meshes
    const intersections = raycaster.intersectObjects(this.mapCollisionMeshes, false);
    
    if (intersections.length > 0) {
      // Sort by distance and return the closest ground
      intersections.sort((a, b) => a.distance - b.distance);
      console.log(`🎯 Ground height found at: ${intersections[0].point.y.toFixed(2)} for position (${position.x.toFixed(2)}, ${position.z.toFixed(2)})`);
      return intersections[0].point.y;
    }
    
    // Fallback: try with all scene children
    const allIntersections = raycaster.intersectObjects(this.scene.children, true);
    
    for (const intersection of allIntersections) {
      if (intersection.object.userData && intersection.object.userData.isMapCollision) {
        console.log(`🎯 Fallback ground height found at: ${intersection.point.y.toFixed(2)}`);
        return intersection.point.y;
      }
    }
    
    console.log(`⚠️ No ground detected at position (${position.x.toFixed(2)}, ${position.z.toFixed(2)}), returning 0`);
    return 0;
  }

  getMapSpawnPoints() {
    // Generate spawn points based on map geometry
    const spawnPoints = [];
    
    if (this.currentMap) {
      // Simple spawn point generation - can be improved
      const mapSize = this.getMapSize();
      const numSpawns = 8;
      
      for (let i = 0; i < numSpawns; i++) {
        const angle = (i / numSpawns) * Math.PI * 2;
        const radius = mapSize * 0.3;
        
        const spawnPoint = new THREE.Vector3(
          Math.cos(angle) * radius,
          2,
          Math.sin(angle) * radius
        );
        
        spawnPoints.push(spawnPoint);
      }
    }
    
    return spawnPoints;
  }

  getMapSize() {
    if (!this.currentMap) return 50;
    
    const box = new THREE.Box3().setFromObject(this.currentMap);
    const size = box.getSize(new THREE.Vector3());
    return Math.max(size.x, size.z);
  }

  async loadAvailableMaps() {
    try {
      console.log('🔍 Fetching available maps from server...');
      const response = await fetch('http://localhost:3001/api/maps');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch maps');
      }
      
      const availableMaps = data.maps || [];
      
      console.log(`📂 Found ${availableMaps.length} available maps:`, availableMaps);
      return availableMaps;
      
    } catch (error) {
      console.error('❌ Failed to fetch maps from server:', error);
      
      // Fallback to empty array if server endpoint fails
      console.log('🔄 Using empty map list as fallback');
      return [];
    }
  }



  getCurrentMapInfo() {
    return {
      name: this.mapName,
      hasMap: !!this.currentMap,
      collisionMeshes: this.mapCollisionMeshes.length,
      spawnPoints: this.getMapSpawnPoints().length,
      size: this.getMapSize(),
      scaleFactor: this.mapScaleFactor || 1
    };
  }

  // Debug method to check collision detection
  debugGroundDetection(position) {
    if (!this.currentMap) return null;
    
    const raycaster = new THREE.Raycaster();
    raycaster.set(position, new THREE.Vector3(0, -1, 0));
    raycaster.far = 1000; // Increase raycast distance
    
    const intersections = raycaster.intersectObjects(this.mapCollisionMeshes, false);
    
    console.log(`🔍 Debug ground detection at (${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)})`);
    console.log(`🔍 Found ${intersections.length} intersections`);
    
    if (intersections.length > 0) {
      intersections.forEach((intersection, index) => {
        console.log(`🔍 Intersection ${index}: distance=${intersection.distance.toFixed(2)}, point=(${intersection.point.x.toFixed(2)}, ${intersection.point.y.toFixed(2)}, ${intersection.point.z.toFixed(2)})`);
      });
    }
    
    return intersections;
  }

  // Get a safe spawn position to prevent falling through map
  getSafeSpawnPosition() {
    if (!this.currentMap) return new THREE.Vector3(0, 2, 0);
    
    const box = new THREE.Box3().setFromObject(this.currentMap);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Start well above the map
    let testPosition = new THREE.Vector3(center.x, box.max.y + 10, center.z);
    
    // Cast ray downward to find first solid ground
    const groundHeight = this.getGroundHeight(testPosition);
    
    if (groundHeight > -1000) {
      testPosition.y = groundHeight + 2; // Place player 2 units above ground
      console.log(`🛡️ Safe spawn position found at (${testPosition.x.toFixed(2)}, ${testPosition.y.toFixed(2)}, ${testPosition.z.toFixed(2)})`);
      return testPosition;
    }
    
    // Fallback to center of map bounding box
    testPosition.y = center.y + size.y * 0.5;
    console.log(`🛡️ Using fallback spawn position at (${testPosition.x.toFixed(2)}, ${testPosition.y.toFixed(2)}, ${testPosition.z.toFixed(2)})`);
    return testPosition;
  }
} 