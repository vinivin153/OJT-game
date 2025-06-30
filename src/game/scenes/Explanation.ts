import { Scene } from 'phaser';

export class Explanation extends Scene {
  private parentSceneKey: string;
  private closeButton?: Phaser.GameObjects.Text;

  constructor() {
    super('Explanation');
  }

  // 이 씬을 호출한 부모 씬의 키(key)를 데이터로 받습니다.
  init(data: { from: string }) {
    this.parentSceneKey = data.from;
  }

  create() {
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    const centerY = height / 2;

    // 반투명 배경 오버레이
    this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0);

    // 메인 패널 - 마리오 스타일의 파이프 테두리
    const panel = this.add.graphics();

    // 외부 패널 (갈색)
    panel.fillStyle(0xc74c0c, 1);
    panel.fillRoundedRect(centerX - 220, centerY - 170, 440, 340, 20);

    // 내부 패널 (밝은 하늘색)
    panel.fillStyle(0x87ceeb, 1);
    panel.fillRoundedRect(centerX - 200, centerY - 150, 400, 300, 16);

    // 내부 그라데이션 효과
    panel.fillStyle(0xffffff, 0.3);
    panel.fillRoundedRect(centerX - 190, centerY - 140, 380, 80, 8);

    // 제목 - 마리오 스타일 폰트 효과
    const title = this.add
      .text(centerX, centerY - 110, '🍄 게임 설명 🍄', {
        fontSize: '28px',
        fontFamily: 'Arial Black, sans-serif',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: '#000000',
          blur: 0,
          fill: true,
        },
      })
      .setOrigin(0.5);

    // 부제목
    this.add
      .text(centerX, centerY - 75, '슈퍼 말이오🐴', {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#ff6b35',
        fontStyle: 'italic',
      })
      .setOrigin(0.5);

    // 구분선
    const line = this.add.graphics();
    line.lineStyle(2, 0x2d5016, 1);
    line.beginPath();
    line.moveTo(centerX - 150, centerY - 55);
    line.lineTo(centerX + 150, centerY - 55);
    line.strokePath();

    // 메인 설명 텍스트
    this.add
      .text(centerX, centerY - 25, '🏁 목표: 장애물을 피해 결승선까지 도달하세요!', {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#2d5016',
      })
      .setOrigin(0.5);

    // 조작법 섹션
    this.add
      .text(centerX, centerY + 20, '🎮 조작법', {
        fontSize: 18,
        fontFamily: 'Arial Black',
        color: '#ff6b35',
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setOrigin(0.5);

    // 조작키 안내 - 아이콘과 함께
    const controls = ['⬅️ ➡️ 이동', '🚀 SPACE 점프'];

    controls.forEach((control, index) => {
      this.add
        .text(centerX, centerY + 60 + index * 25, control, {
          fontSize: 16,
          fontFamily: 'Arial Black',
          color: '#2d5016',
          padding: { x: 2, y: 2 },
        })
        .setOrigin(0.5);
    });

    // 닫기 버튼 - 마리오 스타일
    this.closeButton = this.add
      .text(centerX, centerY + 125, '✨ 게임 시작! ✨', {
        fontSize: '18px',
        fontFamily: 'Arial Black',
        color: '#ffffff',
        backgroundColor: '#ff6b35',
        padding: { x: 20, y: 8 },
        stroke: '#000000',
        strokeThickness: 2,
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: '#000000',
          blur: 0,
          fill: true,
        },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // 버튼 호버 효과
    this.closeButton.on('pointerover', () => {
      this.closeButton?.setScale(1.1);
      this.closeButton?.setStyle({ backgroundColor: '#ff8c5a' });
    });

    this.closeButton.on('pointerout', () => {
      this.closeButton?.setScale(1.0);
      this.closeButton?.setStyle({ backgroundColor: '#ff6b35' });
    });

    // 닫기 버튼 클릭 시 부모 씬으로 돌아감
    this.closeButton.on('pointerdown', () => {
      this.scene.resume(this.parentSceneKey);
      this.scene.stop();
    });

    // 키보드 ESC로도 닫기 가능
    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.resume(this.parentSceneKey);
      this.scene.stop();
    });

    // 애니메이션 효과 - 패널이 위에서 떨어지는 효과
    panel.setAlpha(0);
    title.setAlpha(0);
    this.closeButton.setAlpha(0);

    this.tweens.add({
      targets: panel,
      alpha: 1,
      duration: 300,
      ease: 'Back.easeOut',
    });

    this.tweens.add({
      targets: title,
      alpha: 1,
      y: title.y,
      duration: 500,
      delay: 200,
      ease: 'Bounce.easeOut',
    });

    this.tweens.add({
      targets: this.closeButton,
      alpha: 1,
      duration: 300,
      delay: 400,
    });
  }
}
