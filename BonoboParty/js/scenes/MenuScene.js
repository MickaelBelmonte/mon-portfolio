class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.cameras.main.setBackgroundColor('#102018');

    this.add.text(width / 2, 120, 'Bonobo Party', {
      fontSize: '48px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width / 2, 180, 'Multijoueur 2 à 4 joueurs', {
      fontSize: '20px',
      fill: '#ffdd88'
    }).setOrigin(0.5);

    const playBtn = this.add.text(width / 2, height / 2, '[ Rejoindre la jungle ]', {
      fontSize: '28px',
      fill: '#ffdd55'
    }).setOrigin(0.5).setInteractive();

    playBtn.on('pointerover', () => playBtn.setFill('#ffee88'));
    playBtn.on('pointerout', () => playBtn.setFill('#ffdd55'));

    playBtn.on('pointerdown', () => {
      this.scene.start('LobbyScene');
    });
  }
}
