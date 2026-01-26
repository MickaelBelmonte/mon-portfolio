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

    this.infoText = this.add.text(width / 2, height - 100, 'Clique pour courir !', {
      fontSize: '20px',
      fill: '#ffddaa'
    }).setOrigin(0.5);

    // Sainte Banane (boost)
    this.banana = this.add.container(width / 2, 120);
    const glow = this.add.circle(0, 0, 40, 0xffffaa, 0.4);
    const bananaShape = this.add.arc(0, 0, 20, 200, 340, false)
      .setStrokeStyle(8, 0xf7d64a);
    this.banana.add([glow, bananaShape]);
    this.banana.setAlpha(0);

    this.players = {};
    this.obstacles = [];

    // Générer obstacles
    this.spawnObstacles();

    // Écoute Firebase
    listenRoom(this.roomRef, (data) => {
      this.syncFromFirebase(data);
    });

    // Input
    this.input.on('pointerdown', () => {
      this.handleClick();
    });

    // Animation banane
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

  spawnObstacles() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    for (let i = 0; i < 4; i++) {
      const x = Phaser.Math.Between(300, width - 200);
      const y = 180 + i * 80;

      const rock = this.add.circle(x, y, 20, 0x4a3a2a);
      this.obstacles.push(rock);
    }
  }

  syncFromFirebase(data) {
    if (!data || !data.players) return;

    const spacing = 120;
    let index = 0;

    if (data.state === 'finished' && !this.gameFinished) {
      this.gameFinished = true;
      this.showResults(data);
    }

    for (const [id, p] of Object.entries(data.players)) {
      if (!this.players[id]) {
        const y = 180 + index * spacing;
        const container = this.createBonobo(100, y, id);
        this.players[id] = { container, data: p };
      }

      const player = this.players[id];
      player.container.x = p.x ?? 100;
      player.data = p;

      index++;
    }
  }

  createBonobo(x, y, id) {
    const container = this.add.container(x, y);

    const body = this.add.rectangle(0, 10, 40, 50, 0x5b3b24).setOrigin(0.5, 1);
    const head = this.add.circle(0, -30, 18, 0x5b3b24);
    const face = this.add.ellipse(0, -25, 26, 20, 0xc48a5a);
    const eyeL = this.add.circle(-6, -30, 4, 0xffffff);
    const eyeR = this.add.circle(6, -30, 4, 0xffffff);
    const pupilL = this.add.circle(-6, -30, 2, 0x000000);
    const pupilR = this.add.circle(6, -30, 2, 0x000000);

    const nameText = this.add.text(0, 40, id, {
      fontSize: '14px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    container.add([body, head, face, eyeL, eyeR, pupilL, pupilR, nameText]);

    return container;
  }

  handleClick() {
    if (this.gameFinished) return;

    const player = this.players[this.playerId];
    if (!player) return;

    const currentX = player.container.x;

    // Vérifier obstacle
    const hitObstacle = this.obstacles.some(obs => {
      return Math.abs(obs.x - currentX) < 30;
    });

    let boost = Phaser.Math.Between(10, 25);

    if (hitObstacle) {
      boost = -10; // recule un peu
      this.infoText.setText('Aïe ! Un obstacle !');
    } else {
      this.infoText.setText('Clique pour courir !');
    }

    // Boost Sainte Banane (5% de chance)
    if (Phaser.Math.Between(1, 20) === 1) {
      boost = 50;
      this.showBananaFlash();
    }

    const newX = currentX + boost;

    // Animation de course
    this.tweens.add({
      targets: player.container,
      y: player.container.y - 10,
      duration: 100,
      yoyo: true
    });

    updatePlayer(this.roomRef, this.playerId, { x: newX });

    if (newX >= this.finishX && !player.data.finished) {
      this.handleFinish();
    }
  }

  showBananaFlash() {
    this.cameras.main.flash(200, 255, 255, 100);
  }

  async handleFinish() {
    const player = this.players[this.playerId];
    if (!player) return;

    await updatePlayer(this.roomRef, this.playerId, { finished: true });

    this.roomRef.get().then((snapshot) => {
      const data = snapshot.val();
      const finishedPlayers = Object.values(data.players).filter(p => p.finished);
      const rank = finishedPlayers.length;

      updatePlayer(this.roomRef, this.playerId, { rank });

      const totalPlayers = Object.keys(data.players).length;
      if (finishedPlayers.length === totalPlayers) {
        setRoomState(this.roomRef, 'finished');
      }
    });
  }

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
