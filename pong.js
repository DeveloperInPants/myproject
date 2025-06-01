export class Pong {
    static title = "PONG (1972)";
    static controls = "Управление: W/S (игрок 1) ↑/↓ (игрок 2)";
    
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
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
        
        // Кнопки режимов
        this.createModeButtons();
        
        // Запуск игры
        this.lastTime = 0;
        this.gameLoop(0);
    }
    
    createModeButtons() {
        const container = document.createElement('div');
        container.style.cssText = `
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 100;
            display: flex;
            gap: 15px;
            background: rgba(15, 15, 26, 0.7);
            padding: 10px;
            border-radius: 5px;
        `;

        const modes = [
            { id: 'pvp', label: '🔵 PvP (2 игрока)' },
            { id: 'pve', label: '🤖 PvE (против AI)' }
        ];

        modes.forEach(mode => {
            const btn = document.createElement('button');
            btn.textContent = mode.label;
            btn.style.cssText = `
                padding: 8px 16px;
                background: ${this.gameMode === mode.id ? '#00ff00' : '#333'};
                color: ${this.gameMode === mode.id ? '#0f0f1a' : '#00ff00'};
                border: 2px solid #00ff00;
                font-family: 'Courier New', monospace;
                cursor: pointer;
                border-radius: 4px;
                transition: all 0.3s;
            `;
            btn.addEventListener('click', () => {
                this.gameMode = mode.id;
                this.updateModeButtons();
                this.resetGame();
            });
            container.appendChild(btn);
            this[`${mode.id}Btn`] = btn;
        });

        document.getElementById('game-modal').appendChild(container);
    }
    
    updateModeButtons() {
        const modes = ['pvp', 'pve'];
        modes.forEach(mode => {
            this[`${mode}Btn`].style.background = this.gameMode === mode ? '#00ff00' : '#333';
            this[`${mode}Btn`].style.color = this.gameMode === mode ? '#0f0f1a' : '#00ff00';
        });
    }
    
    handleKeyDown(e) {
        if (['w', 's', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
            e.preventDefault();
            if (!this.keys[e.key]) {
                this.keys[e.key] = true;
            }
        }
    }
    
    handleKeyUp(e) {
        if (['w', 's', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
            this.keys[e.key] = false;
        }
    }
    
    resetGame() {
        this.player1Y = this.canvas.height / 2 - this.paddleHeight / 2;
        this.player2Y = this.canvas.height / 2 - this.paddleHeight / 2;
        this.ballX = this.canvas.width / 2;
        this.ballY = this.canvas.height / 2;
        this.ballSpeedX = 5 * (Math.random() > 0.5 ? 1 : -1);
        this.ballSpeedY = 3 * (Math.random() > 0.5 ? 1 : -1);
    }
    
    update(deltaTime) {
        // Движение платформы игрока 1 (W/S)
        const moveSpeed = 0.4 * deltaTime;
        if (this.keys['w'] && this.player1Y > 0) this.player1Y -= moveSpeed;
        if (this.keys['s'] && this.player1Y < this.canvas.height - this.paddleHeight) this.player1Y += moveSpeed;
        
        // Движение платформы игрока 2 (↑/↓) или AI
        if (this.gameMode === 'pvp') {
            if (this.keys['ArrowUp'] && this.player2Y > 0) this.player2Y -= moveSpeed;
            if (this.keys['ArrowDown'] && this.player2Y < this.canvas.height - this.paddleHeight) this.player2Y += moveSpeed;
        } else {
            // Улучшенный AI с предсказанием
            const paddleCenter = this.player2Y + this.paddleHeight / 2;
            const predictY = this.ballY + (this.ballSpeedY * (this.canvas.width - this.ballX) / Math.abs(this.ballSpeedX);
            const targetY = Math.max(
                this.paddleHeight / 2,
                Math.min(this.canvas.height - this.paddleHeight / 2, predictY)
            );
            
            const aiSpeed = 0.35 * deltaTime;
            if (paddleCenter < targetY - 10) this.player2Y += aiSpeed;
            else if (paddleCenter > targetY + 10) this.player2Y -= aiSpeed;
        }
        
        // Движение мяча
        this.ballX += this.ballSpeedX * (deltaTime / 16);
        this.ballY += this.ballSpeedY * (deltaTime / 16);
        
        // Отскок от стен
        if (this.ballY <= 0 || this.ballY >= this.canvas.height - this.ballSize) {
            this.ballSpeedY = -this.ballSpeedY;
        }
        
        // Отскок от платформ с учётом угла
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
        
        // Платформы
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(0, this.player1Y, this.paddleWidth, this.paddleHeight);
        this.ctx.fillRect(this.canvas.width - this.paddleWidth, this.player2Y, this.paddleWidth, this.paddleHeight);
        
        // Мяч
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
        
        // Центральная линия
        this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Счёт
        this.ctx.font = '30px "Press Start 2P"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.score.player1, this.canvas.width / 4, 40);
        this.ctx.fillText(this.score.player2, this.canvas.width * 3/4, 40);
        
        // Режим игры
        this.ctx.font = '16px "Press Start 2P"';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Режим: ${this.gameMode.toUpperCase()}`, 20, 30);
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
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        
        const buttons = document.querySelectorAll('#game-modal div > button');
        if (buttons.length > 0) {
            buttons.forEach(btn => btn.remove());
        }
    }
}