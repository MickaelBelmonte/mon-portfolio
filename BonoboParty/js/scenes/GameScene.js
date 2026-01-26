class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    this.add.text(centerX, 80, 'Mini‑jeu prototype', {
      fontSize: '32px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(centerX, 140, '"Course aux noix", etc.', {
      fontSize: '18px',
      fill: '#dddddd'
    }).setOrigin(0.5);

    this.add.text(centerX, 520, 'Clique pour revenir au menu', {
      fontSize: '20px',
      fill: '#ffdd55'
    }).setOrigin(0.5);

    this.cameras.main.setBackgroundColor('#123322');

    this.input.once('pointerdown', () => {
      this.scene.transition({
        target: 'MenuScene',
        duration: 500,
        moveBelow: true,
        onUpdate: (progress) => {
          this.cameras.main.setAlpha(1 - progress);
        }
      });
    });
  }
}
