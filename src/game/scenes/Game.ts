import { Scene } from 'phaser';
import { playerControllerType } from '../../types';

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  player: Phaser.Physics.Matter.Sprite;
  map: Phaser.Tilemaps.Tilemap;
  tileset: Phaser.Tilemaps.Tileset;
  playerController: playerControllerType;
  isPlayerOnGround = false;
  playerStatus = 'idle';
  smoothedControls: SmoothedHorizontalControl;

  constructor() {
    super('Game');
  }

  create() {
    this.background = this.add.image(0, 0, 'world-bg').setOrigin(0, 0);
    this.createMap();
    this.createPlayer();
    this.setupCamera();
    this.setupCollisions();
    this.setupInput();
  }

  /** 입력 설정 */
  setupInput() {
    this.smoothedControls = new SmoothedHorizontalControl(0.001);
  }

  /** 캐릭터 생성 */
  createPlayer() {
    // 애니메이션 생성
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

    // 플레이어 바디 설정
    const M = (Phaser.Physics.Matter as any).Matter;
    const w = 60;
    const h = 30;

    const sx = w / 2;
    const sy = h;

    // 플레이어 메인 바디
    const playerBody = M.Bodies.rectangle(sx, sy, w * 0.6, h, {
      chamfer: { radius: 10 },
      label: 'player',
    });

    // 바닥 감지 센서 - 위치와 크기 조정
    const bottomSensor = M.Bodies.rectangle(sx, sy + h / 2 + 2, w * 0.5, 6, {
      isSensor: true,
      label: 'bottomSensor',
    });

    // 복합 바디 생성
    const compoundBody = M.Body.create({
      parts: [playerBody, bottomSensor],
      restitution: 0.05,
    });

    // 플레이어 스프라이트 생성
    this.player = this.matter.add.sprite(100, 400, 'player');
    this.player.setDisplaySize(64, 48);
    this.player.setExistingBody(compoundBody);
    this.player.setFixedRotation();
    this.player.setPosition(100, 400);

    // 플레이어 컨트롤러 초기화
    this.playerController = {
      matterSprite: this.player,
      blocked: {
        left: false,
        right: false,
        bottom: false,
      },
      numTouching: {
        left: 0,
        right: 0,
        bottom: 0,
      },
      sensors: {
        bottom: bottomSensor,
        left: null,
        right: null,
      },
      time: {
        leftDown: 0,
        rightDown: 0,
      },
      lastJumpedAt: 0,
      speed: {
        run: 3,
        jump: 5,
      },
    };
  }

  /** 맵 생성 */
  createMap() {
    this.map = this.make.tilemap({ key: 'world' });
    if (!this.map) {
      console.error('타일맵을 로드할 수 없습니다');
      return;
    }

    const tileset = this.map.addTilesetImage('tileset');
    if (!tileset) {
      console.error('타일셋을 로드할 수 없습니다');
      return;
    }
    this.tileset = tileset;
    this.createGroundObjects();
    this.createCloudObjects();
  }

  /** ground object 생성 */
  createGroundObjects() {
    const groundLayer = this.map.createLayer('ground', this.tileset, 0, 0);
    if (!groundLayer) {
      console.error('ground 레이어를 생성할 수 없습니다');
      return;
    }
    // ground Layer 충돌 설정
    groundLayer.setCollisionByExclusion([-1]);

    // Matter.js 물리 바디로 변환
    this.matter.world.convertTilemapLayer(groundLayer, {
      label: 'ground',
      friction: 0.001,
      frictionAir: 0.01,
    });

    // 월드 경계 설정
    this.matter.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels, 64, true, true, true, false);
  }

  /** cloud object 생성 */
  createCloudObjects() {
    const cloudLayer = this.map.createLayer('cloud', this.tileset, 0, 0);
    if (!cloudLayer) {
      console.error('cloud 레이어를 생성할 수 없습니다');
      return;
    }
    // cloud Layer 충돌 설정
    cloudLayer.setCollisionByExclusion([-1]);

    // Matter.js 물리 바디로 변환
    this.matter.world.convertTilemapLayer(cloudLayer, {
      label: 'cloud',
      friction: 0.001,
      frictionAir: 0.01,
    });
  }

  /** 카메라 설정 */
  setupCamera() {
    this.camera = this.cameras.main;
    this.camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.camera.startFollow(this.player, true);
  }

  /** 충돌 설정 */
  setupCollisions() {
    this.matter.world.on('collisionstart', (event: Phaser.Physics.Matter.Events.CollisionStartEvent) => {
      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        // cloud와 player의 충돌 감지
        if (
          (bodyA.label === 'cloud' && bodyB.label === 'player') ||
          (bodyB.label === 'cloud' && bodyA.label === 'player')
        ) {
          const cloudBody = bodyA.label === 'cloud' ? bodyA : bodyB;
          const cloudTileWrapper = cloudBody.gameObject;
          const cloudTile = (cloudTileWrapper as any)?.tile;

          if (cloudTile.properties.isBeingDestroyed) {
            return;
          }
          cloudTile.properties.isBeingDestroyed = true;

          this.tweens.add({
            targets: cloudTile,
            alpha: { value: 0, duration: 500, ease: 'Power1' },
            onComplete: () => {
              this.destroyTile(cloudTile);
            },
          });

          this.playerController.numTouching.bottom += 1;
          this.isPlayerOnGround = true;
        }

        if (
          (bodyA.label === 'bottomSensor' && bodyB.label === 'ground') ||
          (bodyB.label === 'bottomSensor' && bodyA.label === 'ground')
        ) {
          // 바닥 센서와 ground 타일의 충돌 감지
          this.playerController.numTouching.bottom += 1;
          this.isPlayerOnGround = true;
        }
      });
    });

    // 충돌 종료 시 바닥 접촉 해제
    this.matter.world.on('collisionend', (event: Phaser.Physics.Matter.Events.CollisionEndEvent) => {
      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        if (
          (bodyA.label === 'bottomSensor' && bodyB.label === 'ground') ||
          (bodyB.label === 'bottomSensor' && bodyA.label === 'ground') ||
          (bodyA.label === 'bottomSensor' && bodyB.label === 'cloud') ||
          (bodyB.label === 'bottomSensor' && bodyA.label === 'cloud') ||
          (bodyA.label === 'bottomSensor' && bodyB.label === 'rectangle') ||
          (bodyB.label === 'bottomSensor' && bodyA.label === 'rectangle')
        ) {
          this.playerController.numTouching.bottom -= 1;
          this.isPlayerOnGround = this.playerController.numTouching.bottom > 0;
        }
      });
    });

    // 게임 오버 조건 (맵 밖으로 떨어짐)
    this.matter.world.on('afterupdate', () => {
      if (this.player.y > this.map.heightInPixels + 100) {
        this.handleGameOver();
      }
    });
  }

  /** 타일 제거 */
  destroyTile(tile: Phaser.Tilemaps.Tile) {
    const layer = tile.tilemapLayer;
    layer!.removeTileAt(tile.x, tile.y);
    const physics = tile.physics as { matterBody?: Phaser.Physics.Matter.TileBody };
    physics.matterBody?.destroy();
  }

  /** 플레이어 이동 처리 */
  handlePlayerMovement() {
    const cursors = this.input.keyboard!.createCursorKeys();

    let oldVelocityX;
    let targetVelocityX;
    let newVelocityX;

    if (!this.player.body) {
      console.error('플레이어가 존재하지 않습니다');
      return;
    }

    // 수평 이동
    if (cursors.left.isDown) {
      this.smoothedControls.moveLeft(this.game.loop.delta, this.playerController);
      this.player.anims.play('move-left', true);

      oldVelocityX = this.player.body.velocity.x;
      targetVelocityX = -this.playerController.speed.run;
      newVelocityX = Phaser.Math.Linear(oldVelocityX, targetVelocityX, -this.smoothedControls.value);

      this.player.setVelocityX(newVelocityX);
      this.playerStatus = 'left';
    } else if (cursors.right.isDown) {
      this.smoothedControls.moveRight(this.game.loop.delta, this.playerController);
      this.player.anims.play('move-right', true);

      oldVelocityX = this.player.body.velocity.x;
      targetVelocityX = this.playerController.speed.run;
      newVelocityX = Phaser.Math.Linear(oldVelocityX, targetVelocityX, this.smoothedControls.value);

      this.player.setVelocityX(newVelocityX);
      this.playerStatus = 'right';
    } else {
      this.smoothedControls.reset();
      // 정지 애니메이션
      if (this.playerStatus === 'left') {
        this.player.anims.play('idle-left', true);
      } else {
        this.player.anims.play('idle-right', true);
      }
    }

    // 점프 (바닥에 있을 때만)
    const canJump = this.time.now - this.playerController.lastJumpedAt > 250;
    if (cursors.space.isDown && this.isPlayerOnGround) {
      this.player.anims.play('idle-right', true);
      if (canJump) {
        // 점프 딜레이
        this.player.setVelocityY(-this.playerController.speed.jump);
        this.playerController.lastJumpedAt = this.time.now;
      }
    }
    // 공중에 있는 경우 점프 애니메이션
    else if (!this.isPlayerOnGround) {
      if (this.playerStatus === 'left') {
        this.player.anims.play('jump-left', true);
      } else {
        this.player.anims.play('jump-right', true);
      }
    }

    // 디버깅용 - 플레이어 상태 출력
    if (this.time.now % 1000 < 16) {
      // 대략 1초마다
      console.log(
        'Player Y:',
        this.player.y,
        'On Ground:',
        this.isPlayerOnGround,
        'Touching Bottom:',
        this.playerController.numTouching.bottom
      );
    }
  }

  /** 게임 오버 처리 */
  handleGameOver() {
    console.log('Game Over!');
    // 게임 오버 로직 추가 (씬 재시작, 메뉴로 이동 등)
    this.camera.fade(1000, 0, 0, 0);
    this.camera.shake(500, 0.005);
    this.camera.flash(900, 255, 0, 0);
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.camera.resetFX();
        this.scene.stop();
        this.scene.restart();
      },
    });
  }

  update() {
    this.handlePlayerMovement();
  }
}

class SmoothedHorizontalControl {
  speed: number;
  value: number;

  constructor(speed: number) {
    this.speed = speed;
    this.value = 0;
  }

  moveLeft(delta: number, playerController: playerControllerType) {
    if (this.value > 0) {
      this.reset();
    }
    this.value -= this.speed * delta;
    if (this.value < -1) {
      this.value = -1;
    }
    playerController.time.rightDown += delta;
  }

  moveRight(delta: number, playerController: playerControllerType) {
    if (this.value < 0) {
      this.reset();
    }
    this.value += this.speed * delta;
    if (this.value > 1) {
      this.value = 1;
    }
    playerController.time.leftDown += delta;
  }

  reset() {
    this.value = 0;
  }
}
