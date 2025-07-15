export class EnemyManager {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.enemies = [];
        
        console.log('👥 EnemyManager initialized');
    }

    update(deltaTime) {
        // Update enemies
        this.enemies.forEach(enemy => {
            if (enemy.update) {
                enemy.update(deltaTime);
            }
        });
    }

    destroy() {
        this.enemies.forEach(enemy => {
            if (enemy.destroy) {
                enemy.destroy();
            }
        });
        this.enemies = [];
        console.log('🧹 EnemyManager destroyed');
    }
} 