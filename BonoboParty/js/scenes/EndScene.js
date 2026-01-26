class EndScene extends Phaser.Scene {
  constructor() {
    super('EndScene');
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.roomRef = this.registry.get('roomRef');

    // --- Fond jungle ---
    const bg = this.add.image(width / 2, height / 2, 'bg_jungle');
    bg.setDisplaySize(width, height);

    // --- Musique de victoire ---
    this.music = this.sound.add('victoryMusic', { loop: true, volume: 0.5 });
    this.music.play();

    // --- Podium ---
    const podium = this.add.image(width / 2, height / 2 + 80, 'podium')
      .setScale(1.4)
      .setDepth(2);

    // --- Titre ---
    this.add.text(width / 2, 80, 'Classement Final', {
      fontSize: '48px',
      fill: '#ffdd55',
      stroke: '#000',
      strokeThickness: 6
    }).setOrigin(0.5).setDepth(10);

    // --- Confettis ---
    this.spawnConfetti();

    // --- Récupération des scores ---
    this.roomRef.get().then(snapshot => {
      const data = snapshot.val();
      if (!data || !data.players) return;

      const players = Object.entries(data.players);

      const sorted = players.sort((a, b) => b[1].score - a[1].score);

      this.displayWinners(sorted);
    });

    // --- Bouton rejouer ---
    const btn = this.add.text(width / 2, height - 80, '[ Rejouer ]', {
      fontSize: '32px',
      fill: '#ffffff',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5).setInteractive();

    btn.on('pointerdown', () => {
      this.music.stop();
      this.scene.start('MenuScene');
    });
  }

  displayWinners(sorted) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const positions = [
      { x: width / 2, y: height / 2 - 40 },     // 1er
      { x: width / 2 - 180, y: height / 2 + 20 }, // 2e
      { x: width / 2 + 180, y: height / 2 + 20 }  // 3e
    ];

    for (let i = 0; i < sorted.length; i++) {
      if (i >= 3) break;

      const [id, p] = sorted[i];
      const pos = positions[i];

      const sprite = this.add.sprite(pos.x, pos.y, 'bonobo_idle')
        .setScale(1.6)
        .setDepth(5);

      sprite.play('bonobo_idle_anim');

      // Animation montée
      this.tweens.add({
        targets: sprite,
        y: pos.y - 20,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // Nom du joueur
      this.add.text(pos.x, pos.y + 80, `${i + 1}ᵉ - ${p.name}`, {
        fontSize: '24px',
        fill: '#ffffff',
        stroke: '#000',
        strokeThickness: 4
      }).setOrigin(0.5).setDepth(6);
    }
  }

  spawnConfetti() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    for (let i = 0; i < 40; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(-200, -20);

      const conf = this.add.image(x, y, 'confetti')
        .setScale(Phaser.Math.FloatBetween(0.4, 0.8))
        .setDepth(20);

      this.tweens.add({
        targets: conf,
        y: height + 50,
        x: x + Phaser.Math.Between(-50, 50),
        duration: Phaser.Math.Between(2000, 4000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 1500),
        ease: 'Sine.easeInOut'
      });
    }
  }
}
