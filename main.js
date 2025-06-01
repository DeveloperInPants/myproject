import { Pong } from './pong.js';

const modal = document.getElementById('game-modal');
const canvas = document.getElementById('game-canvas');
const gameTitle = document.getElementById('game-title');
const gameControls = document.getElementById('game-controls');
let currentGame = null;

// --- Одно объявление функции! ---
function startGame(GameClass) {
    // Настройка интерфейса
    gameTitle.textContent = GameClass.title;
    gameControls.textContent = GameClass.controls;
    canvas.width = 800;
    canvas.height = 500;
    
    // Остановка предыдущей игры
    if (currentGame) currentGame.stop();
    
    // Запуск новой
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