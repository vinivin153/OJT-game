import { Scene } from 'phaser';

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  player: Phaser.Physics.Arcade.Sprite;

  // 게임 오브젝트 그룹들
  groundGroup: Phaser.Physics.Arcade.StaticGroup;
  coinGroup: Phaser.Physics.Arcade.Group;
  brickGroup: Phaser.Physics.Arcade.StaticGroup;
  pipeGroup: Phaser.Physics.Arcade.StaticGroup;

  playerStatus: 'left' | 'right' | 'idle' = 'right';
  constructor() {
    super('Game');
  }

  create() {
    this.background = this.add.image(0, 0, 'world_bg').setOrigin(0, 0);
    this.createMap();
    this.createPlayer();
    this.setupCamera();
    this.setupCollisions();
  }

  /** 캐릭터 생성 */
  createPlayer() {
    this.anims.create({
      key: 'move-right',
      frames: this.anims.generateFrameNumbers('player', { start: 27, end: 34 }),
      repeat: -1,
    });

    this.anims.create({
      key: 'move-left',
      frames: this.anims.generateFrameNumbers('player', { start: 72, end: 79 }),
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
      frames: this.anims.generateFrameNumbers('player-jump', {
        start: 0,
        end: 15,
      }),
      repeat: -1,
    });

    this.anims.create({
      key: 'jump-left',
      frames: this.anims.generateFrameNumbers('player-jump', {
        start: 16,
        end: 31,
      }),
      repeat: -1,
    });

    this.player = this.physics.add.sprite(100, 350, 'player');
    this.player.setCollideWorldBounds(true);

    const hitboxWidth = 60;
    const hitboxHeight = 60;
    this.player.body!.setSize(hitboxWidth, hitboxHeight);
    const frameWidth = 80;
    const frameHeight = 64;
    const offsetX = (frameWidth - hitboxWidth) / 2;
    const offsetY = frameHeight - hitboxHeight;
    this.player.body!.setOffset(offsetX, offsetY);
  }

  /** 플레이어 이동 설정 */
  setupPlayerMovement() {
    const cursor = this.input.keyboard?.createCursorKeys();
    if (!cursor) return;

    const player = this.player;
    if (!player) return;

    const playerBody = player.body;
    if (!playerBody) return;

    const playerMoveSpeed = 150;

    // 공중에 있는 경우
    if (!playerBody.touching.down) return;

    // 플레이어가 왼쪽으로 이동할 때
    if (cursor.left.isDown && playerBody.touching.down) {
      console.log('left');
      player.setVelocityX(-playerMoveSpeed);
      player.anims.play('move-left', true);
      this.playerStatus = 'left';

      // 플레이어가 왼쪽으로 이동 중에 점프할 때
      if (cursor.space.isDown) {
        console.log('jump left!');
        player.setVelocityY(-200);
        player.anims.play('move-left', true);
      }
    }
    // 플레이어가 오른쪽으로 이동할 때
    else if (cursor.right.isDown && playerBody.touching.down) {
      console.log('right');
      player.setVelocityX(playerMoveSpeed);
      player.anims.play('move-right', true);
      this.playerStatus = 'right';

      if (cursor.space.isDown) {
        console.log('jump right');
        player.setVelocityY(-200);
        player.anims.play('move-right', true);
      }
    }
    // 플레이어가 점프할 때
    else if (cursor.space.isDown && playerBody.touching.down) {
      console.log('jump');
      player.setVelocityY(-200);
      if (this.playerStatus === 'right') {
        console.log('jump right');
        player.anims.play('move-right', true);
      } else if (this.playerStatus === 'left') {
        console.log('jump left');
        player.anims.play('jump-left', true);
      }
    }
    // 플레이어가 아무것도 하지 않을 때
    else {
      if (this.playerStatus === 'idle') return;
      console.log(this.playerStatus);
      player.setVelocityX(0);
      if (this.playerStatus === 'right') {
        player.anims.play('idle-right', true);
      } else if (this.playerStatus === 'left') {
        player.anims.play('idle-left', true);
      }
      //   this.playerStatus = 'idle';
    }
  }

  /** 맵 생성 */
  createMap() {
    const map = this.make.tilemap({ key: 'world' });
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    const tileset = map.addTilesetImage('tile', 'tile');
    console.log('tileset', tileset);

    // 물리 그룹들 생성
    this.groundGroup = this.physics.add.staticGroup();
    this.coinGroup = this.physics.add.group();
    this.brickGroup = this.physics.add.staticGroup();
    this.pipeGroup = this.physics.add.staticGroup();

    // object layer 가져오기 및 생성
    this.createGroundObjects(map);
    this.createCoinObjects(map);
    this.createBrickObjects(map);
    this.createPipeObjects(map);
  }

  /** 카메라 설정 */
  setupCamera() {
    this.camera = this.cameras.main;
    this.camera.setBounds(0, 0, 2048, 512);
    this.camera.startFollow(this.player, true);
    this.camera.setScroll(0, 0);
  }

  /** ground obejct 생성 */
  createGroundObjects(map: Phaser.Tilemaps.Tilemap) {
    const groundObjects = map.getObjectLayer('ground');
    if (groundObjects) {
      groundObjects.objects.forEach((obj: Phaser.Types.Tilemaps.TiledObject) => {
        const x = obj.x! + obj.width! / 2;
        const y = obj.y! - obj.height! / 2;
        const frame = obj.gid! - 1;
        this.groundGroup.create(x, y, 'tileset', frame);
      });
    }
  }

  /** coin ojbect 생성 */
  createCoinObjects(map: Phaser.Tilemaps.Tilemap) {
    const coinObjects = map.getObjectLayer('coins');
    if (coinObjects) {
      coinObjects.objects.forEach((obj: Phaser.Types.Tilemaps.TiledObject) => {
        const coin = this.physics.add.sprite(obj.x! + obj.width! / 2, obj.y! - obj.height! / 2, 'coin');

        coin.body.setAllowGravity(false);
        this.coinGroup.add(coin);
      });
    }
  }

  /** brick object 생성 */
  createBrickObjects(map: Phaser.Tilemaps.Tilemap) {
    const brickObjects = map.getObjectLayer('bricks');
    if (brickObjects) {
      brickObjects.objects.forEach((obj) => {
        this.brickGroup.create(obj.x! + obj.width! / 2, obj.y! - obj.height! / 2, 'world1', 1);
      });
    }
  }

  // pipe object 생성
  createPipeObjects(map: Phaser.Tilemaps.Tilemap) {
    const pipeObjects = map.getObjectLayer('pipes');
    if (pipeObjects) {
      pipeObjects.objects.forEach((obj) => {
        const pipe = this.physics.add.sprite(obj.x! + obj.width! / 2, obj.y! - obj.height! / 2, 'pipe');

        pipe.setImmovable(true);
        this.pipeGroup.add(pipe);
      });
    }
  }

  /** 충돌 설정 */
  setupCollisions() {
    this.physics.add.collider(this.player, this.groundGroup);
    this.physics.add.collider(this.player, this.brickGroup);
    this.physics.add.collider(this.player, this.pipeGroup);
    this.physics.add.overlap(this.player, this.coinGroup, undefined);
  }

  update() {
    this.setupPlayerMovement();
    // 게임 업데이트 로직
  }
}
