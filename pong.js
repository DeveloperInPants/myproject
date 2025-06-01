class Pong {
    static title = "PONG (1972)";
    static controls = "Управление: ↑/↓";

    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.setup();
    }

    setup() {
        this.canvas.width = 600;
        this.canvas.height = 400;
        
        // Инициализация объектов игры
        this.ball = { x: 300, y: 200, radius: 10 };
        this.paddles = { left: 175, right: 175 };
        
        // Запуск игрового цикла
        requestAnimationFrame(this.update.bind(this));
    }

    update() {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Отрисовка объектов
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(30, this.paddles.left, 15, 100); // Левая платформа
        this.ctx.fillRect(this.canvas.width - 45, this.paddles.right, 15, 100); // Правая
        
        // Мяч
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI*2);
        this.ctx.fill();
        
        requestAnimationFrame(this.update.bind(this));
    }
}

// Экспорт для main.js
export { Pong };