import { Scene } from 'phaser';

export class GameOver extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  private deadTime: number;

  constructor() {
    super('GameOver');
  }

  init(data: { deadTime: number }) {
    this.deadTime = data.deadTime;
  }

  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x000000);

    const centerX = this.camera.width / 2;
    const centerY = this.camera.height / 2;

    const attempts = this.registry.get('attempts');
    const time = Math.floor(this.deadTime);

    this.add
      .text(centerX, centerY - 40, 'WORLD', {
        fontFamily: '"Press Start 2P"',
        align: 'center',
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, centerY - 16, '1-1', {
        fontFamily: '"Press Start 2P"',
        align: 'center',
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, centerY + 18, `TIME ${time}s`, {
        fontFamily: '"Press Start 2P"',
        align: 'center',
      })
      .setOrigin(0.5);

    this.add.sprite(centerX - 30, centerY + 62, 'player').setOrigin(0.5);

    this.add
      .text(centerX + 30, centerY + 72, `x ${attempts}`, { fontFamily: '"Press Start 2P"', fontSize: '16px' })
      .setOrigin(0.5);

    this.input.once('pointerdown', () => {
      this.scene.start('Game');
    });
  }
}
