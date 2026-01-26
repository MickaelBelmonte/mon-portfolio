class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const centerX = this.cameras.main.width / 2;

    this.add.text(centerX, 120, 'BONOBO PARTY', {
      fontSize: '48px',
      fill: '#ffdd55'
    }).setOrigin(0.5);

    const createText = this.add.text(centerX, 260, '[ Créer une partie ]', {
      fontSize: '28px',
      fill: '#ffffff'
    }).setOrigin(0.5).setInteractive();

    const joinText = this.add.text(centerX, 320, '[ Rejoindre une partie ]', {
      fontSize: '24px',
      fill: '#cccccc'
    }).setOrigin(0.5).setInteractive();

    this.infoText = this.add.text(centerX, 420, '', {
      fontSize: '20px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    createText.on('pointerdown', async () => {
      this.handleCreateRoom();
    });

    joinText.on('pointerdown', async () => {
      const code = prompt('Code de la partie ?');
      if (code) {
        this.handleJoinRoom(code.trim().toUpperCase());
      }
    });
  }

  async handleCreateRoom() {
    try {
      const { roomCode, roomRef } = await createRoom();
      this.infoText.setText('Partie créée : code ' + roomCode);

      // Pour l’exemple, on écoute la room
      listenRoom(roomRef, (data) => {
        console.log('Room update:', data);
      });

      // Tu peux stocker ça globalement
      this.registry.set('roomCode', roomCode);
      this.registry.set('roomRef', roomRef);

    } catch (e) {
      this.infoText.setText('Erreur création partie');
      console.error(e);
    }
  }

  async handleJoinRoom(code) {
    try {
      const { roomRef, playerId } = await joinRoom(code);
      this.infoText.setText('Rejoint la partie ' + code);

      this.registry.set('roomCode', code);
      this.registry.set('roomRef', roomRef);
      this.registry.set('playerId', playerId);

      listenRoom(roomRef, (data) => {
        console.log('Room update:', data);
      });

    } catch (e) {
      this.infoText.setText('Partie introuvable');
      console.error(e);
    }
  }
}


  create() {
    this.add.text(400, 200, 'BONOBO PARTY', {
      fontSize: '48px',
      fill: '#ffdd55'
    }).setOrigin(0.5);

    const startText = this.add.text(400, 400, 'Appuie pour commencer', {
      fontSize: '28px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      console.log('Le jeu va commencer ici');

      this.input.once('pointerdown', () => {
  this.scene.start('GameScene');
});

    });
  }
}
