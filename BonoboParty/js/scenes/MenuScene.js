class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const centerX = this.cameras.main.width / 2;

    // Titre
    this.add.text(centerX, 120, 'BONOBO PARTY', {
      fontSize: '48px',
      fill: '#ffdd55'
    }).setOrigin(0.5);

    // Bouton : créer une partie
    const createText = this.add.text(centerX, 260, '[ Créer une partie ]', {
      fontSize: '28px',
      fill: '#ffffff'
    }).setOrigin(0.5).setInteractive();

    // Bouton : rejoindre une partie
    const joinText = this.add.text(centerX, 320, '[ Rejoindre une partie ]', {
      fontSize: '24px',
      fill: '#cccccc'
    }).setOrigin(0.5).setInteractive();

    // Zone d'information
    this.infoText = this.add.text(centerX, 420, '', {
      fontSize: '20px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // Événements
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

  // Création d'une room Firebase
  async handleCreateRoom() {
    try {
      const { roomCode, roomRef } = await createRoom();

      this.infoText.setText('Partie créée : code ' + roomCode);

      // Stockage global
      this.registry.set('roomCode', roomCode);
      this.registry.set('roomRef', roomRef);

      // Le créateur devient playerId = host_xxx
      const playerId = 'host_' + Math.floor(Math.random() * 99999);
      this.registry.set('playerId', playerId);

      // Ajoute le créateur dans la room
      await roomRef.child('players/' + playerId).set({
        joinedAt: Date.now(),
        ready: false
      });

      // Aller au lobby
      this.scene.start('LobbyScene');

    } catch (e) {
      this.infoText.setText('Erreur création partie');
      console.error(e);
    }
  }

  // Rejoindre une room existante
  async handleJoinRoom(code) {
    try {
      const { roomRef, playerId } = await joinRoom(code);

      this.infoText.setText('Rejoint la partie ' + code);

      this.registry.set('roomCode', code);
      this.registry.set('roomRef', roomRef);
      this.registry.set('playerId', playerId);

      // Aller au lobby
      this.scene.start('LobbyScene');

    } catch (e) {
      this.infoText.setText('Partie introuvable');
      console.error(e);
    }
  }
}
