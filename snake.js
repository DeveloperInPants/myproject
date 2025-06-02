export class Snake {
    static title = "SNEIK (1976)";
    static controls = "Управление: ←/→/↑/↓ (движение), ПРОБЕЛ (пауза), R (рестарт)";
    
    constructor(canvas) {
        // Проверка наличия canvas
        if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
            throw new Error('Valid canvas element is required');
        }

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Инициализация игровых параметров
        this.running = true;
        this.gameOver = false;
        this.paused = false;
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
        this.speed = 100;
        this.gridSize = 20;
        
        // Инициализация элементов интерфейса
        this.initUI();
        
        // Инициализация игрового состояния
        this.resetGame();
        
        // Настройка управления
        this.setupControls();
        
        // Запуск игрового цикла
        this.lastTime = 0;
        this.lastMove = 0;
        this.gameLoop(0);
    }
    
    initUI() {
        // Проверяем, существует ли уже элемент счета
        this.scoreDisplay = document.getElementById('game-score');
        
        if (!this.scoreDisplay) {
            this.scoreDisplay = document.createElement('div');
            this.scoreDisplay.id = 'game-score';
            this.scoreDisplay.className = 'score-display';
            
            // Вставляем перед canvas
            const canvasContainer = this.canvas.parentNode;
            if (canvasContainer) {
                canvasContainer.insertBefore(this.scoreDisplay, this.canvas);
            } else {
                console.error('Canvas parent node not found');
            }
        }
        
        this.updateScoreDisplay();
    }
    
    setupControls() {
        this.keyDownHandler = (e) => this.handleKeyDown(e);
        window.addEventListener('keydown', this.keyDownHandler);
        this.canvas.tabIndex = 0;
        this.canvas.focus();
    }
    
    resetGame() {
        // Сброс состояния змейки
        this.snake = [
            {x: 10, y: 10},
            {x: 9, y: 10},
            {x: 8, y: 10}
        ];
        this.direction = 'right';
        this.nextDirection = 'right';
        
        // Создание новой еды
        this.spawnFood();
        
        // Сброс состояния игры
        this.gameOver = false;
        this.paused = false;
        
        // Обновление интерфейса
        this.updateScoreDisplay();
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
    
    handleKeyDown(e) {
        const key = e.key.toLowerCase();
        
        // Рестарт игры
        if (key === 'r' && this.gameOver) {
            e.preventDefault();
            this.score = 0;
            this.speed = 100;
            this.resetGame();
            return;
        }
        
        // Пауза
        if (key === ' ' && !this.gameOver) {
            e.preventDefault();
            this.paused = !this.paused;
            this.updateScoreDisplay();
            return;
        }
        
        // Выход
        if (key === 'escape') {
            if (this.gameOver) {
                document.querySelector('.close-btn').click();
            }
            return;
        }
        
        // Управление направлением
        if (!this.paused && !this.gameOver) {
            switch(key) {
                case 'arrowleft':
                    if (this.direction !== 'right') this.nextDirection = 'left';
                    break;
                case 'arrowright':
                    if (this.direction !== 'left') this.nextDirection = 'right';
                    break;
                case 'arrowup':
                    if (this.direction !== 'down') this.nextDirection = 'up';
                    break;
                case 'arrowdown':
                    if (this.direction !== 'up') this.nextDirection = 'down';
                    break;
            }
        }
    }
    
    update(deltaTime) {
        if (this.gameOver || this.paused) return;
        
        const now = Date.now();
        
        if (now - this.lastMove > this.speed) {
            this.direction = this.nextDirection;
            this.lastMove = now;
            
            const head = {...this.snake[0]};
            
            // Движение головы
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
                localStorage.setItem('snakeHighScore', this.highScore);
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
            
            // Рисуем глаза на голове
            if (isHead) {
                this.ctx.fillStyle = '#fff';
                const eyeSize = this.gridSize / 5;
                
                // Позиции глаз в зависимости от направления
                const eyePositions = {
                    right: [
                        {x: 3/4, y: 1/3},
                        {x: 3/4, y: 2/3}
                    ],
                    left: [
                        {x: 1/4, y: 1/3},
                        {x: 1/4, y: 2/3}
                    ],
                    up: [
                        {x: 1/3, y: 1/4},
                        {x: 2/3, y: 1/4}
                    ],
                    down: [
                        {x: 1/3, y: 3/4},
                        {x: 2/3, y: 3/4}
                    ]
                };
                
                // Рисуем глаза
                eyePositions[this.direction].forEach(pos => {
                    this.ctx.fillRect(
                        segment.x * this.gridSize + pos.x * this.gridSize - eyeSize/2,
                        segment.y * this.gridSize + pos.y * this.gridSize - eyeSize/2,
                        eyeSize,
                        eyeSize
                    );
                });
            }
        });
        
        // Экран Game Over
        if (this.gameOver) {
            this.ctx.font = '30px "Press Start 2P"';
            this.ctx.textAlign = 'center';
            this.ctx.fillStyle = '#ffff00';
            this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 30);
            this.ctx.font = '16px "Press Start 2P"';
            this.ctx.fillText('Нажмите R для рестарта', this.canvas.width / 2, this.canvas.height / 2 + 20);
            this.ctx.fillText('ESC для выхода', this.canvas.width / 2, this.canvas.height / 2 + 50);
        }
        
        // Экран Paused
        if (this.paused && !this.gameOver) {
            this.ctx.font = '30px "Press Start 2P"';
            this.ctx.textAlign = 'center';
            this.ctx.fillStyle = '#ffff00';
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        }
    }
    
    updateScoreDisplay() {
        if (this.scoreDisplay && this.scoreDisplay.innerHTML !== undefined) {
            this.scoreDisplay.innerHTML = `
                SCORE: ${this.score} | HIGH: ${this.highScore}
                ${this.gameOver ? '<div class="winner-text">GAME OVER</div>' : ''}
                ${this.paused ? '<div class="paused-text">PAUSED</div>' : ''}
            `;
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
        localStorage.setItem('snakeHighScore', this.highScore);
    }
}