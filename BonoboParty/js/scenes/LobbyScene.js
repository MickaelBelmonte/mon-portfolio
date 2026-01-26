class LobbyScene extends Phaser.Scene {
  constructor() {
    super('LobbyScene');
  }

  create() {
    const centerX = this.cameras.main.width / 2;

    this.roomCode = this.registry.get('roomCode');
    this.roomRef = this.registry.get('roomRef');
    this.playerId = this.registry.get('playerId');

    this.add.text(centerX, 60, 'Lobby Bonobo Party', {
      fontSize: '40px',
      fill: '#ffdd55'
    }).setOrigin(0.5);

    this.add.text(centerX, 120, 'Code de la partie : ' + this.roomCode, {
      fontSize: '26px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    this.playersText = this.add.text(centerX, 220, 'En attente...', {
      fontSize: '24px',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // Bouton prêt
    this.readyButton = this.add.text(centerX, 400, '[ JE SUIS PRÊT ]', {
      fontSize: '32px',
      fill: '#00ff88'
    }).setOrigin(0.5).setInteractive();

    this.readyButton.on('pointerdown', () => {
      setPlayerReady(this.roomRef, this.playerId, true);
      this.readyButton.setFill('#008844');
      this.readyButton.setText('[ EN ATTENTE DES AUTRES ]');
    });

    // Écoute Firebase
    listenRoom(this.roomRef, (data) => {
      this.updateLobby(data);
    });
  }

  updateLobby(data) {
    if (!data || !data.players) return;

    const players = Object.entries(data.players);

    // Limite à 3 joueurs
    if (players.length > 3) {
      this.playersText.setText('La partie est pleine (3 joueurs max)');
      return;
    }

    // Affichage des joueurs
    const lines = players.map(([id, p]) => {
      const status = p.ready ? '✔️ Prêt' : '⏳ Pas prêt';
      return `${id} : ${status}`;
    });

    this.playersText.setText(lines.join('\n'));

    // Si 3 joueurs et tous prêts → lancer le jeu
    if (players.length === 3 && players.every(([_, p]) => p.ready)) {
      this.startGame();
    }
  }

  startGame() {
    this.scene.transition({
      target: 'GameScene',
      duration: 600,
      moveBelow: true,
      onUpdate: (progress) => {
        this.cameras.main.setAlpha(1 - progress);
      }
    });
  }
}

