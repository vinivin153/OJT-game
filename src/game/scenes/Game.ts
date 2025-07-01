import { Scene } from 'phaser';
import { Player } from '../Player';

export class Game extends Scene {
  player: Player;

  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  enemy: Phaser.Physics.Matter.Sprite | null;
  exit: Phaser.Physics.Matter.Sprite | null;
  map: Phaser.Tilemaps.Tilemap;
  tileset: Phaser.Tilemaps.Tileset;
  walkWaySpeed = 0;
  isGameOver = false;

  initialScaleX = 64 / 80; // 플레이어 스프라이트의 초기 너비 비율
  initialScaleY = 48 / 64; // 플레이어 스프라이트의 초기 높이 비율

  private sounds: {
    jump: Phaser.Sound.BaseSound;
    die: Phaser.Sound.BaseSound;
    stomp: Phaser.Sound.BaseSound;
    clear: Phaser.Sound.BaseSound;
    pipe: Phaser.Sound.BaseSound;
  };

  constructor() {
    super('Game');
  }

  create() {
    this.isGameOver = false;

    this.background = this.add.image(0, 0, 'world-bg').setOrigin(0, 0);
    this.createMap();
    this.createOptionButton();
    this.player = new Player(this, 100, 900);
    this.add.existing(this.player);
    this.setupCamera();
    this.setupCollisions();
    this.setupBGM();
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
    this.createIceGroundObjects();
    this.createFakeLayer();
    this.createCloudObjects();
    this.createWalkWayObjects();
    this.createTrapObjects();
    this.createEnimies();
    this.createLiftObjects();
    this.createPipeLayer();
    this.createExitObject();
    this.createJumpPadObject();
  }

  /** 옵션 버튼 생성 */
  createOptionButton() {
    const optionsButton = this.add
      .image(this.cameras.main.width - 30, 30, 'gear')
      .setScale(0.5)
      .setInteractive({ useHandCursor: true });
    optionsButton.setScrollFactor(0);

    const labelBackground = this.add.graphics();
    labelBackground.fillStyle(0x000000, 0.7);
    labelBackground.fillRoundedRect(this.cameras.main.width - 50, 46, 40, 18, 8);
    labelBackground.setScrollFactor(0);

    const labelText = this.add.text(this.cameras.main.width - 30, 56, '옵션', {
      fontSize: 12,
      fontFamily: 'Arial Black',
    });
    labelText.setOrigin(0.5);
    labelText.setScrollFactor(0);

    optionsButton.on('pointerover', () => {
      this.tweens.add({
        targets: optionsButton,
        scaleX: 0.55,
        scaleY: 0.55,
        duration: 150,
        ease: 'Back.easeOut',
      });
    });

    optionsButton.on('pointerout', () => {
      this.tweens.add({
        targets: optionsButton,
        scaleX: 0.5,
        scaleY: 0.5,
        y: 30,
        duration: 150,
        ease: 'Back.easeOut',
      });
    });

    optionsButton.on('pointerdown', () => {
      this.scene.pause();
      this.scene.launch('OptionsModal', { from: 'Game' });
    });
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
      friction: 0.1,
      frictionAir: 0.001,
      static: true,
    });

    // 월드 경계 설정
    this.matter.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels, 64, true, true, true, false);
  }

  /** ice ground object 생성 */
  createIceGroundObjects() {
    const iceGroundLayer = this.map.createLayer('ice_ground', this.tileset, 0, 0);

    if (!iceGroundLayer) {
      console.error('ice_ground 레이어를 생성할 수 없습니다');
      return;
    }

    // ice_ground Layer 충돌 설정
    iceGroundLayer.setCollisionByExclusion([-1]);

    // Matter.js 물리 바디로 변환
    this.matter.world.convertTilemapLayer(iceGroundLayer, {
      label: 'iceGround',
      friction: 0,
      frictionAir: 0,
      static: true,
    });
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

  /** walkway object 생성 */
  createWalkWayObjects() {
    const walkWayLeftLayer = this.map.createLayer('walkway_left', this.tileset, 0, 0);
    const walkWayRightLayer = this.map.createLayer('walkway_right', this.tileset, 0, 0);

    if (!walkWayLeftLayer || !walkWayRightLayer) {
      console.error('walkway 레이어를 생성할 수 없습니다');
      return;
    }

    // walkway Layer 충돌 설정
    walkWayLeftLayer.setCollisionByExclusion([-1]);
    walkWayRightLayer.setCollisionByExclusion([-1]);

    // Matter.js 물리 바디로 변환
    this.matter.world.convertTilemapLayer(walkWayLeftLayer, {
      label: 'walkway_left',
      friction: 0.001,
      frictionAir: 0.001,
    });

    this.matter.world.convertTilemapLayer(walkWayRightLayer, {
      label: 'walkway_right',
      friction: 0.001,
      frictionAir: 0.001,
    });
  }

  /** trap object 생성 */
  createTrapObjects() {
    const trapLayer = this.map.getObjectLayer('trap');

    if (!trapLayer) {
      console.error('trap 오브젝트 레이어를 찾을 수 없습니다.');
      return;
    }

    const getTiledProperty = (obj: Phaser.Types.Tilemaps.TiledObject, name: string) => {
      const prop = obj.properties?.find((p: { name: string }) => p.name === name);
      return prop ? prop.value : null;
    };

    // 레이어의 모든 오브젝트를 순회합니다.
    trapLayer.objects.forEach((trapObject) => {
      if (!trapObject.gid) return;

      const frameIndex = trapObject.gid - this.tileset.firstgid;
      const trapImage = this.matter.add.sprite(trapObject.x!, trapObject.y!, 'tileset', frameIndex, {
        label: 'trap',
        isStatic: true,
      });

      const riseHeight = getTiledProperty(trapObject, 'riseHeight') || 48;
      const riseTime = getTiledProperty(trapObject, 'riseTime') || 1000;
      const triggerType = getTiledProperty(trapObject, 'triggerType') || 'always';

      if (triggerType === 'always') {
        this.tweens.add({
          targets: trapImage,
          y: trapImage.y - riseHeight,
          duration: riseTime,
          ease: 'Sine.easeInOut',
          // yoyo: true -> 애니메이션이 끝나면 원래 상태로 되돌아옵니다. (상승 -> 하강)
          yoyo: true,
          repeat: -1,
        });
      }
    });
  }

  /** enimies object 생성 */
  createEnimies() {
    const enemyLayer = this.map.getObjectLayer('enimies');

    if (!enemyLayer) {
      console.error('enimies 오브젝트 레이어를 찾을 수 없습니다.');
      return;
    }

    this.anims.create({
      key: 'enemy-walk',
      frames: this.anims.generateFrameNumbers('tileset2', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
    });

    enemyLayer.objects.forEach((enemyObject) => {
      const patrolRange = 50;
      const speed = 1;

      const frameIndex = 0;
      const enemySprite = this.matter.add
        .sprite(enemyObject.x!, enemyObject.y!, 'tileset2', frameIndex, {
          label: 'enemy',
          isStatic: false,
          friction: 0.001,
          restitution: 0.1,

          shape: {
            type: 'rectangle',
            width: 24,
            height: 20,
          },
        })
        .setOrigin(0.5, 0.4)
        .setFixedRotation();

      enemySprite.setData('patrolOriginX', enemyObject.x!);
      enemySprite.setData('patrolRange', patrolRange);
      enemySprite.setData('speed', speed);
      enemySprite.setData('direction', -1);

      enemySprite.setVelocityX(-speed);
      enemySprite.anims.play('enemy-walk', true);

      this.enemy = enemySprite;
    });
  }

  /** lift object 설정 */
  createLiftObjects() {
    const liftLayer = this.map.getObjectLayer('lift');

    if (!liftLayer) {
      console.error('lift 오브젝트 레이어를 찾을 수 없습니다.');
      return;
    }

    liftLayer.objects.forEach((liftObject) => {
      if (!liftObject.gid) return;

      const frameIndex = liftObject.gid - this.tileset.firstgid;
      const liftImage = this.matter.add.sprite(liftObject.x!, liftObject.y!, 'tileset', frameIndex, {
        label: 'lift',
        isStatic: true,
      });

      const riseHeight = 176;
      const riseTime = 1500;
      // 리프트 애니메이션 설정
      this.tweens.add({
        targets: liftImage,
        y: liftImage.y - riseHeight,
        duration: riseTime,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
      });
    });
  }

  /** fake layer 생성 */
  createFakeLayer() {
    const fakeLayer = this.map.createLayer('fake', this.tileset, 0, 0);

    if (!fakeLayer) {
      console.error('fake 레이어를 생성할 수 없습니다');
      return;
    }

    // 각 fake 타일에 대해 센서 바디 수동 생성
    for (let y = 0; y < fakeLayer.layer.height; y++) {
      for (let x = 0; x < fakeLayer.layer.width; x++) {
        const tile = fakeLayer.getTileAt(x, y);
        if (tile && tile.index !== -1) {
          const worldX = tile.getCenterX();
          const worldY = tile.getCenterY();

          // 센서 바디 생성 (물리적 충돌 없음, 감지만)
          this.matter.add.rectangle(worldX, worldY, 24, 24, {
            isStatic: true,
            isSensor: true,
            label: 'fake',
          });
        }
      }
    }
  }

  /** pipe layer 생성 */
  createPipeLayer() {
    const pipeLayer = this.map.createLayer('pipe', this.tileset, 0, 0);

    if (!pipeLayer) {
      console.error('pipe 레이어를 생성할 수 없습니다');
      return;
    }

    // pipe Layer 충돌 설정
    pipeLayer.setCollisionByExclusion([-1]);

    // Matter.js 물리 바디로 변환
    this.matter.world.convertTilemapLayer(pipeLayer, {
      label: 'pipe',
      friction: 0.001,
      frictionAir: 0.001,
      static: true,
    });
    pipeLayer.setDepth(5);
  }

  /** exit object 생성 */
  createExitObject() {
    const exitObject = this.map.getObjectLayer('exit')?.objects[0];

    if (!exitObject) {
      console.error('exit 오브젝트를 찾을 수 없습니다.');
      return;
    }

    const frameIndex = exitObject.gid! - this.tileset.firstgid;

    const x = exitObject.x! + exitObject.width! / 2;
    const y = exitObject.y! - exitObject.height! / 2;

    const exitSprite = this.matter.add.sprite(x, y, 'tileset', frameIndex, {
      label: 'exit',
      isStatic: true,
    });

    this.exit = exitSprite;
  }

  /** 점프대 object 생성 */
  createJumpPadObject() {
    const jumpPadLayer = this.map.getObjectLayer('jump_pad');

    if (!jumpPadLayer) {
      console.error('jump_pad 오브젝트 레이어를 찾을 수 없습니다.');
      return;
    }

    jumpPadLayer.objects.forEach((jumpPadObject) => {
      if (!jumpPadObject.gid) return;

      const x = jumpPadObject.x! + jumpPadObject.width! / 2;
      const y = jumpPadObject.y! - jumpPadObject.height! / 2;

      const frameIndex = jumpPadObject.gid - this.tileset.firstgid;

      const jumpPad = this.matter.add
        .sprite(x, y, 'tileset', frameIndex, {
          label: 'jump_pad',
          isStatic: true,
        })
        .setOrigin(0.5, 0.5);

      if (jumpPadObject.properties) {
        jumpPadObject.properties.forEach((prop: { name: string; value: any }) => {
          jumpPad.setData(prop.name, prop.value);
        });
      }
    });
  }

  /** 카메라 설정 */
  setupCamera() {
    this.camera = this.cameras.main;
    this.camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.camera.startFollow(this.player, true, 0.1, 0.1);
  }

  /** bgm 설정 */
  setupBGM() {
    const bgm = this.sound.add('bgm', { loop: true, volume: 0.5 });
    this.sounds = {
      jump: this.sound.add('jump', { volume: 0.5, rate: 1.5 }),
      die: this.sound.add('die', { volume: 0.5, rate: 1.2 }),
      stomp: this.sound.add('stomp', { volume: 0.5 }),
      clear: this.sound.add('clear', { volume: 0.5 }),
      pipe: this.sound.add('pipe', { volume: 0.5 }),
    };

    bgm.play();

    this.events.on('shutdown', () => {
      bgm.stop();
    });
  }

  /** 충돌 설정 */
  setupCollisions() {
    this.matter.world.on('beforeupdate', () => {
      this.player.controller.numTouching.bottom = 0;
      this.player.controller.numTouching.left = 0;
      this.player.controller.numTouching.right = 0;
      this.player.isPlayerOnIce = false;
      this.walkWaySpeed = 0;
    });

    this.matter.world.on('collisionactive', (event: Phaser.Physics.Matter.Events.CollisionActiveEvent) => {
      const walkWaySpeed = 1.8;

      for (const pair of event.pairs) {
        const { bodyA, bodyB } = pair;

        const isStaticBody = (body: MatterJS.BodyType) => !body.isSensor && body.isStatic;
        if (bodyA.label === 'leftSensor' && isStaticBody(bodyB)) {
          this.player.controller.numTouching.left += 1;
        } else if (bodyB.label === 'leftSensor' && isStaticBody(bodyA)) {
          this.player.controller.numTouching.left += 1;
        }

        if (bodyA.label === 'rightSensor' && isStaticBody(bodyB)) {
          this.player.controller.numTouching.right += 1;
        } else if (bodyB.label === 'rightSensor' && isStaticBody(bodyA)) {
          this.player.controller.numTouching.right += 1;
        }

        // --- 바닥 감지 및 컨베이어 벨트 로직 통합 ---
        let groundCandidate: MatterJS.BodyType | undefined;

        // 1. bottomSensor와의 충돌인지 확인하고, 상대방을 groundCandidate로 지정
        if (bodyA.label === 'bottomSensor') {
          groundCandidate = bodyB;
        } else if (bodyB.label === 'bottomSensor') {
          groundCandidate = bodyA;
        } else {
          continue; // bottomSensor와 관련 없는 충돌은 이 로직에서 무시
        }

        // 2. 상대방이 바닥 역할을 하는 표면인지 확인
        const groundLabels = ['ground', 'iceGround', 'cloud', 'lift', 'pipe', 'exit', 'jump_pad'];
        const isGroundSurface =
          groundLabels.includes(groundCandidate.label) || groundCandidate.label.startsWith('walkway_');

        // 3. 충돌 방향이 수직인지 확인 (옆면 충돌 방지)
        const isVerticalCollision = Math.abs(pair.collision.normal.y) > 0.9;

        if (isGroundSurface && isVerticalCollision) {
          // 4. 바닥에 닿았으므로 카운터를 증가시킴
          this.player.controller.numTouching.bottom += 1;

          // 바닥이 얼음이라면, isPlayerOnIce 플래그를 true로 설정
          if (groundCandidate.label === 'iceGround') {
            this.player.isPlayerOnIce = true;
          }

          // 바닥이 파이프이고 여기서 키보드 아래방향 키를 누르면, 플레이어를 파이프 안으로 이동
          const downKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
          if (groundCandidate.label === 'pipe' && downKey?.isDown) {
            this.sounds.pipe.play();

            // 플레이어 입력 차단
            this.player.setStatic(true);
            this.player.setVelocity(0, 0);
            this.tweens.add({
              targets: this.player,
              scale: 0.3,
              duration: 300,
              ease: 'Power2.easeOut',
              onComplete: () => {
                this.tweens.add({
                  targets: this.player,
                  y: this.player.y + 40,
                  duration: 600,
                  ease: 'Power2.easeIn',
                  onComplete: () => {
                    this.cameras.main.fadeOut(300, 0, 0, 0);

                    this.cameras.main.once('camerafadeoutcomplete', () => {
                      this.player.setPosition(100, 800);
                      this.player.setScale(this.initialScaleX, this.initialScaleY);
                      this.player.setAlpha(1);
                      this.player.setStatic(false);
                      this.cameras.main.fadeIn(300, 0, 0, 0);
                    });
                  },
                });
              },
            });
          }

          // 5. 만약 그 바닥이 컨베이어 벨트라면, 추가로 힘을 적용!
          if (groundCandidate.label.startsWith('walkway_')) {
            // 힘을 적용할 대상은 플레이어의 전체 물리 바디인 'this.player.body' 입니다.
            if (groundCandidate.label === 'walkway_left') {
              this.walkWaySpeed = -walkWaySpeed;
            } else if (groundCandidate.label === 'walkway_right') {
              this.walkWaySpeed = walkWaySpeed;
            }
          }
        }
      }
    });

    // 3. 모든 물리 및 이벤트 처리가 끝난 후, 최종 상태를 결정합니다.
    this.matter.world.on('afterupdate', () => {
      this.player.isPlayerOnGround = this.player.controller.numTouching.bottom > 0;

      // 게임 오버 조건
      console.log('Player Y Position:', this.player.y);
      if (this.player.y > this.map.heightInPixels + 100) {
        this.handleGameOver();
      }
    });

    this.matter.world.on('collisionstart', (event: Phaser.Physics.Matter.Events.CollisionStartEvent) => {
      function hasLabel(
        pair: Phaser.Types.Physics.Matter.MatterCollisionPair,
        labelA: string,
        labelB: string
      ): boolean {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        return (bodyA.label === labelA && bodyB.label === labelB) || (bodyB.label === labelA && bodyA.label === labelB);
      }

      for (const pair of event.pairs) {
        const { bodyA, bodyB } = pair;

        if (hasLabel(pair, 'player', 'fake')) {
          this.showMessage('욕심쟁이!');
        }

        if (hasLabel(pair, 'player', 'iceGround')) {
          this.player.isPlayerOnIce = true;
        }

        // 플레이어가 구름을 밟았을 때
        if (hasLabel(pair, 'cloud', 'player')) {
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
        }

        // 플레이어가 트랩에 닿았을 때
        if (hasLabel(pair, 'trap', 'player')) {
          this.handleGameOver();
        }

        if (hasLabel(pair, 'jump_pad', 'bottomSensor')) {
          this.sounds.jump.play();

          const jumpPadBody = bodyA.label === 'jump_pad' ? bodyA : bodyB;
          const jumpPadGameObject = jumpPadBody.gameObject as Phaser.Physics.Matter.Sprite;
          const endPoint = new Phaser.Math.Vector2(
            jumpPadGameObject.getData('posX') || this.player.x,
            jumpPadGameObject.getData('posY') || this.player.y
          );

          this.player.setStatic(true);

          const startPoint = new Phaser.Math.Vector2(this.player.x, this.player.y);

          // 제어점: 시작점과 끝점의 중간 위쪽에 위치시켜 아치 모양을 만듦
          const controlPoint = new Phaser.Math.Vector2(
            startPoint.x + (endPoint.x - startPoint.x) / 2,
            Math.min(startPoint.y, endPoint.y) - 200 // 곡선의 높이 조절
          );

          // 2차 베지어 곡선 생성
          const curve = new Phaser.Curves.QuadraticBezier(startPoint, controlPoint, endPoint);

          // 0에서 1까지 변하는 값을 가진 더미 객체를 트윈
          const pathTween = { t: 0 };
          this.tweens.add({
            targets: pathTween,
            t: 1,
            duration: 1500,
            ease: 'Linear',
            onUpdate: () => {
              // pathTween.t 값(0~1)에 따라 곡선 위의 좌표를 가져옴
              const position = curve.getPoint(pathTween.t);
              // 플레이어 위치를 해당 좌표로 계속 업데이트
              this.player.setPosition(position.x, position.y);
            },
            onComplete: () => {
              this.player.setStatic(false);
            },
          });
        }

        // 플레이어가 exit을 밟았을 때
        if (hasLabel(pair, 'exit', 'bottomSensor')) {
          this.sounds.clear.play();
          this.exit!.setFrame(45);
          this.player.setVelocity(0, 0);
          this.cameras.main.fadeOut(300, 0, 0, 0);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            const clearTime = (this.time.now - this.registry.get('startTime')) / 1000;
            this.scene.start('GameClear', { clearTime });
          });
        }

        // 플레이어가 적과 충돌했을 때
        if (hasLabel(pair, 'enemy', 'leftSensor') || hasLabel(pair, 'enemy', 'rightSensor')) {
          this.handleGameOver();
        }
        // 플레이어가 적을 밟았을 때
        else if (hasLabel(pair, 'enemy', 'bottomSensor')) {
          const enemyBody = bodyA.label === 'enemy' ? bodyA : bodyB;
          const enemyGameObject = enemyBody.gameObject as Phaser.Physics.Matter.Sprite;
          {
            if (enemyBody && pair.collision.normal.y > 0.5) {
              this.sounds.stomp.play();
              this.player.setVelocityY(-this.player.controller.speed.jump * 0.6);
              enemyGameObject.setStatic(true);
              enemyGameObject.setSensor(true);
              enemyGameObject.anims.stop();
              enemyGameObject.setFrame(4);
              this.enemy = null;

              this.tweens.add({
                targets: enemyGameObject,
                alpha: 0,
                duration: 300,
                onComplete: () => {
                  enemyGameObject.destroy();
                },
              });
            }
          }
        }
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

  /** 적 이동 처리 */
  handleEnemyMovement() {
    if (!this.enemy) return;

    this.enemy.setVelocityX(this.enemy.getData('direction') * this.enemy.getData('speed'));
    const patrolOriginX = this.enemy.getData('patrolOriginX');
    const patrolRange = this.enemy.getData('patrolRange');
    const speed = this.enemy.getData('speed');
    const currentX = this.enemy.x;

    // 적이 지정된 범위를 벗어나면 방향을 반대로 바꿈
    if (currentX < Math.floor(patrolOriginX - patrolRange) || currentX > Math.floor(patrolOriginX + patrolRange)) {
      const newDirection = this.enemy.getData('direction') * -1;
      this.enemy.setData('direction', newDirection);
      this.enemy.setFlipX(newDirection === 1);
      this.enemy.setVelocityX(newDirection * speed);
    }
  }

  /** 게임 오버 처리 */
  handleGameOver() {
    if (this.isGameOver) return;

    this.sounds.die.play();
    this.isGameOver = true;
    this.registry.inc('attempts', 1);
    const deadTime = (this.time.now - this.registry.get('startTime')) / 1000;

    // 게임 오버 로직 추가 (씬 재시작, 메뉴로 이동 등)
    this.camera.fade(1000, 0, 0, 0);
    this.camera.shake(500, 0.005);
    this.camera.flash(900, 255, 0, 0);
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.scene.start('GameOver', { deadTime });
      },
    });
  }

  /** 메시지 표시 */
  showMessage(message: string) {
    const style = {
      fontFamily: 'Arial Black',
      fontSize: '24px',
      color: '#fbe3b3',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center',
    };

    const text = this.add
      .text(this.camera.centerX, this.camera.centerY - 100, message, style)
      .setOrigin(0.5)
      .setScrollFactor(0);
    text.setShadow(2, 4, '#000000', 0, true, true);

    this.time.delayedCall(2000, () => {
      text.destroy();
    });
  }

  update() {
    if (this.isGameOver) {
      if (this.player.body) {
        this.player.setVelocity(0, 0);
      }
      return;
    }

    this.player.movementUpdate(this.walkWaySpeed);
    console.log(this.player.controller.numTouching);
    this.handleEnemyMovement();
  }
}
