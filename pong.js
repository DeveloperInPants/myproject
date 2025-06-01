export class Pong {
    static title = "PONG (1972)";
    static controls = "Управление: W/S (игрок 1) ↑/↓ (игрок 2)";
    
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.keys = {};
        this.score = { player1: 0, player2: 0 };
        this.running = true;
        this.gameMode = null; // Начинаем с null (режим не выбран)
        this.gameStarted = false;
        this.winningScore = 5; // Очки для победы
        this.winner = null;
        
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
        
        // Создаём UI
        this.createExitButton();
        this.createModeSelection();
        
        // Запуск игры
        this.lastTime = 0;
        this.gameLoop(0);
    }
    
    createExitButton() {
        this.exitBtn = document.createElement('button');
        this.exitBtn.innerHTML = '✖';
        this.exitBtn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            z-index: 200;
            width: 40px;
            height: 40px;
            background: #ff0000;
            color: white;
            border: none;
            border-radius: 50%;
            font-size: 20px;
            cursor: pointer;
            box-shadow: 0 0 10px rgba(255, 0, 0, 0.7);
            transition: all 0.3s;
        `;
        this.exitBtn.addEventListener('mouseover', () => {
            this.exitBtn.style.transform = 'scale(1.1)';
            this.exitBtn.style.background = '#ff4444';
        });
        this.exitBtn.addEventListener('mouseout', () => {
            this.exitBtn.style.transform = 'scale(1)';
            this.exitBtn.style.background = '#ff0000';
        });
        this.exitBtn.addEventListener('click', () => {
            this.stop();
            document.getElementById('game-modal').style.display = 'none';
        });
        document.getElementById('game-modal').appendChild(this.exitBtn);
    }
    
    createModeSelection() {
        this.modeContainer = document.createElement('div');
        this.modeContainer.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 100;
            display: flex;
            flex-direction: column;
            gap: 20px;
            background: rgba(15, 15, 26, 0.9);
            padding: 30px;
            border-radius: 10px;
            border: 3px solid #00ff00;
            box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
        `;

        const title = document.createElement('h2');
        title.textContent = 'ВЫБЕРИТЕ РЕЖИМ';
        title.style.cssText = `
            color: #00ff00;
            font-family: 'Press Start 2P', cursive;
            text-align: center;
            margin: 0 0 20px 0;
        `;

        const modes = [
            { id: 'pvp', label: '🔵 PvP (2 игрока)', desc: 'W/S vs ↑/↓' },
            { id: 'pve', label: '🤖 PvE (против AI)', desc: 'W/S для игрока' }
        ];

        modes.forEach(mode => {
            const btn = document.createElement('button');
            btn.innerHTML = `<div>${mode.label}</div><small>${mode.desc}</small>`;
            btn.style.cssText = `
                padding: 15px 25px;
                background: #333;
                color: #00ff00;
                border: 2px solid #00ff00;
                font-family: 'Courier New', monospace;
                cursor: pointer;
                border-radius: 5px;
                transition: all 0.3s;
                text-align: center;
            `;
            btn.addEventListener('mouseover', () => {
                btn.style.background = '#00ff00';
                btn.style.color = '#0f0f1a';
            });
            btn.addEventListener('mouseout', () => {
                btn.style.background = '#333';
                btn.style.color = '#00ff00';
            });
            btn.addEventListener('click', () => {
                this.gameMode = mode.id;
                this.modeContainer.remove();
                this.createScoreDisplay();
                this.gameStarted = false; // Игра на паузе до первого нажатия
            });
            this.modeContainer.appendChild(btn);
        });

        document.getElementById('game-modal').appendChild(this.modeContainer);
    }
    
    createScoreDisplay() {
        this.scoreDisplay = document.createElement('div');
        this.scoreDisplay.style.cssText = `
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 100;
            color: #00ff00;
            font-family: 'Press Start 2P', cursive;
            font-size: 24px;
            background: rgba(15, 15, 26, 0.7);
            padding: 10px 20px;
            border-radius: 5px;
        `;
        this.updateScoreDisplay();
        document.getElementById('game-modal').appendChild(this.scoreDisplay);
    }
    
    updateScoreDisplay() {
        this.scoreDisplay.innerHTML = `
            ${this.score.player1} : ${this.score.player2}
            ${this.winner ? `<div style="font-size:16px;color:#ffff00;">${this.winner} ПОБЕДИЛ!</div>` : ''}
        `;
    }
    
    handleKeyDown(e) {
        if (['w', 's', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
            e.preventDefault();
            
            // Старт игры при первом нажатии
            if (!this.gameStarted && this.gameMode) {
                this.gameStarted = true;
            }
            
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
        this.ballSpeedX = 0; // Мяч не двигается
        this.ballSpeedY = 0;
        this.gameStarted = false; // Ожидаем нажатия клавиш
    }
    
    startBallMovement() {
        this.ballSpeedX = 5 * (Math.random() > 0.5 ? 1 : -1);
        this.ballSpeedY = 3 * (Math.random() > 0.5 ? 1 : -1);
    }
    
    update(deltaTime) {
        if (!this.gameMode || !this.gameStarted || this.winner) return;
        
        // Движение платформы игрока 1 (W/S)
        const moveSpeed = 0.4 * deltaTime;
        if (this.keys['w'] && this.player1Y > 0) this.player1Y -= moveSpeed;
        if (this.keys['s'] && this.player1Y < this.canvas.height - this.paddleHeight) this.player1Y += moveSpeed;
        
        // Движение платформы игрока 2 (↑/↓) или AI
        if (this.gameMode === 'pvp') {
            if (this.keys['ArrowUp'] && this.player2Y > 0) this.player2Y -= moveSpeed;
            if (this.keys['ArrowDown'] && this.player2Y < this.canvas.height - this.paddleHeight) this.player2Y += moveSpeed;
        } else {
            // Улучшенный AI
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
        
        // Движение мяча (если игра начата)
        if (this.gameStarted) {
            this.ballX += this.ballSpeedX * (deltaTime / 16);
            this.ballY += this.ballSpeedY * (deltaTime / 16);
        }
        
        // Отскок от стен
        if (this.ballY <= 0 || this.ballY >= this.canvas.height - this.ballSize) {
            this.ballSpeedY = -this.ballSpeedY;
        }
        
        // Отскок от платформ
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
            if (this.score.player2 >= this.winningScore) {
                this.winner = 'ИГРОК 2';
            }
            this.resetGame();
        } else if (this.ballX > this.canvas.width) {
            this.score.player1++;
            if (this.score.player1 >= this.winningScore) {
                this.winner = 'ИГРОК 1';
            }
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
        
        // Сообщение "Нажмите клавишу"
        if (!this.gameStarted && this.gameMode && !this.winner) {
            this.ctx.font = '20px "Press Start 2P"';
            this.ctx.textAlign = 'center';
            this.ctx.fillStyle = '#ffff00';
            this.ctx.fillText('НАЖМИТЕ ЛЮБУЮ КЛАВИШУ', this.canvas.width / 2, this.canvas.height / 2);
        }
        
        // Сообщение о победе
        if (this.winner) {
            this.ctx.font = '30px "Press Start 2P"';
            this.ctx.textAlign = 'center';
            this.ctx.fillStyle = '#ffff00';
            this.ctx.fillText(`${this.winner} ПОБЕДИЛ!`, this.canvas.width / 2, this.canvas.height / 2 - 30);
            this.ctx.font = '16px "Press Start 2P"';
            this.ctx.fillText('Нажмите ESC для выхода', this.canvas.width / 2, this.canvas.height / 2 + 20);
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
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        
        if (this.exitBtn) this.exitBtn.remove();
        if (this.modeContainer) this.modeContainer.remove();
        if (this.scoreDisplay) this.scoreDisplay.remove();
    }
}