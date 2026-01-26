class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.cameras.main.setBackgroundColor('#102018');

    this.add.text(width / 2, 80, 'Bonobo Party', {
      fontSize: '48px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width / 2, 140, 'Multijoueur 2 à 4 joueurs', {
      fontSize: '20px',
      fill: '#ffdd88'
    }).setOrigin(0.5);

    // --- Champ pseudo ---
    this.add.text(width / 2, 220, 'Choisis ton pseudo :', {
      fontSize: '22px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // Création d’un input HTML par-dessus le canvas
    this.nameInput = document.createElement('input');
    this.nameInput.type = 'text';
    this.nameInput.placeholder = 'Ex : SuperBonobo';
    this.nameInput.maxLength = 12;
    this.nameInput.style.position = 'absolute';
    this.nameInput.style.left = `${width / 2 - 100}px`;
    this.nameInput.style.top = `${height / 2 - 20}px`;
    this.nameInput.style.width = '200px';
    this.nameInput.style.fontSize = '18px';
    this.nameInput.style.padding = '6px';
    this.nameInput.style.borderRadius = '6px';
    this.nameInput.style.border = '2px solid #ffaa33';
    this.nameInput.style.outline = 'none';
    this.nameInput.style.textAlign = 'center';
    this.nameInput.style.background = '#fff8e0';
    this.nameInput.style.zIndex = 1000;

    document.body.appendChild(this.nameInput);

    // --- Bouton jouer ---
    const playBtn = this.add.text(width / 2, height - 120, '[ Rejoindre la jungle ]', {
      fontSize: '28px',
      fill: '#ffdd55'
    }).setOrigin(0.5).setInteractive();

    playBtn.on('pointerover', () => playBtn.setFill('#ffee88'));
    playBtn.on('pointerout', () => playBtn.setFill('#ffdd55'));

    playBtn.on('pointerdown', () => {
      const pseudo = this.nameInput.value.trim();

      if (pseudo.length < 2) {
        alert('Ton pseudo doit faire au moins 2 caractères.');
        return;
      }

      // Sauvegarde du pseudo dans le registry
      this.registry.set('playerName', pseudo);

      // Supprimer l’input HTML
      this.nameInput.remove();

      this.scene.start('LobbyScene');
    });
  }

  shutdown() {
    if (this.nameInput) this.nameInput.remove();
  }
}
