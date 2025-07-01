import { playerControllerType } from '../types';
import { SmoothedHorizontalControl } from '../utils/SmoothedHorizontalControl';

export class Player extends Phaser.Physics.Matter.Sprite {
  controller: playerControllerType;
  smoothedControls: SmoothedHorizontalControl;
  playerStatus = 'idle';
  isPlayerOnGround = false;
  isPlayerOnIce = false;

  private initialScaleX = 64 / 80;
  private initialScaleY = 48 / 64;
  private lastLookDirection = 'right';

  sounds: {
    jump: Phaser.Sound.BaseSound;
    stomp: Phaser.Sound.BaseSound;
    die: Phaser.Sound.BaseSound;
    pipe: Phaser.Sound.BaseSound;
  };

  constructor(secene: Phaser.Scene, x: number, y: number) {
    super(secene.matter.world, x, y, 'player', 0);
    this.scene = secene;
    this.createAnims();
    this.initSounds();

    const compoundBody = this.createCompoundBody();
    this.setScale(this.initialScaleX, this.initialScaleY);
    this.setExistingBody(compoundBody);
    this.setFixedRotation();
    this.setPosition(x, y);

    this.controller = this.initcontroller(compoundBody);
    this.smoothedControls = new SmoothedHorizontalControl(0.001);
  }

  /** 플레이어와 관련된 애니메이션 설정 */
  private createAnims() {
    this.anims.create({
      key: 'move-right',
      frames: this.anims.generateFrameNumbers('player', { start: 27, end: 34 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'move-left',
      frames: this.anims.generateFrameNumbers('player', { start: 72, end: 79 }),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'idle-right',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 8 }),
      frameRate: 9,
      repeat: -1,
    });
    this.anims.create({
      key: 'idle-left',
      frames: this.anims.generateFrameNumbers('player', { start: 45, end: 53 }),
      frameRate: 9,
      repeat: -1,
    });
    this.anims.create({
      key: 'jump-right',
      frames: this.anims.generateFrameNumbers('player-jump', { start: 0, end: 5 }),
      frameRate: 6,
      repeat: -1,
    });
    this.anims.create({
      key: 'jump-left',
      frames: this.anims.generateFrameNumbers('player-jump', { start: 16, end: 31 }),
      frameRate: 6,
      repeat: -1,
    });
  }

  /** 플레이어와 관련된 사운드 설정 */
  private initSounds() {
    this.sounds = {
      jump: this.scene.sound.add('jump', { volume: 0.5, rate: 1.5 }),
      die: this.scene.sound.add('die', { volume: 0.5, rate: 1.2 }),
      stomp: this.scene.sound.add('stomp', { volume: 0.5 }),
      pipe: this.scene.sound.add('pipe', { volume: 0.5 }),
    };
  }

  /** 플레이어의 compoundBody 생성 */
  private createCompoundBody(): MatterJS.BodyType {
    // 플레이어 바디 설정
    const M = (Phaser.Physics.Matter as any).Matter;
    const width = 60;
    const height = 30;

    const sx = width / 2;
    const sy = height;

    // 플레이어 메인 바디
    const playerBody = M.Bodies.rectangle(sx, sy, width * 0.6, height, {
      chamfer: { radius: 10 },
      label: 'player',
    });

    // 바닥 감지 센서
    const bottomSensor = M.Bodies.rectangle(sx, sy + height / 2 + 2, width * 0.4, 6, {
      isSensor: true,
      label: 'bottomSensor',
    });

    // 왼쪽 센서
    const leftSensor = M.Bodies.rectangle(sx - width / 2 + 8, sy, 6, height * 0.5, {
      isSensor: true,
      label: 'leftSensor',
    });

    // 오른쪽 센서
    const rightSensor = M.Bodies.rectangle(sx + width / 2 - 8, sy, 6, height * 0.5, {
      isSensor: true,
      label: 'rightSensor',
    });

    // 복합 바디 생성
    return M.Body.create({
      parts: [playerBody, bottomSensor, leftSensor, rightSensor],
      restitution: 0.05,
      friction: 0,
      frictionAir: 0,
    });
  }

  /** 플레이어 컨트롤러 설정 */
  private initcontroller(compoundBody: MatterJS.BodyType): playerControllerType {
    return {
      matterSprite: this,
      blocked: { left: false, right: false, bottom: false },
      numTouching: { left: 0, right: 0, bottom: 0 },
      sensors: {
        bottom: compoundBody.parts[2],
        left: compoundBody.parts[3],
        right: compoundBody.parts[4],
      },
      time: { leftDown: 0, rightDown: 0 },
      lastJumpedAt: 0,
      speed: { run: 3, jump: 5 },
    };
  }

  /** 플레이어가 적을 밟았을 때 동작 */
  public stomp() {
    this.sounds.stomp.play();
    this.setVelocityY(-this.controller.speed.jump * 0.6);
  }

  /** 파이프틑 타는 로직 */
  public enterPipe() {
    this.sounds.pipe.play();
    this.setStatic(true);
    this.setVelocity(0, 0);

    // 파이프로 들어가는 트윈 애니메이션
    this.scene.tweens.add({
      targets: this,
      scale: 0.3,
      duration: 300,
      ease: 'Power2.easeOut',
      onComplete: () => {
        this.scene.tweens.add({
          targets: this,
          y: this.y + 40,
          duration: 600,
          ease: 'Power2.easeIn',
          onComplete: () => {
            // 화면 페이드 아웃 후 위치 재설정 및 페이드 인
            this.scene.cameras.main.fadeOut(300, 0, 0, 0);

            this.scene.cameras.main.once('camerafadeoutcomplete', () => {
              this.setPosition(100, 800);
              this.setScale(this.initialScaleX, this.initialScaleY);
              this.setAlpha(1);
              this.setStatic(false);
              this.scene.cameras.main.fadeIn(300, 0, 0, 0);
            });
          },
        });
      },
    });
  }

  /** 플레이어의 움직임을 업데이트 */
  public movementUpdate(walkWaySpeed: number) {
    if (!this.body) {
      return;
    }

    const cursors = this.scene.input.keyboard!.createCursorKeys();
    const isMovingLeft = cursors.left.isDown;
    const isMovingRight = cursors.right.isDown;
    const delta = this.scene.game.loop.delta;

    // 가속도 처리
    if (isMovingLeft) {
      this.smoothedControls.moveLeft(delta, this.controller);
    } else if (isMovingRight) {
      this.smoothedControls.moveRight(delta, this.controller);
    } else {
      if (!this.isPlayerOnIce) {
        this.smoothedControls.reset();
      }
    }

    // 컨베이어 벨트에서 플레이어의 움직임 설정
    const currentVelocityX = this.body.velocity.x;
    let targetVelocityX = walkWaySpeed;
    let lerpFactor = this.smoothedControls.value;

    if (isMovingLeft) {
      this.lastLookDirection = 'left';
      targetVelocityX = -this.controller.speed.run + walkWaySpeed;
      lerpFactor = -this.smoothedControls.value;
    } else if (isMovingRight) {
      this.lastLookDirection = 'right';
      targetVelocityX = this.controller.speed.run + walkWaySpeed;
    } else {
      lerpFactor = this.isPlayerOnIce ? 0.001 : 0.3;
    }
    this.setVelocityX(Phaser.Math.Linear(currentVelocityX, targetVelocityX, lerpFactor));

    if (!this.isPlayerOnGround) {
      this.anims.play(this.lastLookDirection === 'left' ? 'jump-left' : 'jump-right', true);
    } else {
      if (isMovingLeft) {
        this.anims.play('move-left', true);
      } else if (isMovingRight) {
        this.anims.play('move-right', true);
      } else {
        // 미끄러지는 중에도 이동 애니메이션 재생
        if (Math.abs(this.body.velocity.x) > 0.1) {
          this.anims.play(this.lastLookDirection === 'left' ? 'move-left' : 'move-right', true);
        } else {
          this.anims.play(this.lastLookDirection === 'left' ? 'idle-left' : 'idle-right', true);
        }
      }
    }

    // 점프 로직
    const canJump = this.scene.time.now - this.controller.lastJumpedAt > 250;
    if (cursors.space.isDown && this.isPlayerOnGround && canJump) {
      this.sounds.jump.play();
      this.setVelocityY(-this.controller.speed.jump);
      this.controller.lastJumpedAt = this.scene.time.now;
    }
  }
}
