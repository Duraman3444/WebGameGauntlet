# 🌳 Git Branching Strategy - Fruit Runners

## 📋 Branch Overview

This repository uses a two-branch strategy optimized for rapid development and demo stability:

### 🚀 **main** - Development Branch
- **Purpose**: Active development and new features
- **Stability**: May contain work-in-progress code
- **Usage**: Primary branch for ongoing development
- **Deployment**: Used for testing and feature development

### 🎯 **demo** - Stable Release Branch  
- **Purpose**: Stable, working version of the game
- **Stability**: Always contains a fully functional game
- **Usage**: For demonstrations, presentations, and stable releases
- **Deployment**: Safe to deploy and share with others

## 🔄 Workflow

### For Development:
1. **Work on `main`** for new features and improvements
2. **Test thoroughly** before merging to demo
3. **Merge to `demo`** only when features are complete and stable

### For Demos:
1. **Always use `demo` branch** for presentations
2. **Switch to `demo`** when showing the project to others
3. **Deploy from `demo`** for production environments

## 🛠️ Commands

### Switch to Development:
```bash
git checkout main
```

### Switch to Demo:
```bash
git checkout demo
```

### Push Development Changes:
```bash
git push origin main
```

### Update Demo with Stable Features:
```bash
git checkout demo
git merge main
git push origin demo
```

## 🎮 Current State

### **main** branch contains:
- ✅ Complete multiplayer platformer game
- ✅ Phaser 3 + TypeScript + Vite setup
- ✅ Socket.io multiplayer server
- ✅ 7 character selection with animations
- ✅ Double jump mechanics
- ✅ Enemy AI and combat system
- ✅ Fruit collection and level progression
- ✅ Real-time multiplayer synchronization

### **demo** branch contains:
- ✅ Same stable, working version
- ✅ Ready for presentations and demonstrations
- ✅ Fully functional game with all features working

## 🔗 Repository Links

- **GitHub Repository**: https://github.com/Duraman3444/WebGameGauntlet
- **Main Branch**: https://github.com/Duraman3444/WebGameGauntlet/tree/main
- **Demo Branch**: https://github.com/Duraman3444/WebGameGauntlet/tree/demo

## 🚀 Quick Start

### To run the game:
1. Clone the repository
2. Switch to desired branch (`main` for latest, `demo` for stable)
3. Install dependencies: `npm install`
4. Start server: `cd server && npm start`
5. Start client: `npm run dev`
6. Open browser to http://localhost:3000

## 📝 Notes

- Both branches are currently synchronized with the complete working game
- Future development should happen on `main`
- Only merge to `demo` when features are thoroughly tested
- The `demo` branch should always be in a presentable state

---

**Happy Coding! 🎮✨** 