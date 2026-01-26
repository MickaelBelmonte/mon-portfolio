class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    const loadingText = this.add.text(400, 300, 'Chargement...', {
      fontSize: '32px',
      fill: '#ffffff'
    });
    loadingText.setOrigin(0.5);

    // Exemple : tu ajouteras tes assets ici
    // this.load.image('bonobo', 'js/assets/bonobo.png');
  }

  create() {
    this.scene.start('MenuScene');
  }
}
