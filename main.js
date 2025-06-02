import { Pong } from './pong.js';
import { SpaceInvaders } from './space-invaders.js';
import { Snake } from './snake.js';

const modal = document.getElementById('game-modal');
const canvas = document.getElementById('game-canvas');
const gameTitle = document.getElementById('game-title');
const gameControls = document.getElementById('game-controls');
let currentGame = null;

function startGame(GameClass) {
    // Очищаем предыдущие обработчики
    window.removeEventListener('keydown', handleGlobalKeyDown);
    window.removeEventListener('keyup', handleGlobalKeyUp);
    
    gameTitle.textContent = GameClass.title;
    gameControls.textContent = GameClass.controls;
    canvas.width = 800;
    canvas.height = 500;
    
    if (currentGame) currentGame.stop();
    
    currentGame = new GameClass(canvas);
    modal.style.display = 'block';
    
    // Устанавливаем фокус на canvas для обработки клавиш
    canvas.focus();
}

// Глобальные обработчики для кнопок
function handleGameButtonClick(gameClass) {
    return function() {
        startGame(gameClass);
    };
}

// Обработчики для кнопок
document.querySelector('[data-game="pong"] button').addEventListener('click', handleGameButtonClick(Pong));
document.querySelector('[data-game="space-invaders"] button').addEventListener('click', handleGameButtonClick(SpaceInvaders));
document.querySelector('[data-game="snake"] button').addEventListener('click', handleGameButtonClick(Snake));

// Заглушки для Tetris и Pacman
document.querySelector('[data-game="tetris"] button').addEventListener('click', () => {
    gameTitle.textContent = "TETRIS (1984)";
    gameControls.textContent = "Реализация в разработке";
    canvas.width = 800;
    canvas.height = 500;
    
    if (currentGame) currentGame.stop();
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '30px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffff00';
    ctx.fillText('COMING SOON', canvas.width / 2, canvas.height / 2);
    
    modal.style.display = 'block';
});

document.querySelector('[data-game="pacman"] button').addEventListener('click', () => {
    gameTitle.textContent = "PAC-MAN (1980)";
    gameControls.textContent = "Реализация в разработке";
    canvas.width = 800;
    canvas.height = 500;
    
    if (currentGame) currentGame.stop();
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '30px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffff00';
    ctx.fillText('COMING SOON', canvas.width / 2, canvas.height / 2);
    
    modal.style.display = 'block';
});

// Глобальные обработчики для клавиш (например, ESC для закрытия)
function handleGlobalKeyDown(e) {
    if (e.key === 'Escape') {
        modal.style.display = 'none';
        if (currentGame) currentGame.stop();
    }
}

function handleGlobalKeyUp(e) {
    // Можно добавить общую логику здесь
}

window.addEventListener('keydown', handleGlobalKeyDown);
window.addEventListener('keyup', handleGlobalKeyUp);

// Закрытие игры
document.querySelector('.close-btn').addEventListener('click', () => {
    modal.style.display = 'none';
    if (currentGame) currentGame.stop();
});