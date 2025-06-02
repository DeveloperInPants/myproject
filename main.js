import { Pong } from './pong.js';
import { SpaceInvaders } from './space-invaders.js';

const modal = document.getElementById('game-modal');
const canvas = document.getElementById('game-canvas');
const gameTitle = document.getElementById('game-title');
const gameControls = document.getElementById('game-controls');
let currentGame = null;

function startGame(GameClass) {
    gameTitle.textContent = GameClass.title;
    gameControls.textContent = GameClass.controls;
    canvas.width = 800;
    canvas.height = 500;
    
    if (currentGame) currentGame.stop();
    
    currentGame = new GameClass(canvas);
    modal.style.display = 'block';
}

// Обработчик для кнопки Pong
document.querySelector('[data-game="pong"] button').addEventListener('click', () => {
    startGame(Pong);
});

// Закрытие игры
document.querySelector('.close-btn').addEventListener('click', () => {
    modal.style.display = 'none';
    if (currentGame) currentGame.stop();
});

document.querySelector('[data-game="space-invaders"] button').addEventListener('click', () => {
    startGame(SpaceInvaders);
});