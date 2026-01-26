const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a2f1a',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
scene: [
  BootScene,
  PreloadScene,
  MenuScene,
  LobbyScene,
  GameScene
]
};

const game = new Phaser.Game(config);
