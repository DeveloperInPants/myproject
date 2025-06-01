import { Pong } from './pong.js';
import { SpaceInvaders } from './space-invaders.js';
// ... другие импорты ...

const games = {
    pong: Pong,
    'space-invaders': SpaceInvaders
    // ... другие игры
};

document.querySelectorAll('.game-card').forEach(card => {
    card.querySelector('button').addEventListener('click', () => {
        const gameId = card.dataset.game;
        launchGame(games[gameId]);
    });
});

function launchGame(GameClass) {
    const modal = document.getElementById('game-modal');
    const canvas = document.getElementById('game-canvas');
    
    // Настройка интерфейса
    document.getElementById('game-title').textContent = GameClass.title;
    document.getElementById('game-controls').textContent = GameClass.controls;
    
    // Запуск игры
    new GameClass(canvas);
    modal.style.display = 'block';
    
    // Закрытие окна
    document.querySelector('.close-btn').onclick = () => {
        modal.style.display = 'none';
        canvas.width = 0; // Остановка игры
    };
}