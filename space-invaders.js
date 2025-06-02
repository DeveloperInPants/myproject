export class SpaceInvaders {
    static title = "SPACE INVADERS (1978)";
    static controls = "Управление: ←/→ (движение), ПРОБЕЛ (выстрел)";
    
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.keys = {};
        this.running = true;
        this.gameOver = false;
        this.gameStarted = false;
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        
        // Размеры объектов
        this.playerWidth = 50;
        this.playerHeight = 30;
        this.bulletWidth = 4;
        this.bulletHeight = 15;
        this.invaderWidth = 40;
        this.invaderHeight = 30;
        this.bunkerWidth = 80;
        this.bunkerHeight = 40;
        
        // Позиции и состояния
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
            SCORE: ${this.score} | LIVES: ${this.lives} | LEVEL: ${this.level}
            ${this.gameOver ? '<div class="winner-text">GAME OVER</div>' : ''}
        `;
    }
    
    handleKeyDown(e) {
        const key = e.key.toLowerCase();
        this.keys[key] = true;
        
        if (!this.gameStarted && !this.gameOver) {
            this.gameStarted = true;
        }
        
        if (key === 'escape' && this.gameOver) {
            document.querySelector('.close-btn').click();
        }
        
        if (['arrowleft', 'arrowright', ' '].includes(key)) {
            e.preventDefault();
        }
    }
    
    handleKeyUp(e) {
        const key = e.key.toLowerCase();
        this.keys[key] = false;
    }
    
    resetGame() {
        // Игрок
        this.playerX = this.canvas.width / 2 - this.playerWidth / 2;
        this.playerY = this.canvas.height - this.playerHeight - 20;
        this.playerSpeed = 5;
        
        // Пули
        this.playerBullets = [];
        this.invaderBullets = [];
        this.bulletSpeed = 7;
        this.lastPlayerShot = 0;
        this.shotDelay = 500; // мс между выстрелами
        
        // Пришельцы
        this.invaders = [];
        this.invaderRows = 5;
        this.invaderCols = 11;
        this.invaderSpeed = 0.5 + (this.level * 0.1);
        this.invaderDirection = 1;
        this.invaderDrop = 20;
        this.lastInvaderMove = 0;
        this.invaderMoveDelay = Math.max(200, 1000 - (this.level * 100));
        this.lastInvaderShot = 0;
        this.invaderShotDelay = 1000;
        this.createInvaders();
        
        // Бункеры
        this.bunkers = [];
        this.createBunkers();
        
        // Игровое состояние
        this.gameStarted = false;
    }
    
    createInvaders() {
        const startX = (this.canvas.width - (this.invaderCols * (this.invaderWidth + 10))) / 2;
        const startY = 50;
        
        for (let row = 0; row < this.invaderRows; row++) {
            for (let col = 0; col < this.invaderCols; col++) {
                const points = 
                    row === 0 ? 30 : 
                    row < 3 ? 20 : 10;
                
                this.invaders.push({
                    x: startX + col * (this.invaderWidth + 10),
                    y: startY + row * (this.invaderHeight + 10),
                    width: this.invaderWidth,
                    height: this.invaderHeight,
                    points: points,
                    alive: true
                });
            }
        }
    }
    
    createBunkers() {
        const bunkerCount = 4;
        const spacing = this.canvas.width / (bunkerCount + 1);
        
        for (let i = 1; i <= bunkerCount; i++) {
            this.bunkers.push({
                x: spacing * i - this.bunkerWidth / 2,
                y: this.canvas.height - 150,
                width: this.bunkerWidth,
                height: this.bunkerHeight,
                health: 3
            });
        }
    }
    
    update(deltaTime) {
        if (this.gameOver) return;
        
        const now = Date.now();
        
        // Движение игрока
        if (this.keys['arrowleft'] && this.playerX > 0) {
            this.playerX -= this.playerSpeed;
        }
        if (this.keys['arrowright'] && this.playerX < this.canvas.width - this.playerWidth) {
            this.playerX += this.playerSpeed;
        }
        
        // Выстрел игрока
        if (this.keys[' '] && now - this.lastPlayerShot > this.shotDelay && this.gameStarted) {
            this.playerBullets.push({
                x: this.playerX + this.playerWidth / 2 - this.bulletWidth / 2,
                y: this.playerY,
                width: this.bulletWidth,
                height: this.bulletHeight
            });
            this.lastPlayerShot = now;
        }
        
        // Движение пуль игрока
        for (let i = this.playerBullets.length - 1; i >= 0; i--) {
            this.playerBullets[i].y -= this.bulletSpeed;
            
            // Удаление пуль за пределами экрана
            if (this.playerBullets[i].y < 0) {
                this.playerBullets.splice(i, 1);
                continue;
            }
            
            // Проверка попадания в пришельцев
            let bulletHit = false;
            for (let j = 0; j < this.invaders.length; j++) {
                const invader = this.invaders[j];
                if (invader.alive && this.checkCollision(this.playerBullets[i], invader)) {
                    this.score += invader.points;
                    invader.alive = false;
                    bulletHit = true;
                    break;
                }
            }
            if (bulletHit) {
                this.playerBullets.splice(i, 1);
                continue;
            }
            
            // Проверка попадания в бункеры
            for (let j = 0; j < this.bunkers.length; j++) {
                const bunker = this.bunkers[j];
                if (bunker.health > 0 && this.checkCollision(this.playerBullets[i], bunker)) {
                    bunker.health--;
                    this.playerBullets.splice(i, 1);
                    break;
                }
            }
        }
        
        // Движение пришельцев
        if (now - this.lastInvaderMove > this.invaderMoveDelay && this.gameStarted) {
            let moveDown = false;
            let edgeReached = false;
            
            // Проверяем, достигли ли края
            for (const invader of this.invaders) {
                if (invader.alive) {
                    if ((invader.x + invader.width + this.invaderSpeed * this.invaderDirection > this.canvas.width) ||
                        (invader.x + this.invaderSpeed * this.invaderDirection < 0)) {
                        edgeReached = true;
                        break;
                    }
                }
            }
            
            if (edgeReached) {
                this.invaderDirection *= -1;
                moveDown = true;
            }
            
            // Двигаем пришельцев
            for (const invader of this.invaders) {
                if (invader.alive) {
                    if (moveDown) {
                        invader.y += this.invaderDrop;
                        // Проверка достижения нижней границы
                        if (invader.y + invader.height > this.playerY) {
                            this.gameOver = true;
                        }
                    } else {
                        invader.x += this.invaderSpeed * this.invaderDirection;
                    }
                }
            }
            
            this.lastInvaderMove = now;
        }
        
        // Выстрелы пришельцев
        if (now - this.lastInvaderShot > this.invaderShotDelay && this.gameStarted) {
            this.invaderShoot();
            this.lastInvaderShot = now;
        }
        
        // Движение пуль пришельцев
        for (let i = this.invaderBullets.length - 1; i >= 0; i--) {
            this.invaderBullets[i].y += this.bulletSpeed / 2;
            
            // Удаление пуль за пределами экрана
            if (this.invaderBullets[i].y > this.canvas.height) {
                this.invaderBullets.splice(i, 1);
                continue;
            }
            
            // Проверка попадания в игрока
            if (this.checkCollision(this.invaderBullets[i], {
                x: this.playerX,
                y: this.playerY,
                width: this.playerWidth,
                height: this.playerHeight
            })) {
                this.lives--;
                this.invaderBullets.splice(i, 1);
                
                if (this.lives <= 0) {
                    this.gameOver = true;
                } else {
                    // Кратковременная неуязвимость после потери жизни
                    this.playerX = this.canvas.width / 2 - this.playerWidth / 2;
                    this.invaderBullets = [];
                    this.playerBullets = [];
                }
                break;
            }
            
            // Проверка попадания в бункеры
            for (let j = 0; j < this.bunkers.length; j++) {
                const bunker = this.bunkers[j];
                if (bunker.health > 0 && this.checkCollision(this.invaderBullets[i], bunker)) {
                    bunker.health--;
                    this.invaderBullets.splice(i, 1);
                    break;
                }
            }
        }
        
        // Проверка завершения уровня
        const aliveInvaders = this.invaders.filter(inv => inv.alive).length;
        if (aliveInvaders === 0 && !this.gameOver) {
            this.level++;
            this.resetGame();
        }
        
        this.updateScoreDisplay();
    }
    
    invaderShoot() {
        // Выбираем случайных живых пришельцев для выстрела
        const aliveInvaders = this.invaders.filter(inv => inv.alive);
        if (aliveInvaders.length === 0) return;
        
        // Количество выстрелов (1-3 в зависимости от уровня)
        const shots = Math.min(1 + Math.floor(this.level / 3), 3);
        
        for (let i = 0; i < shots; i++) {
            if (Math.random() < 0.5) { // 50% шанс выстрела для каждого выбранного
                const shooter = aliveInvaders[Math.floor(Math.random() * aliveInvaders.length)];
                this.invaderBullets.push({
                    x: shooter.x + shooter.width / 2 - this.bulletWidth / 2,
                    y: shooter.y + shooter.height,
                    width: this.bulletWidth,
                    height: this.bulletHeight
                });
            }
        }
    }
    
    checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    draw() {
        // Очистка экрана
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Рисуем игрока
        this.ctx.fillStyle = '#0f0';
        this.ctx.fillRect(this.playerX, this.playerY, this.playerWidth, this.playerHeight);
        
        // Рисуем пули игрока
        this.ctx.fillStyle = '#0ff';
        for (const bullet of this.playerBullets) {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
        
        // Рисуем пришельцев
        for (const invader of this.invaders) {
            if (invader.alive) {
                this.ctx.fillStyle = invader.points === 30 ? '#f00' : 
                                    invader.points === 20 ? '#ff0' : '#0f0';
                this.ctx.fillRect(invader.x, invader.y, invader.width, invader.height);
            }
        }
        
        // Рисуем пули пришельцев
        this.ctx.fillStyle = '#f00';
        for (const bullet of this.invaderBullets) {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
        
        // Рисуем бункеры
        for (const bunker of this.bunkers) {
            if (bunker.health > 0) {
                this.ctx.fillStyle = `rgba(0, 255, 0, ${bunker.health / 3})`;
                this.ctx.fillRect(bunker.x, bunker.y, bunker.width, bunker.height);
            }
        }
        
        // Начальный экран
        if (!this.gameStarted && !this.gameOver) {
            this.ctx.font = '20px "Press Start 2P"';
            this.ctx.textAlign = 'center';
            this.ctx.fillStyle = '#ffff00';
            this.ctx.fillText('НАЖМИТЕ ЛЮБУЮ КЛАВИШУ', this.canvas.width / 2, this.canvas.height / 2);
        }
        
        // Экран Game Over
        if (this.gameOver) {
            this.ctx.font = '30px "Press Start 2P"';
            this.ctx.textAlign = 'center';
            this.ctx.fillStyle = '#ffff00';
            this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 30);
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
        window.removeEventListener('keydown', this.keyDownHandler);
        window.removeEventListener('keyup', this.keyUpHandler);
        
        if (this.scoreDisplay) this.scoreDisplay.remove();
    }
}