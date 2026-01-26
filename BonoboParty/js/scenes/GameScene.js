class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.roomRef = this.registry.get('roomRef');
    this.playerId = this.registry.get('playerId');

    // Ligne d'arrivée
    this.finishX = width - 100;

    this.add.rectangle(this.finishX, height / 2, 20, height, 0xffdd55);

    // Sol
    this.add.rectangle(width / 2, height - 40, width, 80, 0x3b2a1a);

    // Liste des joueurs
    this.players = {};

    // Écoute Firebase
    listenRoom(this.roomRef, (data) => {
      this.syncPlayers(data);
    });

    // Input : cliquer pour courir
    this.input.on('pointerdown', () => {
      this.moveForward();
    });
  }

  syncPlayers(data) {
    if (!data || !data.players) return;

    const height = this.cameras.main.height;
    const spacing = 120;
    let index = 0;

    for (const [id, p] of Object.entries(data.players)) {
      if (!this.players[id]) {
        // Création du bonobo
        const y = 150 + index * spacing;
        const bonobo = this.add.rectangle(100, y, 40, 40, 0x5b3b24);
        this.players[id] = { sprite: bonobo };
      }

      // Mise à jour position
      if (p.x !== undefined) {
        this.players[id].sprite.x = p.x;
      }

      index++;
    }
  }

  moveForward() {
    const player = this.players[this.playerId];
    if (!player) return;

    const newX = player.sprite.x + 15;

    // Mise à jour Firebase
    updatePlayer(this.roomRef, this.playerId, { x: newX });

    // Vérifier arrivée
    if (newX >= this.finishX) {
      setRoomState(this.roomRef, 'finished');
    }
  }
}
