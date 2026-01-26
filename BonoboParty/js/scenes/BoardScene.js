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

    this.music = this.sound.add('boardMusic', { loop: true, volume: 0.4 });
    this.music.play();

    this.tiles = [];
    this.bonusTiles = [2, 7];
    this.malusTiles = [4, 10];
    this.itemTiles = [3, 8];

    const tileSize = 80;
    const startX = 120;
    const y = height / 2;

    for (let i = 0; i < 12; i++) {
      const x = startX + i * tileSize;
      const tile = this.add.rectangle(x, y, tileSize - 10, tileSize - 10, 0x3b2a1a);
      tile.setStrokeStyle(2, 0xffffff);
      this.tiles.push(tile);
    }

    this.bonusTiles.forEach(i => this.tiles[i].setFillStyle(0x55aa55));
    this.malusTiles.forEach(i => this.tiles[i].setFillStyle(0xaa5555));
    this.itemTiles.forEach(i => this.tiles[i].setFillStyle(0x5555aa));

    this.add.text(width / 2, 80, 'Plateau Bonobo', {
      fontSize: '32px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    this.turnText = this.add.text(width / 2, 130, '', {
      fontSize: '20px',
      fill: '#ffdd88'
    }).setOrigin(0.5);

    this.players = {};
    this.currentTurn = null;
    this.activeItem = null;

    this.rollButton = this.add.text(width / 2, height - 80, '[ Lancer le dé ]', {
      fontSize: '26px',
      fill: '#ffdd55'
    }).setOrigin(0.5);
    this.rollButton.setAlpha(0.5);
    this.rollButton.disableInteractive();

    this.rollButton.on('pointerdown', () => this.rollDice());

    this.itemButton = this.add.text(120, height - 80, '[ Objets ]', {
      fontSize: '22px',
      fill: '#ffdd55'
    }).setOrigin(0.5).setInteractive();

    this.itemButton.on('pointerdown', () => this.openItemMenu());

    listenRoom(this.roomRef, data => this.syncFromFirebase(data));
  }

  syncFromFirebase(data) {
    if (!data || !data.players) return;

    const players = Object.entries(data.players);
    const order = data.turnOrder || [];
    const turnIndex = data.turnIndex || 0;

    this.currentTurn = order[turnIndex] || null;

    this.turnText.setText(
      this.currentTurn === this.playerId
        ? 'À toi de jouer !'
        : `Tour de : ${data.players[this.currentTurn]?.name || '...'}`
    );

    let idx = 0;
    for (const [id, p] of players) {
      if (!this.players[id]) {
        const sprite = this.add.circle(0, 0, 20, 0x5b3b24);
        this.players[id] = { sprite, data: p };
      }

      const tileIndex = p.tile || 0;
      const tile = this.tiles[tileIndex];
      this.players[id].sprite.x = tile.x;
      this.players[id].sprite.y = tile.y - 40;
      this.players[id].data = p;

      idx++;
    }

    if (this.currentTurn === this.playerId) {
      this.rollButton.setAlpha(1);
      this.rollButton.setInteractive();
    } else {
      this.rollButton.setAlpha(0.5);
      this.rollButton.disableInteractive();
    }

    if (data.state === 'minigame') {
      this.music.stop();
      this.scene.start('GameScene');
    }
  }

  rollDice() {
    if (this.currentTurn !== this.playerId) return;

    const player = this.players[this.playerId];
    if (!player) return;

    this.sound.play('diceSound');

    this.roomRef.child('players/' + this.playerId).get().then(snapshot => {
      const data = snapshot.val();
      const currentTile = data.tile || 0;

      let value = Phaser.Math.Between(1, 6);

      if (this.activeItem === 'bananaBoost') {
        value += 3;
      }
      if (this.activeItem === 'goldenDice') {
        value = Phaser.Math.Between(4, 6);
      }

      this.activeItem = null;

      let newTile = currentTile + value;
      if (newTile > 11) newTile = 11;

      updatePlayer(this.roomRef, this.playerId, { tile: newTile });

      const tile = this.tiles[newTile];

      if (this.bonusTiles.includes(newTile)) {
        addScore(this.roomRef, this.playerId, 2);
        this.sound.play('bonusSound');
        this.showFloatingText(tile.x, tile.y - 60, '+2 points !');
      }

      if (this.malusTiles.includes(newTile)) {
        if (data.items && data.items.shield > 0 && this.activeItem === 'shield') {
          this.showFloatingText(tile.x, tile.y - 60, 'Bouclier !');
        } else {
          addScore(this.roomRef, this.playerId, -1);
          this.sound.play('malusSound');
          this.showFloatingText(tile.x, tile.y - 60, '-1 point...');
        }
      }

      if (this.itemTiles.includes(newTile)) {
        const items = ['bananaBoost', 'shield', 'goldenDice'];
        const item = Phaser.Math.RND.pick(items);
        const path = 'players/' + this.playerId + '/items/' + item;
        this.roomRef.child(path).transaction(v => (v || 0) + 1);
        this.sound.play('bonusSound');
        this.showFloatingText(tile.x, tile.y - 90, 'Objet obtenu !');
      }

      if (newTile === 11) {
        setRoomState(this.roomRef, 'minigame');
      } else {
        this.roomRef.get().then(snap => {
          const d = snap.val();
          const order = d.turnOrder || [];
          const nextIndex = (d.turnIndex + 1) % order.length;
          this.roomRef.child('turnIndex').set(nextIndex);
        });
      }
    });
  }

  openItemMenu() {
    const player = this.players[this.playerId];
    if (!player) return;

    const data = player.data;
    if (!data.items) return;

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const panel = this.add.rectangle(width / 2, height / 2, 320, 260, 0x000000, 0.8);
    panel.setStrokeStyle(2, 0xffdd55);

    const title = this.add.text(width / 2, height / 2 - 110, 'Objets', {
      fontSize: '24px',
      fill: '#ffdd55'
    }).setOrigin(0.5);

    let y = height / 2 - 60;

    const buttons = [];

    const addItemButton = (label, key) => {
      const count = data.items[key] || 0;
      if (count <= 0) return;

      const btn = this.add.text(width / 2, y, `${label} x${count}`, {
        fontSize: '20px',
        fill: '#ffffff'
      }).setOrigin(0.5).setInteractive();

      btn.on('pointerdown', () => {
        this.useItem(key);
        cleanup();
      });

      buttons.push(btn);
      y += 40;
    };

    addItemButton('🍌 Banane Turbo', 'bananaBoost');
    addItemButton('🛡️ Bouclier', 'shield');
    addItemButton('🎲 Dé Doré', 'goldenDice');

    const closeBtn = this.add.text(width / 2, height / 2 + 90, '[ Fermer ]', {
      fontSize: '18px',
      fill: '#ffdd55'
    }).setOrigin(0.5).setInteractive();

    closeBtn.on('pointerdown', () => cleanup());

    const cleanup = () => {
      panel.destroy();
      title.destroy();
      closeBtn.destroy();
      buttons.forEach(b => b.destroy());
    };
  }

  useItem(item) {
    const path = 'players/' + this.playerId + '/items/' + item;
    this.roomRef.child(path).transaction(v => Math.max(0, (v || 0) - 1));
    this.activeItem = item;

    const p = this.players[this.playerId].sprite;
    this.showFloatingText(p.x, p.y - 60, 'Objet utilisé !');
  }

  showFloatingText(x, y, text) {
    const t = this.add.text(x, y, text, {
      fontSize: '18px',
      fill: '#ffdd55'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: t,
      y: y - 40,
      alpha: 0,
      duration: 800,
      onComplete: () => t.destroy()
    });
  }
}
