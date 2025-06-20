export type playerControllerType = {
  matterSprite: Phaser.Physics.Matter.Sprite;
  blocked: {
    left: boolean;
    right: boolean;
    bottom: boolean;
  };
  numTouching: {
    left: number;
    right: number;
    bottom: number;
  };
  sensors: {
    bottom: Phaser.Physics.Matter.Sprite | null;
    left: Phaser.Physics.Matter.Sprite | null;
    right: Phaser.Physics.Matter.Sprite | null;
  };
  time: {
    leftDown: number;
    rightDown: number;
  };
  lastJumpedAt: number;
  speed: {
    run: number;
    jump: number;
  };
};
