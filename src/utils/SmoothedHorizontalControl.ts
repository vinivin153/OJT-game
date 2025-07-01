import { playerControllerType } from '../types';

export class SmoothedHorizontalControl {
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

  dampen(delta: number) {
    // 오른쪽으로 움직이던 중이었다면 (value > 0)
    if (this.value > 0) {
      this.value -= this.speed * delta;
      // 감속 중에 0을 지나치지 않도록 보정
      if (this.value < 0) {
        this.value = 0;
      }
    }
    // 왼쪽으로 움직이던 중이었다면 (value < 0)
    else if (this.value < 0) {
      this.value += this.speed * delta;
      // 감속 중에 0을 지나치지 않도록 보정
      if (this.value > 0) {
        this.value = 0;
      }
    }
  }

  reset() {
    this.value = 0;
  }
}
