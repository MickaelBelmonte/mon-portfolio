class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Transition d'entrée
    this.cameras.main.fadeIn(300, 0, 0, 0);

    // Récupération des infos Firebase
    this.roomRef = this.registry.get('roomRef');
    this.playerId = this.registry.get('playerId');

    // Titre
    this.add.text(centerX, 80, 'Mini‑jeu : Prototype', {
      fontSize: '32px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // Sous‑titre
    this.add.text(centerX, 140, 'Ici tu vas coder ton premier mini‑jeu', {
      fontSize: '20px',
      fill: '#dddddd'
    }).setOrigin(0.5);

    // Zone d'affichage des joueurs
    this.playersText = this.add.text(centerX, 240, 'Chargement joueurs...', {
      fontSize: '22px',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // Bouton retour menu
    this.backText = this.add.text(centerX, 520, '[ Retour au menu ]', {
      fontSize: '20px',
      fill: '#ffdd55'
    }).setOrigin(0.5).setInteractive();

    // Hover
    this.backText.on('pointerover', () => this.backText.setFill('#ffee88'));
    this.backText.on('pointerout', () => this.backText.setFill('#ffdd55'));

    // Clic
    this.backText.on('pointerdown', () => {
      this.backText.disableInteractive();
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MenuScene');
      });
    });

    // Écoute Firebase pour synchroniser les joueurs
    listenRoom(this.roomRef, (data) => {
      this.updatePlayers(data);
    });
  }

  updatePlayers(data) {
    if (!data || !data.players) return;

    const players = Object.entries(data.players);

    const lines = players.map(([id, p]) => {
      return `${id} : ${p.ready ? '✔️ prêt' : '⏳ en jeu'}`;
    });

    this.playersText.setText(lines.join('\n'));
  }
}
