import { Scene } from 'phaser';

export class Preloader extends Scene {
  constructor() {
    super('Preloader');
  }

  init() {}

  preload() {
    this.load.setPath('assets');

    this.load.image('menu-bg', 'menu_bg.png');
    this.load.image('world-bg', 'world_bg.png');

    this.load.tilemapTiledJSON('world', 'world.json');
    this.load.spritesheet('tileset', 'tileset.png', {
      frameWidth: 16,
      frameHeight: 16,
      spacing: 1,
      margin: 1,
    });
    this.load.spritesheet('tileset2', 'tileset2.png', {
      frameWidth: 24,
      frameHeight: 24,
    });

    this.load.spritesheet('player', 'horse.png', {
      frameWidth: 80,
      frameHeight: 64,
    });

    this.load.spritesheet('player-jump', 'horse_jump.png', {
      frameWidth: 80,
      frameHeight: 82,
    });

    this.load.svg('gear', 'gear.svg', {
      width: 64,
      height: 64,
    });
  }

  create() {
    this.scene.start('MainMenu');
  }
}
