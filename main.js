import { Pong } from './pong.js';

const modal = document.getElementById('game-modal');
const canvas = document.getElementById('game-canvas');
const gameTitle = document.getElementById('game-title');
const gameControls = document.getElementById('game-controls');
let currentGame = null;

document.querySelector('[data-game="pong"] button').addEventListener('click', () => {
    startGame(Pong);
});

function startGame(GameClass) {
    console.log("Запуск игры"); // Должно появиться в консоли
    console.log(GameClass); // Должен вывести класс Pong
    
    gameTitle.textContent = GameClass.title;
    gameControls.textContent = GameClass.controls;
    canvas.width = 800;
    canvas.height = 500;
    
    currentGame = new GameClass(canvas);
    modal.style.display = 'block';
    
    console.log("Игра создана"); // Проверка
}

// Закрытие игры
document.querySelector('.close-btn').addEventListener('click', () => {
    modal.style.display = 'none';
    if (currentGame) currentGame.stop();
});
function startGame(GameClass) {
    console.log("Запуск игры"); // Должно появиться в консоли
    console.log(GameClass); // Должен вывести класс Pong
    
    gameTitle.textContent = GameClass.title;
    gameControls.textContent = GameClass.controls;
    canvas.width = 800;
    canvas.height = 500;
    
    currentGame = new GameClass(canvas);
    modal.style.display = 'block';
    
    console.log("Игра создана"); // Проверка
}