/**
 * Asset Verification Utility
 * Checks if all required game assets exist and reports missing files
 */

import { AssetPaths } from './assetPaths';

export interface AssetInfo {
  key: string;
  path: string;
  type: 'image' | 'spritesheet' | 'audio';
  required: boolean;
}

export class AssetVerifier {
  private static requiredAssets: AssetInfo[] = [
    // Character spritesheets
    { key: 'pinkman_idle', path: 'assets/sprites/players/Main Characters/Pink Man/Idle (32x32).png', type: 'spritesheet', required: true },
    { key: 'pinkman_run', path: 'assets/sprites/players/Main Characters/Pink Man/Run (32x32).png', type: 'spritesheet', required: true },
    { key: 'pinkman_jump', path: 'assets/sprites/players/Main Characters/Pink Man/Jump (32x32).png', type: 'spritesheet', required: true },
    { key: 'pinkman_fall', path: 'assets/sprites/players/Main Characters/Pink Man/Fall (32x32).png', type: 'spritesheet', required: true },
    { key: 'pinkman_double_jump', path: 'assets/sprites/players/Main Characters/Pink Man/Double Jump (32x32).png', type: 'spritesheet', required: true },
    { key: 'pinkman_wall_jump', path: 'assets/sprites/players/Main Characters/Pink Man/Wall Jump (32x32).png', type: 'spritesheet', required: true },
    { key: 'pinkman_hit', path: 'assets/sprites/players/Main Characters/Pink Man/Hit (32x32).png', type: 'spritesheet', required: true },
    
    { key: 'maskdude_idle', path: 'assets/sprites/players/Main Characters/Mask Dude/Idle (32x32).png', type: 'spritesheet', required: true },
    { key: 'maskdude_run', path: 'assets/sprites/players/Main Characters/Mask Dude/Run (32x32).png', type: 'spritesheet', required: true },
    { key: 'maskdude_jump', path: 'assets/sprites/players/Main Characters/Mask Dude/Jump (32x32).png', type: 'spritesheet', required: true },
    { key: 'maskdude_fall', path: 'assets/sprites/players/Main Characters/Mask Dude/Fall (32x32).png', type: 'spritesheet', required: true },
    { key: 'maskdude_double_jump', path: 'assets/sprites/players/Main Characters/Mask Dude/Double Jump (32x32).png', type: 'spritesheet', required: true },
    { key: 'maskdude_wall_jump', path: 'assets/sprites/players/Main Characters/Mask Dude/Wall Jump (32x32).png', type: 'spritesheet', required: true },
    { key: 'maskdude_hit', path: 'assets/sprites/players/Main Characters/Mask Dude/Hit (32x32).png', type: 'spritesheet', required: true },
    
    { key: 'ninjafrog_idle', path: 'assets/sprites/players/Main Characters/Ninja Frog/Idle (32x32).png', type: 'spritesheet', required: true },
    { key: 'ninjafrog_run', path: 'assets/sprites/players/Main Characters/Ninja Frog/Run (32x32).png', type: 'spritesheet', required: true },
    { key: 'ninjafrog_jump', path: 'assets/sprites/players/Main Characters/Ninja Frog/Jump (32x32).png', type: 'spritesheet', required: true },
    { key: 'ninjafrog_fall', path: 'assets/sprites/players/Main Characters/Ninja Frog/Fall (32x32).png', type: 'spritesheet', required: true },
    { key: 'ninjafrog_double_jump', path: 'assets/sprites/players/Main Characters/Ninja Frog/Double Jump (32x32).png', type: 'spritesheet', required: true },
    { key: 'ninjafrog_wall_jump', path: 'assets/sprites/players/Main Characters/Ninja Frog/Wall Jump (32x32).png', type: 'spritesheet', required: true },
    { key: 'ninjafrog_hit', path: 'assets/sprites/players/Main Characters/Ninja Frog/Hit (32x32).png', type: 'spritesheet', required: true },
    
    { key: 'virtualguy_idle', path: 'assets/sprites/players/Main Characters/Virtual Guy/Idle (32x32).png', type: 'spritesheet', required: true },
    { key: 'virtualguy_run', path: 'assets/sprites/players/Main Characters/Virtual Guy/Run (32x32).png', type: 'spritesheet', required: true },
    { key: 'virtualguy_jump', path: 'assets/sprites/players/Main Characters/Virtual Guy/Jump (32x32).png', type: 'spritesheet', required: true },
    { key: 'virtualguy_fall', path: 'assets/sprites/players/Main Characters/Virtual Guy/Fall (32x32).png', type: 'spritesheet', required: true },
    { key: 'virtualguy_double_jump', path: 'assets/sprites/players/Main Characters/Virtual Guy/Double Jump (32x32).png', type: 'spritesheet', required: true },
    { key: 'virtualguy_wall_jump', path: 'assets/sprites/players/Main Characters/Virtual Guy/Wall Jump (32x32).png', type: 'spritesheet', required: true },
    { key: 'virtualguy_hit', path: 'assets/sprites/players/Main Characters/Virtual Guy/Hit (32x32).png', type: 'spritesheet', required: true },
    
    // Terrain
    { key: 'terrain_tileset', path: AssetPaths.terrain('Terrain (16x16).png'), type: 'image', required: true },
    
    // Fruits
    { key: 'apple', path: 'assets/sprites/items/Fruits/Apple.png', type: 'image', required: true },
    { key: 'bananas', path: 'assets/sprites/items/Fruits/Bananas.png', type: 'image', required: true },
    { key: 'cherries', path: 'assets/sprites/items/Fruits/Cherries.png', type: 'image', required: true },
    { key: 'kiwi', path: 'assets/sprites/items/Fruits/Kiwi.png', type: 'image', required: true },
    { key: 'melon', path: 'assets/sprites/items/Fruits/Melon.png', type: 'image', required: true },
    { key: 'orange', path: 'assets/sprites/items/Fruits/Orange.png', type: 'image', required: true },
    { key: 'pineapple', path: 'assets/sprites/items/Fruits/Pineapple.png', type: 'image', required: true },
    { key: 'strawberry', path: 'assets/sprites/items/Fruits/Strawberry.png', type: 'image', required: true },
    
    // Boxes
    { key: 'box1', path: 'assets/sprites/items/Boxes/Box1.png', type: 'image', required: true },
    { key: 'box2', path: 'assets/sprites/items/Boxes/Box2.png', type: 'image', required: true },
    { key: 'box3', path: 'assets/sprites/items/Boxes/Box3.png', type: 'image', required: true },
    
    // Traps
    { key: 'spike_idle', path: AssetPaths.spike(), type: 'image', required: true },
    { key: 'fire_off', path: 'assets/sprites/traps/Fire/Off.png', type: 'image', required: true },
    { key: 'fire_on', path: 'assets/sprites/traps/Fire/On (16x32).png', type: 'image', required: true },
    { key: 'fire_hit', path: 'assets/sprites/traps/Fire/Hit (16x32).png', type: 'image', required: true },
    { key: 'saw_on', path: 'assets/sprites/traps/Saw/On (38x38).png', type: 'image', required: true },
    { key: 'saw_off', path: 'assets/sprites/traps/Saw/Off.png', type: 'image', required: true },
    { key: 'saw_chain', path: 'assets/sprites/traps/Saw/Chain.png', type: 'image', required: true },
    { key: 'trampoline_idle', path: 'assets/sprites/traps/Trampoline/Idle.png', type: 'image', required: true },
    { key: 'trampoline_jump', path: 'assets/sprites/traps/Trampoline/Jump (28x28).png', type: 'image', required: true },
    { key: 'falling_platform_on', path: 'assets/sprites/traps/Falling Platforms/On (32x10).png', type: 'image', required: true },
    { key: 'falling_platform_off', path: 'assets/sprites/traps/Falling Platforms/Off.png', type: 'image', required: true },
    
    // Buttons
    { key: 'btn_play', path: 'assets/sprites/menu/Buttons/Play.png', type: 'image', required: false },
    { key: 'btn_back', path: 'assets/sprites/menu/Buttons/Back.png', type: 'image', required: false },
    { key: 'btn_settings', path: 'assets/sprites/menu/Buttons/Settings.png', type: 'image', required: false },
    { key: 'btn_restart', path: 'assets/sprites/menu/Buttons/Restart.png', type: 'image', required: false },
    
    // Backgrounds
    { key: 'bg_blue', path: 'assets/sprites/backgrounds/Blue.png', type: 'image', required: false },
    { key: 'bg_brown', path: 'assets/sprites/backgrounds/Brown.png', type: 'image', required: false },
    { key: 'bg_gray', path: 'assets/sprites/backgrounds/Gray.png', type: 'image', required: false },
    { key: 'bg_green', path: 'assets/sprites/backgrounds/Green.png', type: 'image', required: false },
    { key: 'bg_pink', path: 'assets/sprites/backgrounds/Pink.png', type: 'image', required: false },
    { key: 'bg_purple', path: 'assets/sprites/backgrounds/Purple.png', type: 'image', required: false },
    { key: 'bg_yellow', path: 'assets/sprites/backgrounds/Yellow.png', type: 'image', required: false },
    
    // Stringstar Fields Level
    { key: 'bg_stringstar_0', path: 'assets/levels/stringstar_fields/background_0.png', type: 'image', required: false },
    { key: 'bg_stringstar_1', path: 'assets/levels/stringstar_fields/background_1.png', type: 'image', required: false },
    { key: 'bg_stringstar_2', path: 'assets/levels/stringstar_fields/background_2.png', type: 'image', required: false },
    { key: 'stringstar_tileset', path: 'assets/levels/stringstar_fields/tileset.png', type: 'image', required: false }
  ];

  /**
   * Verify all assets exist and log results
   */
  public static async verifyAssets(): Promise<{ missing: AssetInfo[], found: AssetInfo[] }> {
    console.log('🔍 Starting asset verification...');
    
    const missing: AssetInfo[] = [];
    const found: AssetInfo[] = [];
    
    for (const asset of this.requiredAssets) {
      try {
        const response = await fetch(asset.path);
        if (response.ok) {
          found.push(asset);
          console.log(`✅ Found: ${asset.key} (${asset.path})`);
        } else {
          missing.push(asset);
          if (asset.required) {
            console.error(`❌ MISSING REQUIRED: ${asset.key} (${asset.path}) - Status: ${response.status}`);
          } else {
            console.warn(`⚠️  Missing optional: ${asset.key} (${asset.path}) - Status: ${response.status}`);
          }
        }
      } catch (error) {
        missing.push(asset);
        if (asset.required) {
          console.error(`❌ ERROR loading required asset: ${asset.key} (${asset.path})`, error);
        } else {
          console.warn(`⚠️  Error loading optional asset: ${asset.key} (${asset.path})`, error);
        }
      }
    }
    
    console.log(`📊 Asset verification complete:`);
    console.log(`✅ Found: ${found.length} assets`);
    console.log(`❌ Missing: ${missing.length} assets`);
    
    const missingRequired = missing.filter(a => a.required);
    const missingOptional = missing.filter(a => !a.required);
    
    if (missingRequired.length > 0) {
      console.error(`🚨 ${missingRequired.length} REQUIRED assets are missing!`);
      missingRequired.forEach(asset => {
        console.error(`  ❌ ${asset.key}: ${asset.path}`);
      });
    }
    
    if (missingOptional.length > 0) {
      console.warn(`⚠️  ${missingOptional.length} optional assets are missing`);
      missingOptional.forEach(asset => {
        console.warn(`  ⚠️  ${asset.key}: ${asset.path}`);
      });
    }
    
    return { missing, found };
  }

  /**
   * Generate a report of missing assets
   */
  public static generateMissingAssetsReport(missing: AssetInfo[]): string {
    const required = missing.filter(a => a.required);
    const optional = missing.filter(a => !a.required);
    
    let report = '# Missing Assets Report\n\n';
    
    if (required.length > 0) {
      report += `## 🚨 Required Assets (${required.length})\n\n`;
      required.forEach(asset => {
        report += `- **${asset.key}** (${asset.type}): \`${asset.path}\`\n`;
      });
      report += '\n';
    }
    
    if (optional.length > 0) {
      report += `## ⚠️  Optional Assets (${optional.length})\n\n`;
      optional.forEach(asset => {
        report += `- **${asset.key}** (${asset.type}): \`${asset.path}\`\n`;
      });
      report += '\n';
    }
    
    report += '## 📋 Asset Organization Tips\n\n';
    report += '1. Check file paths and ensure proper capitalization\n';
    report += '2. Verify files exist in the exact locations specified\n';
    report += '3. Use `encodeURI()` for paths with spaces or special characters\n';
    report += '4. Consider using placeholders for missing optional assets\n';
    
    return report;
  }
}

// Export for use in development
if (typeof window !== 'undefined') {
  (window as any).AssetVerifier = AssetVerifier;
} 