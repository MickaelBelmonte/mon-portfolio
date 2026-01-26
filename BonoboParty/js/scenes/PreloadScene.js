class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    // IMAGE A RAJOUTER
    // this.load.image('bonobo', 'js/assets/bonobo.png');
    // this.load.image('moufle', 'js/assets/moufle.png');
    // this.load.image('banana', 'js/assets/banana.png');

    this.createLoadingAnimation();
  }

  createLoadingAnimation() {
    const centerX = this.cameras.main.width / 2;
    const groundY = this.cameras.main.height - 80;

    this.add.text(centerX, 40, 'Chargement de la jungle...', {
      fontSize: '28px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // Sol
    const ground = this.add.rectangle(centerX, groundY + 40, 900, 80, 0x3b2a1a);
    ground.setStrokeStyle(2, 0x2a1b10);

    // Bonobo 
    this.bonobo = this.add.container(centerX - 150, groundY);
    const body = this.add.rectangle(0, 10, 40, 50, 0x5b3b24).setOrigin(0.5, 1);
    const head = this.add.circle(0, -30, 20, 0x5b3b24);
    const face = this.add.ellipse(0, -25, 28, 22, 0xc48a5a);
    const eyeL = this.add.circle(-8, -30, 5, 0xffffff);
    const eyeR = this.add.circle(8, -30, 5, 0xffffff);
    const pupilL = this.add.circle(-8, -30, 2, 0x000000);
    const pupilR = this.add.circle(8, -30, 2, 0x000000);
    const tail = this.add.arc(20, 0, 18, 180, 320, false, 0x5b3b24, 1).setLineWidth(4);

    this.bonobo.add([body, head, face, eyeL, eyeR, pupilL, pupilR, tail]);

    // Moufle
    this.moufle = this.add.container(centerX + 40, groundY);
    const moufleMain = this.add.rectangle(0, 0, 40, 50, 0xb02040, 1).setOrigin(0.5, 1);
    moufleMain.setRadius(20);
    const thumb = this.add.circle(-18, -20, 12, 0xb02040);
    this.moufle.add([moufleMain, thumb]);

    // Sainte Banane 
    this.banana = this.add.container(centerX - 150, groundY - 120);
    const glow = this.add.circle(0, 0, 40, 0xffffaa, 0.4);
    const bananaShape = this.add.arc(0, 0, 20, 200, 340, false, 0xf7d64a, 1).setLineWidth(8);
    this.banana.add([glow, bananaShape]);
    this.banana.setAlpha(0);

    // Barre de chargement
    const barWidth = 400;
    const barX = centerX - barWidth / 2;
    const barY = groundY + 50;
    this.add.rectangle(centerX, barY, barWidth, 16, 0x000000, 0.4).setOrigin(0.5);
    this.loadingFill = this.add.rectangle(barX, barY, 0, 12, 0xf7d64a).setOrigin(0, 0.5);

    // Animations
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

    // Progression simulée
    this.progress = 0;
    this.time.addEvent({
      delay: 200,
      repeat: 25,
      callback: () => this.updateLoading()
    });
  }

  updateLoading() {
    this.progress += 4;
    if (this.progress > 100) this.progress = 100;

    const barWidth = 400;
    this.loadingFill.width = (this.progress / 100) * barWidth;

    if (this.progress === 60) {
      // Apparition de la Sainte Banane
      this.tweens.add({
        targets: this.banana,
        alpha: 1,
        y: this.banana.y + 10,
        duration: 600,
        ease: 'Sine.easeOut'
      });
    }

    if (this.progress === 80) {
      // Bonobo devient brillant
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
      // Moufle éjectée
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
    const emitter = particles.createEmitter({
      x: this.bonobo.x,
      y: this.bonobo.y - 40,
      speed: { min: -40, max: 40 },
      angle: { min: 0, max: 360 },
      lifespan: 600,
      quantity: 4,
      scale: { start: 0.4, end: 0 },
      blendMode: 'ADD'
    });
    this.time.delayedCall(700, () => {
      particles.destroy();
    });
  }
}
