import { Scene } from 'phaser';

export class OptionsModal extends Scene {
  private parentSceneKey: string;

  constructor() {
    super('OptionsModal');
  }

  init(data: { from: string }) {
    this.parentSceneKey = data.from;
  }

  create() {
    const { width, height } = this.cameras.main;

    const centerX = width / 2;
    const centerY = height / 2;

    this.add.rectangle(0, 0, width, height, 0x000000, 0.5).setOrigin(0);

    this.add
      .graphics()
      .fillStyle(0x222222, 1)
      .fillRoundedRect(centerX - 100, centerY - 75, 200, 150, 16);

    const helpButton = this.add
      .text(centerX, centerY - 25, '게임 설명', { fontSize: '18px' })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    helpButton.on('pointerdown', () => {
      this.scene.start('Explanation', { from: this.parentSceneKey });
    });

    const resumeButton = this.add
      .text(centerX, centerY + 25, '돌아가기', { fontSize: '18px' })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    resumeButton.on('pointerdown', () => {
      this.scene.resume(this.parentSceneKey);
      this.scene.stop();
    });
  }
}
