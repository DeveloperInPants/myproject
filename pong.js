export class Pong {
    static title = "PONG (1972)";
    static controls = "Управление: W/S (игрок 1) ↑/↓ (игрок 2)";
    
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.keys = {};
        this.score = { player1: 0, player2: 0 };
        this.running = true;
        this.gameMode = null;
        this.gameStarted = false;
        this.winningScore = 5;
        this.winner = null;
        this.firstRound = true;
        
        // Размеры объектов
        this.paddleWidth = 15;
        this.paddleHeight = 100;
        this.ballSize = 10;
        
        // Инициализация позиций
        this.resetGame();
        
        // Привязка контекста для обработчиков событий
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        
        // Установка фокуса и обработчиков событий
        canvas.tabIndex = 0;
        canvas.focus();
        canvas.addEventListener('keydown', this.handleKeyDown);
        canvas.addEventListener('keyup', this.handleKeyUp);
        
        // Создание UI
        this.createModeSelection();
        
        // Запуск игрового цикла
        this.lastTime = 0;
        requestAnimationFrame((t) => this.gameLoop(t));
    }
    
    resetGame() {
        this.player1Y = this.canvas.height / 2 - this.paddleHeight / 2;
        this.player2Y = this.canvas.height / 2 - this.paddleHeight / 2;
        this.ballX = this.canvas.width / 2;
        this.ballY = this.canvas.height / 2;
        
        if (this.firstRound) {
            this.ballSpeedX = 0;
            this.ballSpeedY = 0;
            this.gameStarted = false;
        } else {
            this.ballSpeedX = 5 * (Math.random() > 0.5 ? 1 : -1);
            this.ballSpeedY = 3 * (Math.random() > 0.5 ? 1 : -1);
            this.gameStarted = true;
        }
    }
    
    createModeSelection() {
        this.modeContainer = document.createElement('div');
        this.modeContainer.className = 'mode-selection';
        
        const title = document.createElement('h2');
        title.textContent = 'SELECT GAME MODE';
        title.className = 'mode-title';
        
        const modes = [
            { id: 'pvp', label: '🕹️ PvP (2 PLAYERS)', desc: 'W/S vs ↑/↓' },
            { id: 'pve', label: '🤖 PvE (VS COMPUTER)', desc: 'W/S to move' }
        ];
        
        modes.forEach(mode => {
            const btn = document.createElement('button');
            btn.className = 'mode-button';
            btn.innerHTML = `<span class="mode-label">${mode.label}</span><small>${mode.desc}</small>`;
            btn.addEventListener('click', () => {
                this.gameMode = mode.id;
                this.modeContainer.remove();
                this.createScoreDisplay();
                this.gameStarted = false;
                this.firstRound = true;
                this.canvas.focus();
            });
            this.modeContainer.appendChild(btn);
        });
        
        this.modeContainer.prepend(title);
        document.getElementById('game-modal').appendChild(this.modeContainer);
    }
    
    createScoreDisplay() {
        this.scoreDisplay = document.createElement('div');
        this.scoreDisplay.className = 'score-display';
        this.scoreDisplay.id = 'game-score';
        this.updateScoreDisplay();
        const canvas = document.getElementById('game-canvas');
        canvas.parentNode.insertBefore(this.scoreDisplay, canvas);
    }
    
    updateScoreDisplay() {
        this.scoreDisplay.innerHTML = `
            ${this.score.player1} : ${this.score.player2}
            ${this.winner ? `<div class="winner-text">${this.winner} WINS!</div>` : ''}
        `;
    }
    
    handleKeyDown(e) {
        const key = e.key.toLowerCase();
        this.keys[key] = true;
        
        if (!this.gameStarted && this.gameMode && !this.winner) {
            this.gameStarted = true;
            this.firstRound = false;
            this.startBallMovement();
        }
        
        if (key === 'escape' && this.winner) {
            document.querySelector('.close-btn').click();
        }
        
        if (['w', 's', 'arrowup', 'arrowdown'].includes(key)) {
            e.preventDefault();
        }
    }
    
    handleKeyUp(e) {
        const key = e.key.toLowerCase();
        this.keys[key] = false;
    }
    
    startBallMovement() {
        this.ballSpeedX = 5 * (Math.random() > 0.5 ? 1 : -1);
        this.ballSpeedY = 3 * (Math.random() > 0.5 ? 1 : -1);
    }
    
    update(deltaTime) {
        if (!this.gameMode || this.winner) return;
        
        const moveSpeed = 0.4 * deltaTime;
        
        // Движение игрока 1
        if (this.keys['w'] && this.player1Y > 0) this.player1Y -= moveSpeed;
        if (this.keys['s'] && this.player1Y < this.canvas.height - this.paddleHeight) this.player1Y += moveSpeed;
        
        // Движение игрока 2 или AI
        if (this.gameMode === 'pvp') {
            if (this.keys['arrowup'] && this.player2Y > 0) this.player2Y -= moveSpeed;
            if (this.keys['arrowdown'] && this.player2Y < this.canvas.height - this.paddleHeight) this.player2Y += moveSpeed;
        } else {
            // AI логика
            const paddleCenter = this.player2Y + this.paddleHeight / 2;
            const predictY = this.ballY + (this.ballSpeedY * (this.canvas.width - this.ballX) / Math.abs(this.ballSpeedX || 1));
            const targetY = Math.max(
                this.paddleHeight / 2,
                Math.min(this.canvas.height - this.paddleHeight / 2, predictY)
            );
            
            const aiSpeed = 0.35 * deltaTime;
            if (paddleCenter < targetY - 10) this.player2Y += aiSpeed;
            else if (paddleCenter > targetY + 10) this.player2Y -= aiSpeed;
        }
        
        if (this.gameStarted) {
            this.ballX += this.ballSpeedX * (deltaTime / 16);
            this.ballY += this.ballSpeedY * (deltaTime / 16);
        }
        
        // Отскок от верхней и нижней границы
        if (this.ballY <= 0 || this.ballY >= this.canvas.height - this.ballSize) {
            this.ballSpeedY = -this.ballSpeedY;
        }
        
        // Проверка столкновения с ракетками
        if (this.checkPaddleCollision(this.player1Y, 0)) {
            const hitPos = (this.ballY - (this.player1Y + this.paddleHeight / 2)) / (this.paddleHeight / 2);
            this.ballSpeedX = Math.abs(this.ballSpeedX) * 1.05;
            this.ballSpeedY = hitPos * 8;
        }
        
        if (this.checkPaddleCollision(this.player2Y, this.canvas.width - this.paddleWidth)) {
            const hitPos = (this.ballY - (this.player2Y + this.paddleHeight / 2)) / (this.paddleHeight / 2);
            this.ballSpeedX = -Math.abs(this.ballSpeedX) * 1.05;
            this.ballSpeedY = hitPos * 8;
        }
        
        // Проверка выхода за границы (гол)
        if (this.ballX < 0) {
            this.score.player2++;
            if (this.score.player2 >= this.winningScore) this.winner = 'PLAYER 2';
            this.resetGame();
        } else if (this.ballX > this.canvas.width) {
            this.score.player1++;
            if (this.score.player1 >= this.winningScore) this.winner = 'PLAYER 1';
            this.resetGame();
        }
        
        this.updateScoreDisplay();
    }
    
    checkPaddleCollision(paddleY, paddleX) {
        return (
            this.ballX >= paddleX - this.ballSize && 
            this.ballX <= paddleX + this.paddleWidth + this.ballSize &&
            this.ballY > paddleY - this.ballSize && 
            this.ballY < paddleY + this.paddleHeight + this.ballSize
        );
    }
    
    draw() {
        // Очистка экрана
        this.ctx.fillStyle = '#0f0f1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Рисуем ракетки
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(0, this.player1Y, this.paddleWidth, this.paddleHeight);
        this.ctx.fillRect(this.canvas.width - this.paddleWidth, this.player2Y, this.paddleWidth, this.paddleHeight);
        
        // Рисуем мяч
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(
            this.ballX + this.ballSize / 2, 
            this.ballY + this.ballSize / 2, 
            this.ballSize / 2, 
            0, 
            Math.PI * 2
        );
        this.ctx.fill();
        
        // Рисуем центральную линию
        this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Сообщение "Нажмите любую клавишу"
        if (this.firstRound && !this.gameStarted && this.gameMode && !this.winner) {
            this.ctx.font = '20px "Press Start 2P"';
            this.ctx.textAlign = 'center';
            this.ctx.fillStyle = '#ffff00';
            this.ctx.fillText('PRESS ANY KEY TO START', this.canvas.width / 2, this.canvas.height / 2);
        }
        
        // Сообщение о победе
        if (this.winner) {
            this.ctx.font = '30px "Press Start 2P"';
            this.ctx.textAlign = 'center';
            this.ctx.fillStyle = '#ffff00';
            this.ctx.fillText(`${this.winner} WINS!`, this.canvas.width / 2, this.canvas.height / 2 - 30);
            this.ctx.font = '16px "Press Start 2P"';
            this.ctx.fillText('PRESS ESC TO EXIT', this.canvas.width / 2, this.canvas.height / 2 + 20);
        }
    }
    
    gameLoop(timestamp) {
        if (!this.running) return;
        
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        this.update(deltaTime || 16);
        this.draw();
        requestAnimationFrame((t) => this.gameLoop(t));
    }
    
    stop() {
        this.running = false;
        this.canvas.removeEventListener('keydown', this.handleKeyDown);
        this.canvas.removeEventListener('keyup', this.handleKeyUp);
        
        if (this.modeContainer) this.modeContainer.remove();
        if (this.scoreDisplay) this.scoreDisplay.remove();
    }
}