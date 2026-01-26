class LobbyScene extends Phaser.Scene {
  constructor() {
    super('LobbyScene');
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.cameras.main.setBackgroundColor('#142018');

    this.add.text(width / 2, 60, 'Lobby Bonobo', {
      fontSize: '32px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    this.statusText = this.add.text(width / 2, 100, 'Connexion...', {
      fontSize: '18px',
      fill: '#ffdd88'
    }).setOrigin(0.5);

    this.playersText = this.add.text(width / 2, 160, '', {
      fontSize: '20px',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    const name = this.registry.get('playerName');
    const savedId = this.registry.get('savedId');

    createOrJoinRoom(name, savedId, (roomRef, playerId) => {
      this.roomRef = roomRef;
      this.playerId = playerId;

      this.registry.set('roomRef', roomRef);
      this.registry.set('playerId', playerId);

      this.statusText.setText('En attente de joueurs...');

      listenRoom(roomRef, data => this.updateLobby(data));
    });
  }

  updateLobby(data) {
    if (!data || !data.players) return;

    const players = Object.entries(data.players);
    const count = players.length;

    let txt = `Joueurs connectés : ${count}\n\n`;
    players.forEach(([id, p]) => {
      txt += `${p.name} ${p.ready ? '✅' : '⏳'}\n`;
    });

    this.playersText.setText(txt);

    if (!this.readyButton) {
      const width = this.cameras.main.width;
      const height = this.cameras.main.height;

      this.readyButton = this.add.text(width / 2, height - 120, '[ Je suis prêt ]', {
        fontSize: '26px',
        fill: '#55ff55'
      }).setOrigin(0.5).setInteractive();

      this.readyButton.on('pointerdown', () => {
        updatePlayer(this.roomRef, this.playerId, { ready: true });
      });
    }

    const readyCount = players.filter(([_, p]) => p.ready).length;

    if (count >= 2 && readyCount === count && data.state === 'lobby') {
      const order = players.map(([id]) => id);
      this.roomRef.child('turnOrder').set(order);
      this.roomRef.child('turnIndex').set(0);
      setRoomState(this.roomRef, 'board');
    }

    if (data.state === 'board') {
      this.scene.start('BoardScene');
    }
  }
}
