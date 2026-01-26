const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 960,
  height: 540,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: [
    BootScene,
    PreloadScene,
    MenuScene,
    LobbyScene,
    BoardScene,
    GameScene
  ]
};

window.addEventListener('load', () => {
  new Phaser.Game(config);
});
