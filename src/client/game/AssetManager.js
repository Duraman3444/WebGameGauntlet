import * as THREE from 'three';

export class AssetManager {
    constructor() {
        this.assets = {
            textures: new Map(),
            materials: new Map(),
            geometries: new Map(),
            sounds: new Map(),
            models: new Map()
        };
        
        this.loadingManager = new THREE.LoadingManager();
        this.textureLoader = new THREE.TextureLoader(this.loadingManager);
        
        // Asset loading progress
        this.loadingProgress = 0;
        this.totalAssets = 0;
        this.loadedAssets = 0;
        
        // Setup loading callbacks
        this.setupLoadingCallbacks();
        
        // Placeholder configurations
        this.placeholderConfig = {
            player: { color: 0x4CAF50, size: { width: 0.8, height: 1.8, depth: 0.4 } },
            enemy: { color: 0xf44336, size: { width: 0.8, height: 1.8, depth: 0.4 } },
            wall: { color: 0x666666, size: { width: 1, height: 3, depth: 0.2 } },
            floor: { color: 0x444444, size: { width: 1, height: 0.1, depth: 1 } },
            ceiling: { color: 0x333333, size: { width: 1, height: 0.1, depth: 1 } },
            door: { color: 0x8B4513, size: { width: 2, height: 3, depth: 0.2 } },
            laser: { color: 0xff0000, size: { width: 0.05, height: 0.05, depth: 10 } },
            camera: { color: 0x333333, size: { width: 0.3, height: 0.3, depth: 0.3 } },
            spotlight: { color: 0xffffff, size: { width: 0.2, height: 0.2, depth: 0.2 } },
            objective: { color: 0xffeb3b, size: { width: 0.5, height: 0.5, depth: 0.5 } },
            pickup: { color: 0x2196f3, size: { width: 0.3, height: 0.3, depth: 0.3 } },
            cover: { color: 0x795548, size: { width: 1, height: 1.5, depth: 0.3 } },
            vent: { color: 0x424242, size: { width: 1, height: 0.5, depth: 0.5 } }
        };
        
        console.log('🎨 AssetManager initialized');
    }
    
    setupLoadingCallbacks() {
        this.loadingManager.onLoad = () => {
            console.log('✅ All assets loaded successfully');
            this.loadingProgress = 100;
        };
        
        this.loadingManager.onProgress = (url, loaded, total) => {
            this.loadedAssets = loaded;
            this.totalAssets = total;
            this.loadingProgress = (loaded / total) * 100;
            console.log(`📦 Loading progress: ${this.loadingProgress.toFixed(1)}% (${loaded}/${total})`);
        };
        
        this.loadingManager.onError = (url) => {
            console.error(`❌ Failed to load asset: ${url}`);
        };
    }
    
    async preloadAssets() {
        console.log('🔄 Preloading assets...');
        
        // Create placeholder materials
        this.createPlaceholderMaterials();
        
        // Create placeholder geometries
        this.createPlaceholderGeometries();
        
        // Create placeholder textures
        this.createPlaceholderTextures();
        
        // In the future, this is where you'd load actual assets
        // await this.loadModels();
        // await this.loadTextures();
        // await this.loadSounds();
        
        console.log('✅ Asset preloading complete');
    }
    
    createPlaceholderMaterials() {
        console.log('🎨 Creating placeholder materials...');
        
        // Create materials for each placeholder type
        for (const [name, config] of Object.entries(this.placeholderConfig)) {
            const material = new THREE.MeshLambertMaterial({
                color: config.color,
                transparent: name === 'laser',
                opacity: name === 'laser' ? 0.8 : 1.0
            });
            
            this.assets.materials.set(name, material);
        }
        
        // Special materials
        this.assets.materials.set('wireframe', new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true
        }));
        
        this.assets.materials.set('transparent', new THREE.MeshBasicMaterial({
            color: 0x0000ff,
            transparent: true,
            opacity: 0.3
        }));
        
        this.assets.materials.set('emissive', new THREE.MeshLambertMaterial({
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.5
        }));
    }
    
    createPlaceholderGeometries() {
        console.log('📐 Creating placeholder geometries...');
        
        // Basic geometries
        this.assets.geometries.set('box', new THREE.BoxGeometry(1, 1, 1));
        this.assets.geometries.set('sphere', new THREE.SphereGeometry(0.5, 16, 16));
        this.assets.geometries.set('cylinder', new THREE.CylinderGeometry(0.5, 0.5, 1, 16));
        this.assets.geometries.set('cone', new THREE.ConeGeometry(0.5, 1, 16));
        this.assets.geometries.set('plane', new THREE.PlaneGeometry(1, 1));
        
        // Specific geometries for game objects
        for (const [name, config] of Object.entries(this.placeholderConfig)) {
            const geometry = new THREE.BoxGeometry(
                config.size.width,
                config.size.height,
                config.size.depth
            );
            this.assets.geometries.set(`${name}_geometry`, geometry);
        }
    }
    
    createPlaceholderTextures() {
        console.log('🖼️ Creating placeholder textures...');
        
        // Create simple placeholder textures
        this.assets.textures.set('grid', this.createGridTexture());
        this.assets.textures.set('checkerboard', this.createCheckerboardTexture());
        this.assets.textures.set('noise', this.createNoiseTexture());
        this.assets.textures.set('metal', this.createMetalTexture());
        this.assets.textures.set('concrete', this.createConcreteTexture());
    }
    
    //==========================================================================
    // 🔧 Helper – ensure placeholder CanvasTextures do NOT use mip-maps
    //==========================================================================
    configureTexture(texture) {
        // Using immutable textures with mip-maps causes
        // "WebGL: INVALID_OPERATION: Texture is immutable" on WebGL2 when
        // Three.js internally calls generateMipmap(). Disabling mip-maps and
        // using linear filtering avoids that while keeping the placeholder
        // visuals crisp enough for debugging.
        texture.generateMipmaps = false;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        return texture;
    }

    createGridTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Background
        ctx.fillStyle = '#444444';
        ctx.fillRect(0, 0, 256, 256);
        
        // Grid lines
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 1;
        
        for (let i = 0; i <= 256; i += 32) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 256);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(256, i);
            ctx.stroke();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        this.configureTexture(texture);
        return texture;
    }
    
    createCheckerboardTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        const squareSize = 32;
        for (let x = 0; x < 256; x += squareSize) {
            for (let y = 0; y < 256; y += squareSize) {
                const isEven = ((x / squareSize) + (y / squareSize)) % 2 === 0;
                ctx.fillStyle = isEven ? '#555555' : '#777777';
                ctx.fillRect(x, y, squareSize, squareSize);
            }
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        this.configureTexture(texture);
        return texture;
    }
    
    createNoiseTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.createImageData(256, 256);
        
        for (let i = 0; i < imageData.data.length; i += 4) {
            const noise = Math.random() * 100 + 100;
            imageData.data[i] = noise;     // R
            imageData.data[i + 1] = noise; // G
            imageData.data[i + 2] = noise; // B
            imageData.data[i + 3] = 255;   // A
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        this.configureTexture(texture);
        return texture;
    }
    
    createMetalTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Gradient background
        const gradient = ctx.createLinearGradient(0, 0, 256, 256);
        gradient.addColorStop(0, '#888888');
        gradient.addColorStop(0.5, '#CCCCCC');
        gradient.addColorStop(1, '#888888');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);
        
        // Add some noise for texture
        for (let i = 0; i < 1000; i++) {
            ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.1)`;
            ctx.fillRect(Math.random() * 256, Math.random() * 256, 1, 1);
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        this.configureTexture(texture);
        return texture;
    }
    
    createConcreteTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        // Base color
        ctx.fillStyle = '#666666';
        ctx.fillRect(0, 0, 256, 256);
        
        // Add concrete texture
        for (let i = 0; i < 5000; i++) {
            const gray = Math.random() * 100 + 50;
            ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray}, 0.3)`;
            ctx.fillRect(Math.random() * 256, Math.random() * 256, Math.random() * 3, Math.random() * 3);
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        this.configureTexture(texture);
        return texture;
    }
    
    // Asset retrieval methods
    getMaterial(name) {
        return this.assets.materials.get(name) || this.assets.materials.get('wireframe');
    }
    
    getGeometry(name) {
        return this.assets.geometries.get(name) || this.assets.geometries.get('box');
    }
    
    getTexture(name) {
        return this.assets.textures.get(name) || this.assets.textures.get('grid');
    }
    
    getModel(name) {
        return this.assets.models.get(name) || null;
    }
    
    getSound(name) {
        return this.assets.sounds.get(name) || null;
    }
    
    // Create placeholder mesh
    createPlaceholderMesh(type, customColor = null) {
        const config = this.placeholderConfig[type];
        if (!config) {
            console.warn(`Unknown placeholder type: ${type}`);
            return this.createPlaceholderMesh('player');
        }
        
        const geometry = this.getGeometry(`${type}_geometry`);
        const material = customColor 
            ? new THREE.MeshLambertMaterial({ color: customColor })
            : this.getMaterial(type);
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData = { type, isPlaceholder: true };
        
        return mesh;
    }
    
    // Create textured mesh
    createTexturedMesh(geometryName, textureName, materialType = 'Lambert') {
        const geometry = this.getGeometry(geometryName);
        const texture = this.getTexture(textureName);
        
        let material;
        switch (materialType) {
            case 'Basic':
                material = new THREE.MeshBasicMaterial({ map: texture });
                break;
            case 'Phong':
                material = new THREE.MeshPhongMaterial({ map: texture });
                break;
            default:
                material = new THREE.MeshLambertMaterial({ map: texture });
        }
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        return mesh;
    }
    
    // Future asset loading methods (to be implemented when adding real assets)
    async loadModel(path, name) {
        console.log(`📦 Loading model: ${name} from ${path}`);
        // TODO: Implement actual model loading
        return Promise.resolve();
    }
    
    async loadTexture(path, name) {
        console.log(`🖼️ Loading texture: ${name} from ${path}`);
        // TODO: Implement actual texture loading
        return Promise.resolve();
    }
    
    async loadSound(path, name) {
        console.log(`🔊 Loading sound: ${name} from ${path}`);
        // TODO: Implement actual sound loading
        return Promise.resolve();
    }
    
    // Asset replacement system for easy upgrading from placeholders
    replacePlaceholder(mesh, newAsset) {
        if (mesh.userData.isPlaceholder) {
            // Replace placeholder with actual asset
            const parent = mesh.parent;
            const position = mesh.position.clone();
            const rotation = mesh.rotation.clone();
            const scale = mesh.scale.clone();
            
            parent.remove(mesh);
            
            newAsset.position.copy(position);
            newAsset.rotation.copy(rotation);
            newAsset.scale.copy(scale);
            
            parent.add(newAsset);
            
            console.log(`🔄 Replaced placeholder ${mesh.userData.type} with actual asset`);
        }
    }
    
    // Utility methods
    getLoadingProgress() {
        return {
            progress: this.loadingProgress,
            loaded: this.loadedAssets,
            total: this.totalAssets
        };
    }
    
    dispose() {
        // Clean up resources
        for (const [name, texture] of this.assets.textures) {
            texture.dispose();
        }
        
        for (const [name, material] of this.assets.materials) {
            material.dispose();
        }
        
        for (const [name, geometry] of this.assets.geometries) {
            geometry.dispose();
        }
        
        console.log('🧹 AssetManager disposed');
    }
} 