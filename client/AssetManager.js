import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class AssetManager {
  constructor() {
    this.loader = new GLTFLoader();
    this.loadedAssets = new Map();
    this.loadingPromises = new Map();
    this.animationMixers = new Map();
    
    // Asset definitions with fallback placeholders
    this.assets = {
      characters: {
        soldier: {
          model: '/assets/characters/soldier.glb',
          name: 'Soldier',
          color: 0x2e7d32,
          stats: { health: 100, speed: 1.0, damage: 20 }
        },
        sniper: {
          model: '/assets/characters/sniper.glb',
          name: 'Sniper',
          color: 0x1565c0,
          stats: { health: 80, speed: 0.8, damage: 50 }
        },
        assault: {
          model: '/assets/characters/assault.glb',
          name: 'Assault',
          color: 0xd32f2f,
          stats: { health: 120, speed: 1.2, damage: 25 }
        },
        medic: {
          model: '/assets/characters/medic.glb',
          name: 'Medic',
          color: 0xf57c00,
          stats: { health: 90, speed: 1.1, damage: 15 }
        }
      },
      weapons: {
        assault_rifle: {
          model: '/assets/weapons/assault_rifle.glb',
          name: 'Assault Rifle',
          color: 0x424242,
          stats: { damage: 25, fireRate: 600, ammo: 30, range: 100 }
        },
        sniper_rifle: {
          model: '/assets/weapons/sniper_rifle.glb',
          name: 'Sniper Rifle',
          color: 0x1976d2,
          stats: { damage: 80, fireRate: 60, ammo: 10, range: 300 }
        },
        shotgun: {
          model: '/assets/weapons/shotgun.glb',
          name: 'Shotgun',
          color: 0x8d6e63,
          stats: { damage: 60, fireRate: 100, ammo: 8, range: 50 }
        },
        pistol: {
          model: '/assets/weapons/pistol.glb',
          name: 'Pistol',
          color: 0x455a64,
          stats: { damage: 20, fireRate: 300, ammo: 15, range: 75 }
        }
      },
      animations: {
        idle: '/assets/animations/idle.glb',
        walk: '/assets/animations/walk.glb',
        run: '/assets/animations/run.glb',
        shoot: '/assets/animations/shoot.glb',
        reload: '/assets/animations/reload.glb',
        death: '/assets/animations/death.glb'
      }
    };
  }

  async loadAsset(assetPath, fallbackGeometry = null, fallbackMaterial = null) {
    if (this.loadedAssets.has(assetPath)) {
      return this.loadedAssets.get(assetPath);
    }

    if (this.loadingPromises.has(assetPath)) {
      return this.loadingPromises.get(assetPath);
    }

    const promise = new Promise((resolve, reject) => {
      this.loader.load(
        assetPath,
        (gltf) => {
          console.log(`✅ Loaded asset: ${assetPath}`);
          this.loadedAssets.set(assetPath, gltf);
          
          // Setup animations if present
          if (gltf.animations && gltf.animations.length > 0) {
            const mixer = new THREE.AnimationMixer(gltf.scene);
            this.animationMixers.set(assetPath, mixer);
            
            gltf.animations.forEach(clip => {
              const action = mixer.clipAction(clip);
              gltf.scene.userData.animations = gltf.scene.userData.animations || {};
              gltf.scene.userData.animations[clip.name] = action;
            });
          }
          
          resolve(gltf);
        },
        (progress) => {
          console.log(`Loading ${assetPath}: ${(progress.loaded / progress.total * 100).toFixed(1)}%`);
        },
        (error) => {
          console.warn(`⚠️  Failed to load ${assetPath}, using fallback`);
          
          // Create fallback mesh
          const fallbackMesh = new THREE.Mesh(
            fallbackGeometry || new THREE.BoxGeometry(1, 2, 1),
            fallbackMaterial || new THREE.MeshLambertMaterial({ color: 0x888888 })
          );
          
          const fallbackGLTF = {
            scene: fallbackMesh,
            animations: [],
            userData: { isFallback: true }
          };
          
          this.loadedAssets.set(assetPath, fallbackGLTF);
          resolve(fallbackGLTF);
        }
      );
    });

    this.loadingPromises.set(assetPath, promise);
    return promise;
  }

  async loadCharacter(characterId) {
    const character = this.assets.characters[characterId];
    if (!character) {
      throw new Error(`Character ${characterId} not found`);
    }

    const fallbackGeometry = new THREE.BoxGeometry(1, 2, 1);
    const fallbackMaterial = new THREE.MeshLambertMaterial({ color: character.color });
    
    const gltf = await this.loadAsset(character.model, fallbackGeometry, fallbackMaterial);
    const characterMesh = gltf.scene.clone();
    
    // Add character stats to userData
    characterMesh.userData = {
      ...characterMesh.userData,
      characterId,
      type: 'character',
      stats: character.stats,
      name: character.name
    };
    
    return characterMesh;
  }

  async loadWeapon(weaponId) {
    const weapon = this.assets.weapons[weaponId];
    if (!weapon) {
      throw new Error(`Weapon ${weaponId} not found`);
    }

    const fallbackGeometry = new THREE.BoxGeometry(0.3, 0.15, 1.5);
    const fallbackMaterial = new THREE.MeshLambertMaterial({ color: weapon.color });
    
    const gltf = await this.loadAsset(weapon.model, fallbackGeometry, fallbackMaterial);
    const weaponMesh = gltf.scene.clone();
    
    // Add weapon stats to userData
    weaponMesh.userData = {
      ...weaponMesh.userData,
      weaponId,
      type: 'weapon',
      stats: weapon.stats,
      name: weapon.name
    };
    
    return weaponMesh;
  }

  async loadAnimation(animationId) {
    const animationPath = this.assets.animations[animationId];
    if (!animationPath) {
      throw new Error(`Animation ${animationId} not found`);
    }

    return await this.loadAsset(animationPath);
  }

  getCharacterList() {
    return Object.keys(this.assets.characters).map(id => ({
      id,
      name: this.assets.characters[id].name,
      color: this.assets.characters[id].color,
      stats: this.assets.characters[id].stats
    }));
  }

  getWeaponList() {
    return Object.keys(this.assets.weapons).map(id => ({
      id,
      name: this.assets.weapons[id].name,
      color: this.assets.weapons[id].color,
      stats: this.assets.weapons[id].stats
    }));
  }

  updateAnimations(deltaTime) {
    this.animationMixers.forEach(mixer => {
      mixer.update(deltaTime);
    });
  }

  playAnimation(mesh, animationName) {
    if (mesh.userData.animations && mesh.userData.animations[animationName]) {
      // Stop current animation
      Object.values(mesh.userData.animations).forEach(action => {
        action.stop();
      });
      
      // Play new animation
      const action = mesh.userData.animations[animationName];
      action.reset().play();
      return action;
    }
    return null;
  }

  dispose() {
    this.loadedAssets.clear();
    this.loadingPromises.clear();
    this.animationMixers.forEach(mixer => mixer.uncacheRoot(mixer.getRoot()));
    this.animationMixers.clear();
  }
} 