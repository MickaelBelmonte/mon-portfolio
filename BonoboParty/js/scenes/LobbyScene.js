class LobbyScene extends Phaser.Scene {
  constructor() {
    super('LobbyScene');
  }

  create() {
    const centerX = this.cameras.main.width / 2;

    // Transition d'entrée
    this.cameras.main.fadeIn(300, 0, 0, 0);

    // Récupération des infos globales
    this.roomCode = this.registry.get('roomCode');
    this.roomRef = this.registry.get('roomRef');
    this.playerId = this.registry.get('playerId');

    // Titre
    this.add.text(centerX, 60, 'Lobby Bonobo Party', {
      fontSize: '40px',
      fill: '#ffdd55'
    }).setOrigin(0.5);

    // Code de la partie
    this.add.text(centerX, 120, 'Code de la partie : ' + this.roomCode, {
      fontSize: '26px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // Liste des joueurs
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

    // Effet hover
    this.readyButton.on('pointerover', () => {
      if (this.readyButton.input.enabled) {
        this.readyButton.setFill('#55ffaa');
      }
    });

    this.readyButton.on('pointerout', () => {
      if (this.readyButton.input.enabled) {
        this.readyButton.setFill('#00ff88');
      }
    });

    // Clic sur "Je suis prêt"
    this.readyButton.on('pointerdown', () => {
      // Mise à jour Firebase
      setPlayerReady(this.roomRef, this.playerId, true);

      // Désactivation du bouton
      this.readyButton.disableInteractive();
      this.readyButton.setFill('#008844');
      this.readyButton.setText('[ EN ATTENTE DES AUTRES ]');
    });

    // Écoute Firebase en temps réel
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

    // Si moins de 3 joueurs → message d'attente
    if (players.length < 3) {
      this.playersText.setText(lines.join('\n') + '\n\nEn attente de joueurs...');
      return;
    }

    // Si 3 joueurs → affichage normal
    this.playersText.setText(lines.join('\n'));

    // Si 3 joueurs ET tous prêts → lancement du jeu
    if (players.every(([_, p]) => p.ready)) {
      this.startGame();
    }
  }

  startGame() {
    // Transition stylée vers le mini‑jeu
    this.cameras.main.fadeOut(600, 0, 0, 0);

    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene');
    });
  }
}

