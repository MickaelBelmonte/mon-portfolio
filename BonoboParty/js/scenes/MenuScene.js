class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    this.add.text(400, 200, 'BONOBO PARTY', {
      fontSize: '48px',
      fill: '#ffdd55'
    }).setOrigin(0.5);

    const startText = this.add.text(400, 400, 'Appuie pour commencer', {
      fontSize: '28px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      console.log('Le jeu va commencer ici');
      // Tu lanceras ta première scène de jeu :
      // this.scene.start('GameScene');
    });
  }
}
