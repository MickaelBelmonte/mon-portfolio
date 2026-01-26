class BoardScene extends Phaser.Scene {
  constructor() {
    super('BoardScene');
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.roomRef = this.registry.get('roomRef');
    this.playerId = this.registry.get('playerId');

    // --- Fond jungle animé ---
    const bg = this.add.image(width / 2, height / 2, 'bg_jungle');
    bg.setDisplaySize(width, height);

    this.tweens.add({
      targets: bg,
      x: width / 2 + 20,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // --- Plateau graphique ---
    const board = this.add.image(width / 2, height / 2 + 40, 'board_path');
    board.setDepth(1);

    // --- Cases du plateau ---
    this.tiles = [];
    this.bonusTiles = [2, 7];
    this.malusTiles = [4, 10];
    this.itemTiles = [3, 8];

    const tileSize = 80;
    const startX = 120;
    const y = height / 2 + 40;

    for (let i = 0; i < 12; i++) {
      const x = startX + i * tileSize;

      let key = 'tile_normal';
      if (this.bonusTiles.includes(i)) key = 'tile_bonus';
      if (this.malusTiles.includes(i)) key = 'tile_malus';
      if (this.itemTiles.includes(i)) key = 'tile_item';

      const tile = this.add.image(x, y, key).setScale(0.9).setDepth(2);
      this.tiles.push(tile);
    }

    // --- Titre ---
    this.add.text(width / 2, 80, 'Plateau Bonobo', {
      fontSize: '32px',
      fill: '#ffffff',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(10);

    // --- Texte du tour ---
    this.turnText = this.add.text(width / 2, 130, '', {
      fontSize: '22px',
      fill: '#ffdd88',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(10);

    // --- Timer ---
    this.turnTime = 20;
    this.turnTimer = null;
    this.remainingTime = 0;

    this.timerText = this.add.text(width - 120, 40, '', {
      fontSize: '26px',
      fill: '#ffdd55',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(10);

    // --- Musique ---
    this.music = this.sound.add('boardMusic', { loop: true, volume: 0.4 });
    this.music.play();

    // --- Joueurs ---
    this.players = {};
    this.currentTurn = null;
    this.activeItem = null;

    // --- Bouton lancer dé ---
    const rollBtnImg = this.add.image(width / 2, height - 80, 'ui_button')
      .setScale(1.2)
      .setDepth(10);

    this.rollButton = this.add.text(rollBtnImg.x, rollBtnImg.y, 'Lancer le dé', {
      fontSize: '22px',
      fill: '#000'
    }).setOrigin(0.5).setDepth(11);

    rollBtnImg.setInteractive();
    rollBtnImg.on('pointerdown', () => this.rollDice());

    this.rollBtnImg = rollBtnImg;
    this.setRollButtonEnabled(false);

    // --- Bouton objets ---
    const itemBtnImg = this.add.image(140, height - 80, 'ui_button')
      .setScale(0.9)
      .setDepth(10);

    this.itemButton = this.add.text(itemBtnImg.x, itemBtnImg.y, 'Objets', {
      fontSize: '20px',
      fill: '#000'
    }).setOrigin(0.5).setDepth(11);

    itemBtnImg.setInteractive();
    itemBtnImg.on('pointerdown', () => this.openItemMenu());

    this.itemBtnImg = itemBtnImg;

    // --- Sync Firebase ---
    listenRoom(this.roomRef, data => this.syncFromFirebase(data));
  }

  // --- Activation / désactivation du bouton ---
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

  // --- Synchronisation Firebase ---
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

    // --- Placement des joueurs ---
    let idx = 0;
    for (const [id, p] of players) {
      if (!this.players[id]) {
        const sprite = this.add.sprite(0, 0, 'bonobo_idle')
          .setScale(1.3)
          .setDepth(5);

        sprite.play('bonobo_idle_anim');

        const nameText = this.add.text(0, 0, p.name, {
          fontSize: '16px',
          fill: '#ffffff',
          stroke: '#000',
          strokeThickness: 3
        }).setOrigin(0.5).setDepth(6);

        this.players[id] = { sprite, nameText, data: p };
      }

      const tileIndex = p.tile || 0;
      const tile = this.tiles[tileIndex];

      const player = this.players[id];
      player.sprite.x = tile.x;
      player.sprite.y = tile.y - 50;

      player.nameText.x = tile.x;
      player.nameText.y = tile.y - 90;

      player.data = p;

      idx++;
    }

    // --- Gestion du tour ---
    if (this.currentTurn === this.playerId) {
      this.setRollButtonEnabled(true);
      this.startTurnTimer();
    } else {
      this.setRollButtonEnabled(false);
      this.stopTurnTimer();
    }

    // --- Passage au mini-jeu ---
    if (data.state === 'minigame') {
      this.music.stop();
      this.stopTurnTimer();
      this.scene.start('GameScene');
    }
  }

  // --- Lancer le dé ---
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

      // Bonus
      if (this.bonusTiles.includes(newTile)) {
        addScore(this.roomRef, this.playerId, 2);
        this.sound.play('bonusSound');
        this.showFloatingText(tile.x, tile.y - 80, '+2 points !');
      }

      // Malus
      if (this.malusTiles.includes(newTile)) {
        if (usedShield) {
          this.showFloatingText(tile.x, tile.y - 80, 'Bouclier !');
        } else {
          addScore(this.roomRef, this.playerId, -1);
          this.sound.play('malusSound');
          this.showFloatingText(tile.x, tile.y - 80, '-1 point...');
        }
      }

      // Objet
      if (this.itemTiles.includes(newTile)) {
        const items = ['bananaBoost', 'shield', 'goldenDice'];
        const item = Phaser.Math.RND.pick(items);
        const path = 'players/' + this.playerId + '/items/' + item;
        this.roomRef.child(path).transaction(v => (v || 0) + 1);
        this.sound.play('bonusSound');
        this.showFloatingText(tile.x, tile.y - 110, 'Objet obtenu !');
      }

      this.stopTurnTimer();

      // Mini-jeu
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

  // --- Menu objets ---
  openItemMenu() {
    const player = this.players[this.playerId];
    if (!player) return;

    const data = player.data;
    if (!data.items) return;

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const panel = this.add.image(width / 2, height / 2, 'ui_panel')
      .setScale(1.3)
      .setDepth(20);

    const title = this.add.text(width / 2, height / 2 - 110, 'Objets', {
      fontSize: '24px',
      fill: '#ffdd55',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(21);

    let y = height / 2 - 60;
    const buttons = [];

    const addItemButton = (label, key, iconKey) => {
      const count = data.items[key] || 0;
      if (count <= 0) return;

      const icon = this.add.image(width / 2 - 80, y, iconKey)
        .setScale(0.8)
        .setDepth(21);

      const btn = this.add.text(width / 2 + 20, y, `${label} x${count}`, {
        fontSize: '20px',
        fill: '#ffffff',
        stroke: '#000',
        strokeThickness: 3
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
      fill: '#ffdd55',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(21).setInteractive();

    closeBtn.on('pointerdown', () => cleanup());

    const cleanup = () => {
      panel.destroy();
      title.destroy();
      closeBtn.destroy();
      buttons.forEach(b => b.destroy());
    };
  }

  // --- Utilisation d'un objet ---
  useItem(item) {
    const path = 'players/' + this.playerId + '/items/' + item;
    this.roomRef.child(path).transaction(v => Math.max(0, (v || 0) - 1));
    this.activeItem = item;

    const p = this.players[this.playerId].sprite;
    this.showFloatingText(p.x, p.y - 80, 'Objet utilisé !');
  }

  // --- Texte flottant ---
  showFloatingText(x, y, text) {
    const t = this.add.text(x, y, text, {
      fontSize: '18px',
      fill: '#ffdd55',
      stroke: '#000',
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

  // --- Timer ---
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

