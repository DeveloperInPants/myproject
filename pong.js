export class Pong {
    static title = "PONG (1972)";
    static controls = "PvP: W/S (игрок 1) ↑/↓ (игрок 2) | PvE: ↑/↓ (игрок)";
    
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.keys = {};
        this.score = { player1: 0, player2: 0 };
        this.running = true;
        this.gameMode = 'pvp'; // 'pvp' или 'pve'
        
        // Размеры объектов
        this.paddleWidth = 15;
        this.paddleHeight = 100;
        this.ballSize = 10;
        
        // Позиции
        this.resetGame();
        
        // Обработчики событий
        document.addEventListener('keydown', (e) => this.keys[e.key] = true);
        document.addEventListener('keyup', (e) => this.keys[e.key] = false);
        
        // Кнопки режимов
        this.createModeButtons();
        
        // Запуск игры
        this.gameLoop();
    }
    
    createModeButtons() {
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = '10px';
        container.style.left = '10px';
        container.style.zIndex = '100';
        
        const pvpBtn = document.createElement('button');
        pvpBtn.textContent = 'PvP';
        pvpBtn.addEventListener('click', () => this.gameMode = 'pvp');
        
        const pveBtn = document.createElement('button');
        pveBtn.textContent = 'PvE';
        pveBtn.addEventListener('click', () => this.gameMode = 'pve');
        
        container.appendChild(pvpBtn);
        container.appendChild(pveBtn);
        document.getElementById('game-modal').appendChild(container);
    }
    
    resetGame() {
        this.player1Y = this.canvas.height / 2 - this.paddleHeight / 2;
        this.player2Y = this.canvas.height / 2 - this.paddleHeight / 2;
        this.ballX = this.canvas.width / 2;
        this.ballY = this.canvas.height / 2;
        this.ballSpeedX = 5 * (Math.random() > 0.5 ? 1 : -1);
        this.ballSpeedY = 3 * (Math.random() > 0.5 ? 1 : -1);
    }
    
    update() {
        // Движение платформы игрока 1 (W/S)
        if (this.keys['w'] && this.player1Y > 0) this.player1Y -= 7;
        if (this.keys['s'] && this.player1Y < this.canvas.height - this.paddleHeight) this.player1Y += 7;
        
        // Движение платформы игрока 2 (↑/↓)
        if (this.gameMode === 'pvp') {
            if (this.keys['ArrowUp'] && this.player2Y > 0) this.player2Y -= 7;
            if (this.keys['ArrowDown'] && this.player2Y < this.canvas.height - this.paddleHeight) this.player2Y += 7;
        } else {
            // AI для PvE (следит за мячом)
            const paddleCenter = this.player2Y + this.paddleHeight / 2;
            if (paddleCenter < this.ballY - 10) this.player2Y += 5;
            else if (paddleCenter > this.ballY + 10) this.player2Y -= 5;
        }
        
        // Движение мяча
        this.ballX += this.ballSpeedX;
        this.ballY += this.ballSpeedY;
        
        // Отскок от стен
        if (this.ballY <= 0 || this.ballY >= this.canvas.height - this.ballSize) {
            this.ballSpeedY = -this.ballSpeedY;
        }
        
        // Отскок от платформ
        if (this.checkPaddleCollision(this.player1Y, 0)) {
            this.ballSpeedX = Math.abs(this.ballSpeedX) * 1.05;
        }
        
        if (this.checkPaddleCollision(this.player2Y, this.canvas.width - this.paddleWidth)) {
            this.ballSpeedX = -Math.abs(this.ballSpeedX) * 1.05;
        }
        
        // Гол
        if (this.ballX < 0) {
            this.score.player2++;
            this.resetGame();
        } else if (this.ballX > this.canvas.width) {
            this.score.player1++;
            this.resetGame();
        }
    }
    
    checkPaddleCollision(paddleY, paddleX) {
        return (
            this.ballX >= paddleX && 
            this.ballX <= paddleX + this.paddleWidth &&
            this.ballY > paddleY && 
            this.ballY < paddleY + this.paddleHeight
        );
    }
    
    draw() {
        // Очистка экрана
        this.ctx.fillStyle = '#0f0f1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Платформы
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(0, this.player1Y, this.paddleWidth, this.paddleHeight);
        this.ctx.fillRect(this.canvas.width - this.paddleWidth, this.player2Y, this.paddleWidth, this.paddleHeight);
        
        // Мяч
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(this.ballX, this.ballY, this.ballSize, this.ballSize);
        
        // Счёт
        this.ctx.font = '30px "Press Start 2P"';
        this.ctx.fillText(this.score.player1, this.canvas.width / 4, 40);
        this.ctx.fillText(this.score.player2, this.canvas.width * 3/4, 40);
        
        // Режим игры
        this.ctx.font = '16px "Press Start 2P"';
        this.ctx.fillText(`Режим: ${this.gameMode.toUpperCase()}`, 10, 30);
    }
    
    gameLoop() {
        if (!this.running) return;
        
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    stop() {
        this.running = false;
    }
}