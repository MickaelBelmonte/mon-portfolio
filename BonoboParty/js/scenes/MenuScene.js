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

    // Hover
    createText.on('pointerover', () => createText.setFill('#ffff88'));
    createText.on('pointerout', () => createText.setFill('#ffffff'));

    joinText.on('pointerover', () => joinText.setFill('#ffff88'));
    joinText.on('pointerout', () => joinText.setFill('#cccccc'));

    // Clicks
    createText.on('pointerdown', () => this.handleCreateRoom());
    joinText.on('pointerdown', () => {
      const code = prompt('Code de la partie ?');
      if (code) this.handleJoinRoom(code.trim().toUpperCase());
    });
  }

  async handleCreateRoom() {
    try {
      const { roomCode, roomRef } = await createRoom();

      this.registry.set('roomCode', roomCode);
      this.registry.set('roomRef', roomRef);

      const playerId = 'host_' + Math.floor(Math.random() * 99999);
      this.registry.set('playerId', playerId);

      await roomRef.child('players/' + playerId).set({
        joinedAt: Date.now(),
        ready: false
      });

      this.scene.start('LobbyScene');

    } catch (e) {
      this.infoText.setText('Erreur création partie');
      console.error(e);
    }
  }

  async handleJoinRoom(code) {
    try {
      const { roomRef, playerId } = await joinRoom(code);

      this.registry.set('roomCode', code);
      this.registry.set('roomRef', roomRef);
      this.registry.set('playerId', playerId);

      this.scene.start('LobbyScene');

    } catch (e) {
      this.infoText.setText('Partie introuvable');
      console.error(e);
    }
  }
}

