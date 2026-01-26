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

    // --- Fond jungle animé ---
    const bg = this.add.image(width / 2, height / 2, 'mg_bg_jungle');
    bg.setDisplaySize(width, height);

    this.tweens.add({
      targets: bg,
      x: width / 2 + 20,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // --- Ligne d'arrivée ---
    this.add.image(this.finishX, height / 2, 'mg_finish')
      .setScale(1.2)
      .setDepth(2);

    this.add.text(width / 2, 40, 'Course aux Noix', {
      fontSize: '32px',
      fill: '#ffffff',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.infoText = this.add.text(width / 2, height - 80, 'Clique pour courir !', {
      fontSize: '20px',
      fill: '#ffddaa',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5);

    // --- Obstacles ---
    this.obstacles = [];
    this.spawnObstacles();

    // --- Bonus banane ---
    this.banana = this.add.image(width / 2, 120, 'mg_banana')
      .setScale(0.8)
      .setDepth(3);

    this.tweens.add({
      targets: this.banana,
      y: 140,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // --- Joueurs ---
    this.players = {};

    listenRoom(this.roomRef, data => this.syncFromFirebase(data));

    // --- Input ---
    this.input.on('pointerdown', () => this.handleClick());
  }

  spawnObstacles() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const obstacleKeys = ['mg_rock', 'mg_trunk'];

    for (let i = 0; i < 3; i++) {
      const x = Phaser.Math.Between(300, width - 200);
      const y = 200 + i * 80;

      const key = Phaser.Math.RND.pick(obstacleKeys);

      const obs = this.add.image(x, y, key)
        .setScale(1.1)
        .setDepth(2);

      this.obstacles.push(obs);
    }
  }

  syncFromFirebase(data) {
    if (!data || !data.players) return;

    const spacing = 80;
    let index = 0;

    // Retour au plateau
    if (data.state === 'board' && this.gameFinished) {
      this.scene.start('BoardScene');
      return;
    }

    for (const [id, p] of Object.entries(data.players)) {
      if (!this.players[id]) {
        const y = 200 + index * spacing;

        const bonobo = this.add.sprite(100, y, 'mg_bonobo_run')
          .setScale(1.3)
          .setDepth(3);

        bonobo.play('mg_bonobo_run_anim');

        const nameText = this.add.text(100, y + 40, p.name, {
          fontSize: '16px',
          fill: '#ffffff',
          stroke: '#000',
          strokeThickness: 3
        }).setOrigin(0.5);

        this.players[id] = { sprite: bonobo, nameText, data: p };
      }

      const player = this.players[id];
      player.sprite.x = p.x || 100;
      player.nameText.x = p.x || 100;
      player.data = p;

      index++;
    }
  }

  handleClick() {
    if (this.gameFinished) return;

    const player = this.players[this.playerId];
    if (!player) return;

    const currentX = player.sprite.x;

    // Collision obstacle
    const hitObstacle = this.obstacles.some(obs => Math.abs(obs.x - currentX) < 40);

    let boost = Phaser.Math.Between(10, 25);

    if (hitObstacle) {
      boost = -10;
      this.sound.play('mg_hit');
      this.infoText.setText('Aïe ! Un obstacle !');
    } else {
      this.infoText.setText('Clique pour courir !');
    }

    // Boost rare
    if (Phaser.Math.Between(1, 20) === 1) {
      boost = 50;
      this.sound.play('mg_boost');
      this.cameras.main.flash(200, 255, 255, 100);
    }

    const newX = currentX + boost;

    // Petit saut
    this.tweens.add({
      targets: player.sprite,
      y: player.sprite.y - 10,
      duration: 100,
      yoyo: true
    });

    updatePlayer(this.roomRef, this.playerId, { x: newX });

    if (newX >= this.finishX && !player.data.finished) {
      this.handleFinish();
    }
  }

  handleFinish() {
    const player = this.players[this.playerId];
    if (!player) return;

    updatePlayer(this.roomRef, this.playerId, { finished: true });

    this.roomRef.get().then(snapshot => {
      const data = snapshot.val();
      if (!data || !data.players) return;

      const finishedPlayers = Object.entries(data.players).filter(([_, p]) => p.finished);
      const rank = finishedPlayers.length;

      updatePlayer(this.roomRef, this.playerId, { rank });

      // Points
      if (rank === 1) addScore(this.roomRef, this.playerId, 3);
      if (rank === 2) addScore(this.roomRef, this.playerId, 2);
      if (rank === 3) addScore(this.roomRef, this.playerId, 1);

      const totalPlayers = Object.keys(data.players).length;

      if (finishedPlayers.length === totalPlayers) {
        this.gameFinished = true;
        setRoomState(this.roomRef, 'board');
        this.showResults(data);
      }
    });
  }

  showResults(data) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
      .setDepth(10);

    const panel = this.add.image(width / 2, height / 2, 'ui_panel')
      .setScale(1.4)
      .setDepth(11);

    this.add.text(width / 2, height / 2 - 120, 'Résultats de la course', {
      fontSize: '28px',
      fill: '#ffdd55',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(12);

    const players = Object.entries(data.players);
    const sorted = players
      .filter(([_, p]) => p.rank !== null && p.rank !== undefined)
      .sort((a, b) => a[1].rank - b[1].rank);

    const lines = sorted.map(([id, p]) => {
      let place = p.rank + 'ᵉ';
      if (p.rank === 1) place = '1er';
      if (p.rank === 2) place = '2e';
      if (p.rank === 3) place = '3e';
      return `${place} - ${p.name}`;
    });

    this.add.text(width / 2, height / 2 - 20, lines.join('\n'), {
      fontSize: '22px',
      fill: '#ffffff',
      align: 'center',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(12);

    const backText = this.add.text(width / 2, height / 2 + 120, '[ Retour au plateau ]', {
      fontSize: '20px',
      fill: '#ffdd55',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(12).setInteractive();

    backText.on('pointerdown', () => {
      this.scene.start('BoardScene');
    });
  }
}
