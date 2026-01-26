class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // --- Texte de chargement ---
    this.add.text(width / 2, height / 2 - 200, 'Chargement...', {
      fontSize: '32px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // --- Barre de chargement ---
    const barBg = this.add.rectangle(width / 2, height / 2, 400, 20, 0x333333);
    const barFill = this.add.rectangle(width / 2 - 200, height / 2, 0, 20, 0x88ff88).setOrigin(0, 0.5);

    this.load.on('progress', p => {
      barFill.width = 400 * p;
    });

    // ---------------------------------------------------------
    // 🌴 ASSETS DU PLATEAU (style cartoon jungle)
    // ---------------------------------------------------------

    // Fond jungle
    this.load.image('bg_jungle', 'assets/bg_jungle.png');

    // Plateau
    this.load.image('board_path', 'assets/board_path.png');

    // Cases
    this.load.image('tile_normal', 'assets/tile_normal.png');
    this.load.image('tile_bonus', 'assets/tile_bonus.png');
    this.load.image('tile_malus', 'assets/tile_malus.png');
    this.load.image('tile_item', 'assets/tile_item.png');

    // Joueurs (spritesheets)
    this.load.spritesheet('bonobo_idle', 'assets/bonobo_idle.png', {
      frameWidth: 64,
      frameHeight: 64
    });

    this.load.spritesheet('bonobo_walk', 'assets/bonobo_walk.png', {
      frameWidth: 64,
      frameHeight: 64
    });

    // Objets
    this.load.image('item_banana', 'assets/item_banana.png');
    this.load.image('item_shield', 'assets/item_shield.png');
    this.load.image('item_golden_dice', 'assets/item_golden_dice.png');

    // UI
    this.load.image('ui_button', 'assets/ui_button.png');
    this.load.image('ui_panel', 'assets/ui_panel.png');

    // Sons
    this.load.audio('boardMusic', 'assets/board_music.mp3');
    this.load.audio('diceSound', 'assets/dice.wav');
    this.load.audio('bonusSound', 'assets/bonus.wav');
    this.load.audio('malusSound', 'assets/malus.wav');
    
    // ---------------------------------------------------------
    // ASSETS LEADERBOARD
    // ---------------------------------------------------------

    this.load.image('podium', 'assets/podium.png');
    this.load.image('confetti', 'assets/confetti.png');
    this.load.audio('victoryMusic', 'assets/victory_music.mp3');


    // ---------------------------------------------------------
    // 🏃 ASSETS DU MINI-JEU (Course aux Noix)
    // ---------------------------------------------------------

    // Fond du mini-jeu
    this.load.image('mg_bg_jungle', 'assets/mg_bg_jungle.png');

    // Ligne d'arrivée
    this.load.image('mg_finish', 'assets/mg_finish.png');

    // Obstacles
    this.load.image('mg_rock', 'assets/mg_rock.png');
    this.load.image('mg_trunk', 'assets/mg_trunk.png');

    // Bonus du mini-jeu
    this.load.image('mg_banana', 'assets/mg_banana.png');

    // Joueur (mini-jeu) — animations séparées si tu veux un style différent
    this.load.spritesheet('mg_bonobo_run', 'assets/mg_bonobo_run.png', {
      frameWidth: 64,
      frameHeight: 64
    });

    // Sons mini-jeu
    this.load.audio('mg_hit', 'assets/mg_hit.wav');
    this.load.audio('mg_boost', 'assets/mg_boost.wav');
  }

  create() {
    // ---------------------------------------------------------
    // 🎞️ ANIMATIONS DU BONOBO (plateau)
    // ---------------------------------------------------------

    this.anims.create({
      key: 'bonobo_idle_anim',
      frames: this.anims.generateFrameNumbers('bonobo_idle', { start: 0, end: 3 }),
      frameRate: 4,
      repeat: -1
    });

    this.anims.create({
      key: 'bonobo_walk_anim',
      frames: this.anims.generateFrameNumbers('bonobo_walk', { start: 0, end: 7 }),
      frameRate: 10,
      repeat: -1
    });

    // ---------------------------------------------------------
    // 🎞️ ANIMATIONS DU BONOBO (mini-jeu)
    // ---------------------------------------------------------

    this.anims.create({
      key: 'mg_bonobo_run_anim',
      frames: this.anims.generateFrameNumbers('mg_bonobo_run', { start: 0, end: 7 }),
      frameRate: 12,
      repeat: -1
    });

    // ---------------------------------------------------------
    // Fin du chargement → Menu
    // ---------------------------------------------------------
    this.scene.start('MenuScene');
  }
}
