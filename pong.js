export class Pong {
    static title = "PONG (1972)";
    static controls = "Управление: W/S (игрок 1) ↑/↓ (игрок 2)";
    
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.keys = {};
        this.score = { player1: 0, player2: 0 };
        this.running = true;
        
        // Размеры объектов
        this.paddleWidth = 15;
        this.paddleHeight = 100;
        this.ballSize = 10;
        
        // Позиции
        this.resetGame();
        
        // Обработчики событий
        document.addEventListener('keydown', this.keyDown.bind(this));
        document.addEventListener('keyup', this.keyUp.bind(this));
        
        // Запуск игры
        this.gameLoop();
    }
    
    resetGame() {
        this.player1Y = this.canvas.height / 2 - this.paddleHeight / 2;
        this.player2Y = this.canvas.height / 2 - this.paddleHeight / 2;
        this.ballX = this.canvas.width / 2;
        this.ballY = this.canvas.height / 2;
        this.ballSpeedX = 5 * (Math.random() > 0.5 ? 1 : -1);
        this.ballSpeedY = 3 * (Math.random() > 0.5 ? 1 : -1);
    }
    
    keyDown(e) {
        this.keys[e.key] = true;
    }
    
    keyUp(e) {
        this.keys[e.key] = false;
    }
    
    update() {
        // Движение платформ
        if (this.keys['w'] && this.player1Y > 0) this.player1Y -= 7;
        if (this.keys['s'] && this.player1Y < this.canvas.height - this.paddleHeight) this.player1Y += 7;
        if (this.keys['ArrowUp'] && this.player2Y > 0) this.player2Y -= 7;
        if (this.keys['ArrowDown'] && this.player2Y < this.canvas.height - this.paddleHeight) this.player2Y += 7;
        
        // Движение мяча
        this.ballX += this.ballSpeedX;
        this.ballY += this.ballSpeedY;
        
        // Отскок от стен
        if (this.ballY <= 0 || this.ballY >= this.canvas.height - this.ballSize) {
            this.ballSpeedY = -this.ballSpeedY;
        }
        
        // Отскок от платформ
        if (
            this.ballX <= this.paddleWidth && 
            this.ballY > this.player1Y && 
            this.ballY < this.player1Y + this.paddleHeight
        ) {
            this.ballSpeedX = -this.ballSpeedX * 1.05;
            // Эффект "подкрутки" мяча
            this.ballSpeedY += (this.ballY - (this.player1Y + this.paddleHeight/2)) * 0.02;
        }
        
        if (
            this.ballX >= this.canvas.width - this.paddleWidth - this.ballSize && 
            this.ballY > this.player2Y && 
            this.ballY < this.player2Y + this.paddleHeight
        ) {
            this.ballSpeedX = -this.ballSpeedX * 1.05;
            this.ballSpeedY += (this.ballY - (this.player2Y + this.paddleHeight/2)) * 0.02;
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
        this.ctx.fillText(this.score.player1, this.canvas.width / 4, 40);
        this.ctx.fillText(this.score.player2, this.canvas.width * 3/4, 40);
    }
    
    gameLoop() {
        if (!this.running) return;
        
        this.update();
        this.draw();
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    stop() {
        this.running = false;
    }
}