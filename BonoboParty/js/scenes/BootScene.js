class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Ici tu peux charger un logo minimal si tu veux
  }

  create() {
    this.scene.start('PreloadScene');
  }
}
