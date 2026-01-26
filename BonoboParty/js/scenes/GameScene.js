class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.roomRef = this.registry.get('roomRef');
    this.playerId = this.registry.get('playerId');

    this.finishX = width - 120;
    this.gameFinished = false;

    // Fond
    this.cameras.main.setBackgroundColor('#123018');

    // Sol
    this.add.rectangle(width / 2, height - 40, width, 80, 0x3b2a1a);

    // Ligne d'arrivée
    this.add.rectangle(this.finishX, height / 2, 16, height, 0xffdd55);
    this.add.text(this.finishX, 40, 'ARRIVÉE', {
      fontSize: '20px',
      fill: '#ffdd55'
    }).setOrigin(0.5);

    // Titre
    this.add.text(width / 2, 40, 'Course aux Noix', {
      fontSize: '32px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // Info
    this.infoText = this.add.text(width / 2, height - 100, 'Clique pour faire courir ton bonobo !', {
      fontSize: '20px',
      fill: '#ffddaa'
    }).setOrigin(0.5);

    // Sainte Banane (boost visuel)
    this.banana = this.add.container(width / 2, 120);
    const glow = this.add.circle(0, 0, 40, 0xffffaa, 0.4);
    const bananaShape = this.add.arc(0, 0, 20, 200, 340, false)
      .setStrokeStyle(8, 0xf7d64a);
    this.banana.add([glow, bananaShape]);
    this.banana.setAlpha(0);

    this.players = {};
    this.rankings = [];

    // Écoute Firebase
    listenRoom(this.roomRef, (data) => {
      this.syncFromFirebase(data);
    });

    // Input : cliquer pour courir
    this.input.on('pointerdown', () => {
      this.handleClick();
    });

    // Petite animation de la banane
    this.tweens.add({
      targets: this.banana,
      alpha: 1,
      y: 140,
      duration: 800,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
  }

  // Synchronisation depuis Firebase
  syncFromFirebase(data) {
    if (!data || !data.players) return;

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const spacing = 120;
    let index = 0;

    // Si la room a un état "finished", on bloque le jeu
    if (data.state === 'finished' && !this.gameFinished) {
      this.gameFinished = true;
      this.showResults(data);
    }

    for (const [id, p] of Object.entries(data.players)) {
      if (!this.players[id]) {
        // Création visuelle du bonobo
        const y = 180 + index * spacing;
        const container = this.add.container(100, y);

        const body = this.add.rectangle(0, 10, 40, 50, 0x5b3b24).setOrigin(0.5, 1);
        const head = this.add.circle(0, -30, 18, 0x5b3b24);
        const face = this.add.ellipse(0, -25, 26, 20, 0xc48a5a);
        const eyeL = this.add.circle(-6, -30, 4, 0xffffff);
        const eyeR = this.add.circle(6, -30, 4, 0xffffff);
        const pupilL = this.add.circle(-6, -30, 2, 0x000000);
        const pupilR = this.add.circle(6, -30, 2, 0x000000);

        container.add([body, head, face, eyeL, eyeR, pupilL, pupilR]);

        const nameText = this.add.text(0, 40, id, {
          fontSize: '14px',
          fill: '#ffffff'
        }).setOrigin(0.5);

        container.add(nameText);

        this.players[id] = {
          container,
          nameText,
          data: p
        };
      }

      const player = this.players[id];

      // Position X
      const x = p.x !== undefined ? p.x : 100;
      player.container.x = x;

      // Sauvegarde des données
      player.data = p;
      index++;
    }
  }

  // Quand le joueur clique
  handleClick() {
    if (this.gameFinished) return;
    const player = this.players[this.playerId];
    if (!player) return;

    // Petit boost aléatoire
    const boost = Phaser.Math.Between(10, 25);
    const newX = player.container.x + boost;

    // Animation de "saut" du bonobo
    this.tweens.add({
      targets: player.container,
      y: player.container.y - 10,
      duration: 100,
      yoyo: true
    });

    // Mise à jour Firebase
    updatePlayer(this.roomRef, this.playerId, { x: newX });

    // Si on dépasse la ligne d'arrivée
    if (newX >= this.finishX && !player.data.finished) {
      this.handleFinish();
    }
  }

  // Quand ce joueur termine la course
  async handleFinish() {
    const player = this.players[this.playerId];
    if (!player) return;

    // Marquer ce joueur comme "finished"
    await updatePlayer(this.roomRef, this.playerId, {
      finished: true
    });

    // Récupérer l'état actuel pour calculer le rang
    this.roomRef.get().then((snapshot) => {
      const data = snapshot.val();
      if (!data || !data.players) return;

      const finishedPlayers = Object.values(data.players).filter(p => p.finished);
      const rank = finishedPlayers.length;

      updatePlayer(this.roomRef, this.playerId, { rank });

      // Si tout le monde a fini (3 joueurs max)
      const totalPlayers = Object.keys(data.players).length;
      if (finishedPlayers.length === totalPlayers) {
        setRoomState(this.roomRef, 'finished');
      }
    });
  }

  // Affichage des résultats
  showResults(data) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    const panel = this.add.rectangle(width / 2, height / 2, 500, 300, 0x2b1a10, 0.95);
    panel.setStrokeStyle(2, 0xffdd55);

    this.add.text(width / 2, height / 2 - 120, 'Résultats de la course', {
      fontSize: '28px',
      fill: '#ffdd55'
    }).setOrigin(0.5);

    const players = Object.entries(data.players);
    const sorted = players
      .filter(([_, p]) => p.rank !== undefined)
      .sort((a, b) => a[1].rank - b[1].rank);

    const lines = sorted.map(([id, p]) => {
      let place = p.rank + 'ᵉ';
      if (p.rank === 1) place = '1er';
      if (p.rank === 2) place = '2e';
      if (p.rank === 3) place = '3e';
      return `${place} - ${id}`;
    });

    this.add.text(width / 2, height / 2 - 40, lines.join('\n'), {
      fontSize: '22px',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    const backText = this.add.text(width / 2, height / 2 + 100, '[ Retour au menu ]', {
      fontSize: '20px',
      fill: '#ffdd55'
    }).setOrigin(0.5).setInteractive();

    backText.on('pointerover', () => backText.setFill('#ffee88'));
    backText.on('pointerout', () => backText.setFill('#ffdd55'));

    backText.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }
}
