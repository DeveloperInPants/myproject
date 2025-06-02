export class Snake {
    static title = "SNEIK (1976)";
    static controls = "Управление: ←/→/↑/↓ (движение), ПРОБЕЛ (пауза)";
    
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.keys = {};
        this.running = true;
        this.gameOver = false;
        this.paused = false;
        this.score = 0;
        this.highScore = 0;
        this.speed = 100; // ms per move
        this.gridSize = 20;
        
        // Инициализация змейки и еды
        this.resetGame();
        
        // Обработчики событий
        this.keyDownHandler = (e) => this.handleKeyDown(e);
        this.keyUpHandler = (e) => this.handleKeyUp(e);
        window.addEventListener('keydown', this.keyDownHandler);
        window.addEventListener('keyup', this.keyUpHandler);
        
        // Фокус на canvas
        canvas.tabIndex = 0;
        canvas.focus();
        
        // Создаём UI
        this.createScoreDisplay();
        
        // Запуск игры
        this.lastTime = 0;
        this.lastMove = 0;
        this.gameLoop(0);
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
            SCORE: ${this.score} | HIGH: ${this.highScore}
            ${this.gameOver ? '<div class="winner-text">GAME OVER</div>' : ''}
            ${this.paused ? '<div class="paused-text">PAUSED</div>' : ''}
        `;
    }
    
    handleKeyDown(e) {
        const key = e.key.toLowerCase();
        this.keys[key] = true;
        
        if (key === 'escape' && this.gameOver) {
            document.querySelector('.close-btn').click();
        }
        
        if (key === ' ' && !this.gameOver) {
            this.paused = !this.paused;
            this.updateScoreDisplay();
        }
        
        if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', ' '].includes(key)) {
            e.preventDefault();
        }
    }
    
    handleKeyUp(e) {
        const key = e.key.toLowerCase();
        this.keys[key] = false;
    }
    
    resetGame() {
        // Змейка
        this.snake = [
            {x: 10, y: 10},
            {x: 9, y: 10},
            {x: 8, y: 10}
        ];
        this.direction = 'right';
        this.nextDirection = 'right';
        
        // Еда
        this.spawnFood();
        
        // Игровое состояние
        this.gameOver = false;
        this.paused = false;
    }
    
    spawnFood() {
        const gridWidth = this.canvas.width / this.gridSize;
        const gridHeight = this.canvas.height / this.gridSize;
        
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * gridWidth),
                y: Math.floor(Math.random() * gridHeight)
            };
        } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y));
        
        this.food = food;
    }
    
    update(deltaTime) {
        if (this.gameOver || this.paused) return;
        
        const now = Date.now();
        
        // Обработка управления
        if (this.keys['arrowleft'] && this.direction !== 'right') {
            this.nextDirection = 'left';
        }
        if (this.keys['arrowright'] && this.direction !== 'left') {
            this.nextDirection = 'right';
        }
        if (this.keys['arrowup'] && this.direction !== 'down') {
            this.nextDirection = 'up';
        }
        if (this.keys['arrowdown'] && this.direction !== 'up') {
            this.nextDirection = 'down';
        }
        
        // Движение змейки
        if (now - this.lastMove > this.speed) {
            this.direction = this.nextDirection;
            this.lastMove = now;
            
            const head = {...this.snake[0]};
            
            switch (this.direction) {
                case 'left': head.x--; break;
                case 'right': head.x++; break;
                case 'up': head.y--; break;
                case 'down': head.y++; break;
            }
            
            // Проверка столкновений
            const gridWidth = this.canvas.width / this.gridSize;
            const gridHeight = this.canvas.height / this.gridSize;
            
            if (head.x < 0 || head.x >= gridWidth || 
                head.y < 0 || head.y >= gridHeight ||
                this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
                this.gameOver = true;
                this.highScore = Math.max(this.highScore, this.score);
                this.updateScoreDisplay();
                return;
            }
            
            // Добавление новой головы
            this.snake.unshift(head);
            
            // Проверка поедания еды
            if (head.x === this.food.x && head.y === this.food.y) {
                this.score += 10;
                this.spawnFood();
                // Ускорение каждые 50 очков
                if (this.score % 50 === 0 && this.speed > 50) {
                    this.speed -= 5;
                }
            } else {
                // Удаление хвоста, если не съели еду
                this.snake.pop();
            }
            
            this.updateScoreDisplay();
        }
    }
    
    draw() {
        // Очистка экрана
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Рисуем сетку
        this.ctx.strokeStyle = 'rgba(0, 100, 0, 0.2)';
        this.ctx.lineWidth = 0.5;
        
        for (let x = 0; x < this.canvas.width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y < this.canvas.height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        
        // Рисуем еду
        this.ctx.fillStyle = '#ff0';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            this.gridSize / 2 - 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        
        // Рисуем змейку
        this.snake.forEach((segment, index) => {
            const isHead = index === 0;
            const size = isHead ? this.gridSize - 2 : this.gridSize - 4;
            const offset = (this.gridSize - size) / 2;
            
            this.ctx.fillStyle = isHead ? '#0f0' : '#0a0';
            this.ctx.fillRect(
                segment.x * this.gridSize + offset,
                segment.y * this.gridSize + offset,
                size,
                size
            );
            
            // Глаза у головы
            if (isHead) {
                this.ctx.fillStyle = '#fff';
                const eyeSize = this.gridSize / 5;
                
                // Левый глаз
                let eyeX = segment.x * this.gridSize + this.gridSize / 4;
                let eyeY = segment.y * this.gridSize + this.gridSize / 3;
                
                // Правый глаз
                if (this.direction === 'left' || this.direction === 'right') {
                    eyeX = segment.x * this.gridSize + (this.direction === 'left' ? 
                        this.gridSize / 4 : this.gridSize * 3/4 - eyeSize);
                    eyeY = segment.y * this.gridSize + this.gridSize / 3;
                } else {
                    eyeX = segment.x * this.gridSize + this.gridSize / 3;
                    eyeY = segment.y * this.gridSize + (this.direction === 'up' ? 
                        this.gridSize / 4 : this.gridSize * 3/4 - eyeSize);
                }
                
                this.ctx.fillRect(eyeX, eyeY, eyeSize, eyeSize);
                this.ctx.fillRect(
                    eyeX + (this.direction === 'left' || this.direction === 'right' ? 
                        this.gridSize / 2 : 0),
                    eyeY + (this.direction === 'up' || this.direction === 'down' ? 
                        this.gridSize / 2 : 0),
                    eyeSize,
                    eyeSize
                );
            }
        });
        
        // Экран Game Over
        if (this.gameOver) {
            this.ctx.font = '30px "Press Start 2P"';
            this.ctx.textAlign = 'center';
            this.ctx.fillStyle = '#ffff00';
            this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 30);
            this.ctx.font = '16px "Press Start 2P"';
            this.ctx.fillText('Нажмите ESC для выхода', this.canvas.width / 2, this.canvas.height / 2 + 20);
            this.ctx.fillText('Нажмите R для рестарта', this.canvas.width / 2, this.canvas.height / 2 + 50);
        }
        
        // Экран Paused
        if (this.paused && !this.gameOver) {
            this.ctx.font = '30px "Press Start 2P"';
            this.ctx.textAlign = 'center';
            this.ctx.fillStyle = '#ffff00';
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
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
        window.removeEventListener('keydown', this.keyDownHandler);
        window.removeEventListener('keyup', this.keyUpHandler);
        
        if (this.scoreDisplay) this.scoreDisplay.remove();
    }
}