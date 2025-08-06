class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.box = 20;
        this.score = 0;
        this.highScore = localStorage.getItem('highScore') || 0;
        this.snake = [];
        this.food = {};
        this.d = '';
        this.game = null;

        this.init();
    }

    init() {
        this.snake = [{ x: 10 * this.box, y: 10 * this.box }];
        this.d = '';
        this.score = 0;
        this.spawnFood();
        document.addEventListener('keydown', (e) => this.direction(e));
        this.updateScoreDisplay();
        if (this.game) clearInterval(this.game);
        this.game = setInterval(() => this.draw(), 100);
    }

    spawnFood() {
        this.food = {
            x: Math.floor(Math.random() * (this.canvas.width / this.box)) * this.box,
            y: Math.floor(Math.random() * (this.canvas.height / this.box)) * this.box
        };
    }

    direction(event) {
        if (event.keyCode == 37 && this.d != 'RIGHT') {
            this.d = 'LEFT';
        } else if (event.keyCode == 38 && this.d != 'DOWN') {
            this.d = 'UP';
        } else if (event.keyCode == 39 && this.d != 'LEFT') {
            this.d = 'RIGHT';
        } else if (event.keyCode == 40 && this.d != 'UP') {
            this.d = 'DOWN';
        }
    }

    collision(head, array) {
        for (let i = 0; i < array.length; i++) {
            if (head.x == array[i].x && head.y == array[i].y) {
                return true;
            }
        }
        return false;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < this.snake.length; i++) {
            this.ctx.fillStyle = (i == 0) ? '#006400' : '#008000';
            this.ctx.fillRect(this.snake[i].x, this.snake[i].y, this.box, this.box);
            this.ctx.strokeStyle = '#004d00';
            this.ctx.strokeRect(this.snake[i].x, this.snake[i].y, this.box, this.box);
        }

        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(this.food.x, this.food.y, this.box, this.box);

        let snakeX = this.snake[0].x;
        let snakeY = this.snake[0].y;

        if (this.d == 'LEFT') snakeX -= this.box;
        if (this.d == 'UP') snakeY -= this.box;
        if (this.d == 'RIGHT') snakeX += this.box;
        if (this.d == 'DOWN') snakeY += this.box;

        if (snakeX == this.food.x && snakeY == this.food.y) {
            this.score++;
            this.spawnFood();
            this.updateScoreDisplay();
        } else {
            this.snake.pop();
        }

        let newHead = {
            x: snakeX,
            y: snakeY
        };

        if (snakeX < 0 || snakeY < 0 || snakeX >= this.canvas.width || snakeY >= this.canvas.height || this.collision(newHead, this.snake)) {
            clearInterval(this.game);
            this.gameOver();
        }

        this.snake.unshift(newHead);
    }

    updateScoreDisplay() {
        document.getElementById('score').innerText = `Score: ${this.score}`;
        document.getElementById('highScore').innerText = `High Score: ${this.highScore}`;
    }

    gameOver() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
        }
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '50px Arial';
        this.ctx.fillText('Game Over', this.canvas.width / 2 - 120, this.canvas.height / 2 - 20);
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Your Score: ${this.score}`, this.canvas.width / 2 - 50, this.canvas.height / 2 + 20);

        const restartButton = document.createElement('button');
        restartButton.textContent = 'Play Again';
        restartButton.onclick = () => {
            document.body.removeChild(restartButton);
            this.init();
        };
        document.body.appendChild(restartButton);
    }
}

window.onload = () => new Game('gameCanvas');
