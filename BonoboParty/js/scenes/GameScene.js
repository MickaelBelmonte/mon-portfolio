class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    this.roomRef = this.registry.get('roomRef');
    this.playerId = this.registry.get('playerId');

    this.add.text(centerX, 80, 'Mini‑jeu : Prototype', {
      fontSize: '32px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(centerX, 140, 'Ici tu vas coder ton premier mini‑jeu', {
      fontSize: '20px',
      fill: '#dddddd'
    }).setOrigin(0.5);

    this.add.text(centerX, 520, 'Clique pour revenir au menu', {
      fontSize: '20px',
      fill: '#ffdd55'
    }).setOrigin(0.5);

    // Exemple : écoute Firebase pour synchroniser les joueurs
    listenRoom(this.roomRef, (data) => {
      // Tu pourras synchroniser les positions, scores, etc.
      console.log('Game update:', data);
    });

    this.input.once('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }
}
