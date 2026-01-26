class BoardScene extends Phaser.Scene {
  constructor() {
    super('BoardScene');
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.roomRef = this.registry.get('roomRef');
    this.playerId = this.registry.get('playerId');

    this.cameras.main.setBackgroundColor('#0e2a12');

    // Musique de fond
    this.music = this.sound.add('boardMusic', { loop: true, volume: 0.4 });
    this.music.play();

    // Plateau (12 cases)
    this.tiles = [];
    const tileSize = 80;
    const startX = 100;
    const startY = 200;

    for (let i = 0; i < 12; i++) {
      const x = startX + i * tileSize;
      const tile = this.add.rectangle(x, startY, tileSize - 10, tileSize - 10, 0x3b2a1a);
      tile.setStrokeStyle(2, 0xffffff);
      this.tiles.push(tile);
    }

    // Cases bonus/malus
    this.bonusTiles = [2, 7];
    this.malusTiles = [4, 10];

    this.bonusTiles.forEach(i => this.tiles[i].setFillStyle(0x55aa55));
    this.malusTiles.forEach(i => this.tiles[i].setFillStyle(0xaa5555));

    // Bonobos
    this.players = {};
    listenRoom(this.roomRef, data => this.syncPlayers(data));

    // Bouton lancer dé
    this.rollButton = this.add.text(width / 2, height - 100, '[ Lancer le dé ]', {
      fontSize: '28px',
      fill: '#ffdd55'
    }).setOrigin(0.5).setInteractive();

    this.rollButton.on('pointerdown', () => this.rollDice());
  }

  syncPlayers(data) {
    if (!data || !data.players) return;

    let index = 0;
    for (const [id, p] of Object.entries(data.players)) {
      if (!this.players[id]) {
        const bonobo = this.add.circle(0, 0, 20, 0x5b3b24);
        this.players[id] = { sprite: bonobo };
      }

      const tileIndex = p.tile || 0;
      const tile = this.tiles[tileIndex];
      this.players[id].sprite.x = tile.x;
      this.players[id].sprite.y = tile.y - 40;

      index++;
    }
  }

  rollDice() {
    const value = Phaser.Math.Between(1, 6);

    this.sound.play('diceSound');

    const player = this.players[this.playerId];
    if (!player) return;

    this.roomRef.child('players/' + this.playerId).get().then(snapshot => {
      const data = snapshot.val();
      const newTile = Math.min(11, (data.tile || 0) + value);

      updatePlayer(this.roomRef, this.playerId, { tile: newTile });

      // Bonus
      if (this.bonusTiles.includes(newTile)) {
        addScore(this.roomRef, this.playerId, 2);
        this.sound.play('bonusSound');
      }

      // Malus
      if (this.malusTiles.includes(newTile)) {
        addScore(this.roomRef, this.playerId, -1);
        this.sound.play('malusSound');
      }

      // Case mini‑jeu
      if (newTile === 11) {
        this.time.delayedCall(1000, () => {
          this.music.stop();
          this.scene.start('GameScene');
        });
      }
    });
  }
}
