class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    const groundY = this.cameras.main.height - 80;

    this.add.text(centerX, 40, 'Chargement de la jungle...', {
      fontSize: '28px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    this.add.rectangle(centerX, groundY + 40, 900, 80, 0x3b2a1a)
      .setStrokeStyle(2, 0x2a1b10);

    // Bonobo
    this.bonobo = this.add.container(centerX - 150, groundY);
    this.bonobo.add([
      this.add.rectangle(0, 10, 40, 50, 0x5b3b24).setOrigin(0.5, 1),
      this.add.circle(0, -30, 20, 0x5b3b24),
      this.add.ellipse(0, -25, 28, 22, 0xc48a5a),
      this.add.circle(-8, -30, 5, 0xffffff),
      this.add.circle(8, -30, 5, 0xffffff),
      this.add.circle(-8, -30, 2, 0x000000),
      this.add.circle(8, -30, 2, 0x000000),
      this.add.arc(20, 0, 18, 180, 320, false).setStrokeStyle(4, 0x5b3b24)
    ]);

    // Moufle
    this.moufle = this.add.container(centerX + 40, groundY);
    this.moufle.add([
      this.add.rectangle(0, 0, 40, 50, 0xb02040).setOrigin(0.5, 1),
      this.add.circle(-18, -20, 12, 0xb02040)
    ]);

    // Banane
    this.banana = this.add.container(centerX - 150, groundY - 120);
    this.banana.add([
      this.add.circle(0, 0, 40, 0xffffaa, 0.4),
      this.add.arc(0, 0, 20, 200, 340, false).setStrokeStyle(8, 0xf7d64a)
    ]);
    this.banana.setAlpha(0);

    // Barre de chargement
    const barWidth = 400;
    const barY = groundY + 50;

    this.add.rectangle(centerX, barY, barWidth, 16, 0x000000, 0.4).setOrigin(0.5);
    this.loadingFill = this.add.rectangle(centerX - barWidth / 2, barY, 0, 12, 0xf7d64a).setOrigin(0, 0.5);

    // Sons
    this.load.audio('boardMusic', 'assets/board_music.mp3');
    this.load.audio('diceSound', 'assets/dice.wav');
    this.load.audio('bonusSound', 'assets/bonus.wav');
    this.load.audio('malusSound', 'assets/malus.wav');

    this.animateCharacters();

    this.progress = 0;
    this.time.addEvent({
      delay: 200,
      repeat: 25,
      callback: () => this.updateLoading()
    });
  }

  animateCharacters() {
    this.tweens.add({
      targets: this.bonobo,
      y: this.bonobo.y - 6,
      duration: 200,
      yoyo: true,
      repeat: -1
    });

    this.tweens.add({
      targets: this.moufle,
      y: this.moufle.y - 10,
      duration: 300,
      yoyo: true,
      repeat: -1
    });
  }

  updateLoading() {
    this.progress += 4;
    if (this.progress > 100) this.progress = 100;

    const barWidth = 400;
    this.loadingFill.width = (this.progress / 100) * barWidth;

    if (this.progress === 60) {
      this.tweens.add({
        targets: this.banana,
        alpha: 1,
        y: this.banana.y + 10,
        duration: 600,
        ease: 'Sine.easeOut'
      });
    }

    if (this.progress === 80) {
      this.tweens.add({
        targets: this.bonobo,
        scale: 1.05,
        duration: 300,
        yoyo: true,
        repeat: 1
      });
      this.addParticlesAroundBonobo();
    }

    if (this.progress === 95) {
      this.tweens.add({
        targets: this.moufle,
        x: this.cameras.main.width + 200,
        y: this.moufle.y - 150,
        angle: 360,
        duration: 500,
        ease: 'Cubic.easeIn',
        onComplete: () => this.moufle.setVisible(false)
      });
    }

    if (this.progress === 100) {
      this.time.delayedCall(700, () => {
        this.scene.start('MenuScene');
      });
    }
  }

  addParticlesAroundBonobo() {
    const particles = this.add.particles(0xffffaa);
    particles.createEmitter({
      x: this.bonobo.x,
      y: this.bonobo.y - 40,
      speed: { min: -40, max: 40 },
      angle: { min: 0, max: 360 },
      lifespan: 600,
      quantity: 4,
      scale: { start: 0.4, end: 0 },
      blendMode: 'ADD'
    });

    this.time.delayedCall(700, () => particles.destroy());
  }
}

