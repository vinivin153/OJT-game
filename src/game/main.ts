import { Boot } from "./scenes/Boot";
import { GameOver } from "./scenes/GameOver";
import { Game as MainGame } from "./scenes/Game";
import { MainMenu } from "./scenes/MainMenu";
import { AUTO, Game } from "phaser";
import { Preloader } from "./scenes/Preloader";

const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: 480,
  height: 480,
  parent: "game-container",
  backgroundColor: "#028af8",
  scene: [Boot, Preloader, MainMenu, MainGame, GameOver],
  zoom: 2,
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;
