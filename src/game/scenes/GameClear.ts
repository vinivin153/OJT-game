import { Scene } from 'phaser';

export class GameClear extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  private clearTime: number;

  constructor() {
    super('GameClear');
  }

  init(data: { clearTime: number }) {
    this.clearTime = data.clearTime;
  }

  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x1d212d);

    const centerX = this.camera.width / 2;
    const centerY = this.camera.height / 2;

    const attempts = this.registry.get('attempts');
    const time = Math.floor(this.clearTime);

    this.add
      .text(centerX, centerY - 80, 'STAGE CLEAR!', {
        fontFamily: '"Press Start 2P"',
        fontSize: '24px',
        color: '#ffdd00',
        align: 'center',
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, centerY - 10, 'WORLD 1-1', {
        fontFamily: '"Press Start 2P"',
        align: 'center',
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, centerY + 30, `TIME ${time}s`, {
        fontFamily: '"Press Start 2P"',
        align: 'center',
      })
      .setOrigin(0.5);

    // 작은 플레이어 아이콘과 시도 횟수 표시
    this.add.sprite(centerX - 40, centerY + 80, 'player').setOrigin(0.5);

    this.add
      .text(centerX + 30, centerY + 84, `x ${attempts}`, {
        fontFamily: '"Press Start 2P"',
        fontSize: '16px',
        align: 'center',
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, this.camera.height - 40, '👆 Go to Main Screen', {
        fontFamily: '"Press Start 2P"',
        fontSize: '12px',
        align: 'center',
      })
      .setOrigin(0.5);

    this.input.once('pointerdown', () => {
      this.scene.start('MainMenu');
      this.registry.set('attempts', 1);
      this.registry.set('startTime', 0);
    });
  }
}
