import { Scene, GameObjects } from 'phaser';

export class MainMenu extends Scene {
  constructor() {
    super('MainMenu');
  }

  create() {
    /**========== 배경 이미지 ==========*/
    const { width, height } = this.cameras.main;
    const bg = this.add.image(width / 2, height / 2, 'menu-bg');
    const scaleX = width / bg.width;
    const scaleY = height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale);

    /**========== 배너 로고 ========== */
    this.add.rectangle(240, 180, 180, 100, 0xde5819);
    this.add
      .text(240, 180, '슈퍼\n말이오.', {
        fontFamily: 'Arial Black',
        fontSize: '36px',
        color: '#fbe3b3',
        stroke: '#000000',
        strokeThickness: 4,
        align: 'left',
        letterSpacing: 3,
      })
      .setOrigin(0.5)
      .setShadow(2, 4, '#000000', 0, true, true);

    /**========== 게임 시작 버튼 ==========*/

    // 게임 시작 버튼 박스 생성
    const startButtonBox = this.add.graphics();
    const buttonWidth = 160;
    const buttonHeight = 50;

    /** 박스 스타일 설정 함수 */
    const setStartButtonBoxStyle = (graphics: GameObjects.Graphics, alpha: number = 0) => {
      graphics.clear();
      graphics.fillStyle(0xffffff, alpha);
      graphics.lineStyle(4, 0xffffff);
      graphics.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 12);
      graphics.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 12);
    };
    setStartButtonBoxStyle(startButtonBox);

    // 게임 시작 버튼 텍스트 생성
    const startButtonText = this.add
      .text(0, 0, '게임 시작', {
        fontFamily: 'Arial Black',
        fontSize: '20px',
        color: '#fbe3b3',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    // 버튼 컨테이너 생성
    const startButton = this.add.container(240, 360, [startButtonBox, startButtonText]);
    startButton.setSize(160, 50);

    // 버튼 마우스 이벤트 설정
    startButton
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.scene.start('Game');
      })
      .on('pointerover', () => {
        setStartButtonBoxStyle(startButtonBox, 0.2);
      })
      .on('pointerout', () => {
        setStartButtonBoxStyle(startButtonBox, 0);
      });

    // 임시
    this.scene.start('Game');
  }
}
