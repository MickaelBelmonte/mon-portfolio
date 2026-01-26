class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Exemple : charger un logo
    // this.load.image('logo', 'js/assets/logo.png');
  }

  create() {
    // Logo :
    // const logo = this.add.image(400, 300, 'logo').setScale(0.5);

    // Petite transition stylée
    this.cameras.main.fadeIn(400, 0, 0, 0);

    this.time.delayedCall(600, () => {
      this.scene.start('PreloadScene');
    });
  }
}
