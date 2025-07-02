import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { Game as MainGame } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import { OptionsModal } from './scenes/OptionModal';
import { Explanation } from './scenes/Explanation';
import { GameClear } from './scenes/GameClear';

const zoom = window.innerHeight / 360;
const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: window.innerWidth / zoom,
  height: 360,
  parent: 'game-container',
  backgroundColor: '#028af8',
  scene: [Boot, Preloader, MainMenu, MainGame, GameOver, OptionsModal, Explanation, GameClear],
  zoom,
  physics: {
    default: 'matter',
    matter: {
      gravity: { x: 0, y: 1 },
    },
  },
  render: {
    pixelArt: true, // 픽셀 아트 최적화
  },
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;
