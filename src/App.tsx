import React, { useEffect, useRef, useState } from 'react';
import { phaserGame } from './game/PhaserGame';

function App() {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [gameStatus, setGameStatus] = useState('initializing');
  const [error, setError] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initializeGame = async () => {
      try {
        setGameStatus('loading');
        
        // Simple test - just show we can load
        if (gameContainerRef.current && isMounted) {
          setGameStatus('ready');
        }
      } catch (err: any) {
        console.error('Game initialization error:', err);
        if (isMounted) {
          setError(err.message || 'Failed to initialize game');
          setGameStatus('error');
        }
      }
    };

    // Add delay to see loading state
    setTimeout(initializeGame, 1000);

    return () => {
      isMounted = false;
    };
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-red-900 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">🚨 Game Error</h1>
          <p className="text-lg mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg"
          >
            Reload Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-600 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">🍎 Fruit Runners</h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              Status: 
              <span className={`ml-2 px-2 py-1 rounded ${
                gameStatus === 'ready' ? 'bg-green-600' :
                gameStatus === 'loading' ? 'bg-yellow-600' :
                gameStatus === 'error' ? 'bg-red-600' : 'bg-gray-600'
              }`}>
                {gameStatus}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Game Container */}
      <main className="flex-1 flex items-center justify-center">
        <div className="relative">
          <div 
            id="game-container" 
            ref={gameContainerRef}
            className="border-4 border-gray-800 rounded-lg shadow-2xl bg-gray-900"
            style={{
              width: '1024px',
              height: '576px',
              maxWidth: '90vw',
              maxHeight: '70vh'
            }}
          >
            {/* Game Status Display */}
            {!gameStarted && (
              <div className="absolute inset-0 flex items-center justify-center">
                {gameStatus === 'initializing' && (
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
                    <p className="text-xl">Initializing Game...</p>
                  </div>
                )}
                
                {gameStatus === 'loading' && (
                  <div className="text-white text-center">
                    <div className="animate-pulse text-6xl mb-4">🍎</div>
                    <p className="text-xl">Loading Game World...</p>
                  </div>
                )}
                
                {gameStatus === 'ready' && (
                  <div className="text-white text-center">
                    <div className="text-8xl mb-6">🎮</div>
                    <h2 className="text-3xl font-bold mb-4">Fruit Runners Ready!</h2>
                    <p className="text-lg mb-6">Game engine loaded successfully</p>
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h3 className="text-xl font-bold mb-2">Controls:</h3>
                      <div className="text-sm space-y-1">
                        <p>🏃 Move: Arrow Keys or WASD</p>
                        <p>🦘 Jump: Space Bar</p>
                        <p>🤸 Double Jump: Space Bar (in air)</p>
                        <p>🧗 Wall Jump: Jump while touching wall</p>
                      </div>
                    </div>
                    <button 
                      className="mt-6 bg-green-600 hover:bg-green-700 px-8 py-3 rounded-lg text-lg font-bold"
                      onClick={() => {
                        console.log('Starting Fruit Runners game...');
                        try {
                          phaserGame.init('game-container');
                          setGameStarted(true);
                        } catch (err: any) {
                          setError(err.message || 'Failed to start game');
                        }
                      }}
                    >
                      🚀 Start Game
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Debug Info Panel */}
          {gameStatus === 'ready' && !gameStarted && (
            <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded text-xs">
              <div>📊 Debug Info:</div>
              <div>Container: {gameContainerRef.current ? '✅' : '❌'}</div>
              <div>Status: {gameStatus}</div>
              <div>Timestamp: {new Date().toLocaleTimeString()}</div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4">
        <div className="container mx-auto text-center">
          <p className="text-sm">
            🎮 Fruit Runners - Built with React + Phaser 3 + TypeScript
          </p>
          <p className="text-xs mt-2 text-gray-400">
            Drop your itch.io assets in <code>/public/assets/</code>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
