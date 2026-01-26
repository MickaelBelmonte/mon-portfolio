class BoardScene extends Phaser.Scene {
  constructor() {
    super('BoardScene');
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.roomRef = this.registry.get('roomRef');
    this.playerId = this.registry.get('playerId');

    // Fond jungle
    const bg = this.add.image(width / 2, height / 2, 'bg_jungle');
    bg.setDisplaySize(width, height);

    // Plateau (chemin)
    const board = this.add.image(width / 2, height / 2, 'board_path');
    board.setOrigin(0.5);

    this.tiles = [];
    this.bonusTiles = [2, 7];
    this.malusTiles = [4, 10];
    this.itemTiles = [3, 8];

    const tileSize = 80;
    const startX = 120;
    const y = height / 2 + 40; // léger décalage

    // Cases avec sprites
    for (let i = 0; i < 12; i++) {
      const x = startX + i * tileSize;

      let key = 'tile_normal';
      if (this.bonusTiles.includes(i)) key = 'tile_bonus';
      if (this.malusTiles.includes(i)) key = 'tile_malus';
      if (this.itemTiles.includes(i)) key = 'tile_item';

      const tile = this.add.image(x, y, key).setScale(0.9);
      tile.setDepth(1);
      this.tiles.push(tile);
    }

    this.add.text(width / 2, 80, 'Plateau Bonobo', {
      fontSize: '32px',
      fill: '#ffffff'
    }).setOrigin(0.5).setDepth(5);

    this.turnText = this.add.text(width / 2, 130, '', {
      fontSize: '20px',
      fill: '#ffdd88'
    }).setOrigin(0.5).setDepth(5);

    // Timer si tu veux le garder
    this.turnTime = 20;
    this.turnTimer = null;
    this.remainingTime = 0;
    this.timerText = this.add.text(width - 120, 40, '', {
      fontSize: '26px',
      fill: '#ffdd55'
    }).setOrigin(0.5).setDepth(5);

    this.music = this.sound.add('boardMusic', { loop: true, volume: 0.4 });
    this.music.play();

    this.players = {};
    this.currentTurn = null;
    this.activeItem = null;

    // Bouton lancer dé (UI image + texte)
    const rollBtnImg = this.add.image(width / 2, height - 80, 'ui_button').setScale(1.2).setDepth(5);
    this.rollButton = this.add.text(rollBtnImg.x, rollBtnImg.y, 'Lancer le dé', {
      fontSize: '22px',
      fill: '#000000'
    }).setOrigin(0.5).setDepth(6);

    rollBtnImg.setInteractive();
    rollBtnImg.on('pointerdown', () => this.rollDice());

    this.rollBtnImg = rollBtnImg;
    this.setRollButtonEnabled(false);

    // Bouton objets
    const itemBtnImg = this.add.image(140, height - 80, 'ui_button').setScale(0.9).setDepth(5);
    this.itemButton = this.add.text(itemBtnImg.x, itemBtnImg.y, 'Objets', {
      fontSize: '20px',
      fill: '#000000'
    }).setOrigin(0.5).setDepth(6);

    itemBtnImg.setInteractive();
    itemBtnImg.on('pointerdown', () => this.openItemMenu());

    this.itemBtnImg = itemBtnImg;

    listenRoom(this.roomRef, data => this.syncFromFirebase(data));
  }

  setRollButtonEnabled(enabled) {
    if (enabled) {
      this.rollBtnImg.setAlpha(1);
      this.rollBtnImg.setInteractive();
      this.rollButton.setAlpha(1);
    } else {
      this.rollBtnImg.setAlpha(0.4);
      this.rollBtnImg.disableInteractive();
      this.rollButton.setAlpha(0.4);
    }
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

    for (const [id, p] of players) {
      if (!this.players[id]) {
        const sprite = this.add.sprite(0, 0, 'bonobo_idle');
        sprite.setScale(1.2);
        sprite.setDepth(4);
        sprite.play('bonobo_idle_anim');
        this.players[id] = { sprite, data: p };
      }

      const tileIndex = p.tile || 0;
      const tile = this.tiles[tileIndex];
      const playerSprite = this.players[id].sprite;

      playerSprite.x = tile.x;
      playerSprite.y = tile.y - 50;
      this.players[id].data = p;
    }

    if (this.currentTurn === this.playerId) {
      this.setRollButtonEnabled(true);
      this.startTurnTimer();
    } else {
      this.setRollButtonEnabled(false);
      this.stopTurnTimer();
    }

    if (data.state === 'minigame') {
      this.music.stop();
      this.stopTurnTimer();
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

      if (this.activeItem === 'bananaBoost') value += 3;
      if (this.activeItem === 'goldenDice') value = Phaser.Math.Between(4, 6);

      const usedShield = this.activeItem === 'shield';
      this.activeItem = null;

      let newTile = currentTile + value;
      if (newTile > 11) newTile = 11;

      updatePlayer(this.roomRef, this.playerId, { tile: newTile });

      const tile = this.tiles[newTile];

      if (this.bonusTiles.includes(newTile)) {
        addScore(this.roomRef, this.playerId, 2);
        this.sound.play('bonusSound');
        this.showFloatingText(tile.x, tile.y - 80, '+2 points !');
      }

      if (this.malusTiles.includes(newTile)) {
        if (usedShield) {
          this.showFloatingText(tile.x, tile.y - 80, 'Bouclier !');
        } else {
          addScore(this.roomRef, this.playerId, -1);
          this.sound.play('malusSound');
          this.showFloatingText(tile.x, tile.y - 80, '-1 point...');
        }
      }

      if (this.itemTiles.includes(newTile)) {
        const items = ['bananaBoost', 'shield', 'goldenDice'];
        const item = Phaser.Math.RND.pick(items);
        const path = 'players/' + this.playerId + '/items/' + item;
        this.roomRef.child(path).transaction(v => (v || 0) + 1);
        this.sound.play('bonusSound');
        this.showFloatingText(tile.x, tile.y - 110, 'Objet obtenu !');
      }

      this.stopTurnTimer();

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

    const panel = this.add.image(width / 2, height / 2, 'ui_panel').setDepth(20);
    panel.setScale(1.2);

    const title = this.add.text(width / 2, height / 2 - 110, 'Objets', {
      fontSize: '24px',
      fill: '#ffdd55'
    }).setOrigin(0.5).setDepth(21);

    let y = height / 2 - 60;
    const buttons = [];

    const addItemButton = (label, key, iconKey) => {
      const count = data.items[key] || 0;
      if (count <= 0) return;

      const icon = this.add.image(width / 2 - 80, y, iconKey).setScale(0.8).setDepth(21);
      const btn = this.add.text(width / 2 + 20, y, `${label} x${count}`, {
        fontSize: '20px',
        fill: '#ffffff'
      }).setOrigin(0.5).setDepth(21).setInteractive();

      btn.on('pointerdown', () => {
        this.useItem(key);
        cleanup();
      });

      buttons.push(btn, icon);
      y += 50;
    };

    addItemButton('Banane Turbo', 'bananaBoost', 'item_banana');
    addItemButton('Bouclier', 'shield', 'item_shield');
    addItemButton('Dé Doré', 'goldenDice', 'item_golden_dice');

    const closeBtn = this.add.text(width / 2, height / 2 + 110, '[ Fermer ]', {
      fontSize: '18px',
      fill: '#ffdd55'
    }).setOrigin(0.5).setDepth(21).setInteractive();

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
    this.showFloatingText(p.x, p.y - 80, 'Objet utilisé !');
  }

  showFloatingText(x, y, text) {
    const t = this.add.text(x, y, text, {
      fontSize: '18px',
      fill: '#ffdd55',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(30);

    this.tweens.add({
      targets: t,
      y: y - 40,
      alpha: 0,
      duration: 800,
      onComplete: () => t.destroy()
    });
  }

  startTurnTimer() {
    this.stopTurnTimer();

    this.remainingTime = this.turnTime;
    this.timerText.setText(this.remainingTime + 's');

    this.turnTimer = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.remainingTime--;
        this.timerText.setText(this.remainingTime + 's');

        if (this.remainingTime <= 0) {
          this.stopTurnTimer();
          this.forceNextPlayer();
        }
      }
    });
  }

  stopTurnTimer() {
    if (this.turnTimer) {
      this.turnTimer.remove();
      this.turnTimer = null;
    }
    this.timerText.setText('');
  }

  forceNextPlayer() {
    this.roomRef.get().then(snapshot => {
      const data = snapshot.val();
      const order = data.turnOrder || [];
      const nextIndex = (data.turnIndex + 1) % order.length;
      this.roomRef.child('turnIndex').set(nextIndex);
    });
  }
}
