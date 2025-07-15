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
      
      console.log(`✅ Map loaded successfully: ${mapName}`);
      return mapGroup;
      
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
          // Enable shadow receiving
          child.receiveShadow = true;
          child.castShadow = true;
          
          // Optimize material properties
          if (child.material.map) {
            child.material.map.generateMipmaps = false;
            child.material.map.minFilter = THREE.LinearFilter;
            child.material.map.magFilter = THREE.LinearFilter;
          }
          
          // Enable vertex colors if available
          if (child.geometry.attributes.color) {
            child.material.vertexColors = true;
          }
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
          originalMesh: child
        };
        
        this.mapCollisionMeshes.push(collisionMesh);
        this.scene.add(collisionMesh);
      }
    });
    
    console.log(`🔗 Generated ${this.mapCollisionMeshes.length} collision meshes`);
  }

  scaleMapModel(model, mapName) {
    // Different scaling based on map name/type
    const scaleFactors = {
      'dust2': 0.1,
      'shipment': 0.08,
      'nuketown': 0.12,
      'default': 0.1
    };
    
    const scaleFactor = scaleFactors[mapName] || scaleFactors.default;
    model.scale.setScalar(scaleFactor);
    
    console.log(`📏 Scaled map by factor: ${scaleFactor}`);
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

  checkCollisionWithMap(position, radius = 1) {
    const collisions = [];
    
    this.mapCollisionMeshes.forEach(mesh => {
      const distance = mesh.position.distanceTo(position);
      if (distance < radius) {
        collisions.push({
          mesh: mesh,
          distance: distance,
          point: mesh.position.clone()
        });
      }
    });
    
    return collisions;
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
    const availableMaps = [];
    
    // Common map filenames to look for
    const mapFiles = [
      'map.glb',
      'level.glb',
      'scene.glb',
      'dust2.glb',
      'shipment.glb',
      'nuketown.glb',
      'test.glb'
    ];
    
    // Check each file individually
    for (const filename of mapFiles) {
      try {
        const response = await fetch(`/maps/${filename}`, { method: 'HEAD' });
        if (response.ok && response.status === 200) {
          const contentLength = response.headers.get('content-length');
          const contentType = response.headers.get('content-type');
          
          // Only add if it's actually a GLB file (not HTML from SPA routing)
          if (contentType && 
              (contentType.includes('gltf') || 
               contentType.includes('octet-stream') || 
               contentType.includes('application/octet-stream')) &&
              !contentType.includes('text/html') &&
              contentLength && 
              parseInt(contentLength) > 100) { // Must be larger than 100 bytes
            availableMaps.push({
              name: filename.replace('.glb', ''),
              path: `/maps/${filename}`,
              size: contentLength ? parseInt(contentLength) : 0,
              filename: filename
            });
          } else {
            console.log(`📂 Skipping ${filename}: Invalid content type (${contentType}) or size (${contentLength})`);
          }
        } else {
          console.log(`📂 Skipping ${filename}: HTTP ${response.status}`);
        }
      } catch (error) {
        // File doesn't exist or can't be accessed, skip it
        console.log(`📂 Skipping ${filename}: ${error.message}`);
      }
    }
    
    // Also try to discover any other .glb files in the maps directory
    await this.discoverAdditionalMaps(availableMaps);
    
    console.log(`📂 Found ${availableMaps.length} available maps:`, availableMaps);
    return availableMaps;
  }

  async discoverAdditionalMaps(availableMaps) {
    // Try to find additional GLB files beyond the common ones
    const additionalFiles = [
      'mirage.glb',
      'rust.glb',
      'inferno.glb',
      'cache.glb',
      'overpass.glb'
    ];
    
    for (const filename of additionalFiles) {
      // Skip if we already have this file
      if (availableMaps.some(map => map.filename === filename)) {
        continue;
      }
      
      try {
        const response = await fetch(`/maps/${filename}`, { method: 'HEAD' });
        if (response.ok && response.status === 200) {
          const contentLength = response.headers.get('content-length');
          const contentType = response.headers.get('content-type');
          
          if (contentType && 
              (contentType.includes('gltf') || 
               contentType.includes('octet-stream') || 
               contentType.includes('application/octet-stream')) &&
              !contentType.includes('text/html') &&
              contentLength && 
              parseInt(contentLength) > 100) {
            availableMaps.push({
              name: filename.replace('.glb', ''),
              path: `/maps/${filename}`,
              size: contentLength ? parseInt(contentLength) : 0,
              filename: filename
            });
          }
        }
      } catch (error) {
        // File doesn't exist, continue
      }
    }
  }

  getCurrentMapInfo() {
    return {
      name: this.mapName,
      hasMap: !!this.currentMap,
      collisionMeshes: this.mapCollisionMeshes.length,
      spawnPoints: this.getMapSpawnPoints().length,
      size: this.getMapSize()
    };
  }
} 