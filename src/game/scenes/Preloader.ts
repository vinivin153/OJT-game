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
    this.load.image('tileset', 'tileset.png');

    this.load.spritesheet('player', 'horse.png', {
      frameWidth: 80,
      frameHeight: 64,
    });

    this.load.spritesheet('player-jump', 'horse_jump.png', {
      frameWidth: 80,
      frameHeight: 82,
    });
  }

  create() {
    this.scene.start('MainMenu');
  }
}
