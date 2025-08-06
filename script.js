// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// UI elements
const scoreElement = document.createElement('div');
scoreElement.style.position = 'absolute';
scoreElement.style.top = '10px';
scoreElement.style.left = '10px';
scoreElement.style.color = 'white';
scoreElement.style.fontFamily = 'Arial';
scoreElement.style.fontSize = '24px';
document.body.appendChild(scoreElement);

const gameOverElement = document.createElement('div');
gameOverElement.style.position = 'absolute';
gameOverElement.style.top = '50%';
gameOverElement.style.left = '50%';
gameOverElement.style.transform = 'translate(-50%, -50%)';
gameOverElement.style.color = 'white';
gameOverElement.style.fontFamily = 'Arial';
gameOverElement.style.fontSize = '48px';
gameOverElement.style.display = 'none';
document.body.appendChild(gameOverElement);

const restartButton = document.createElement('button');
restartButton.textContent = 'Play Again';
restartButton.style.position = 'absolute';
restartButton.style.top = '60%';
restartButton.style.left = '50%';
restartButton.style.transform = 'translate(-50%, -50%)';
restartButton.style.display = 'none';
restartButton.onclick = () => {
    gameOverElement.style.display = 'none';
    restartButton.style.display = 'none';
    init();
};
document.body.appendChild(restartButton);


// Basic lighting
const ambientLight = new THREE.AmbientLight(0x606060);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Game area
const gameAreaSize = 20;
const gameAreaGeometry = new THREE.BoxGeometry(gameAreaSize, gameAreaSize, gameAreaSize);
const gameAreaMaterial = new THREE.MeshStandardMaterial({ color: 0x1e90ff, wireframe: true, transparent: true, opacity: 0.1 });
const gameArea = new THREE.Mesh(gameAreaGeometry, gameAreaMaterial);
gameArea.receiveShadow = true;
scene.add(gameArea);

// Snake
let snake = [];
const snakeGeometry = new THREE.BoxGeometry(1, 1, 1);
const snakeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
let direction = new THREE.Vector3(1, 0, 0);

// Food
const foodGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const foodMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
let food = new THREE.Mesh(foodGeometry, foodMaterial);
food.castShadow = true;

// Game state
let score = 0;
let gameOver = false;

function init() {
    // Reset snake
    snake.forEach(segment => scene.remove(segment));
    snake = [];
    const head = new THREE.Mesh(snakeGeometry, snakeMaterial);
    head.position.set(0, 0, 0);
    head.castShadow = true;
    snake.push(head);
    scene.add(head);

    // Reset food
    spawnFood();

    // Reset game state
    score = 0;
    updateScore();
    gameOver = false;
    direction.set(1, 0, 0);
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animate();
}

function spawnFood() {
    if (food) scene.remove(food);
    food = new THREE.Mesh(foodGeometry, foodMaterial);
    food.position.set(
        Math.floor(Math.random() * gameAreaSize) - gameAreaSize / 2,
        Math.floor(Math.random() * gameAreaSize) - gameAreaSize / 2,
        Math.floor(Math.random() * gameAreaSize) - gameAreaSize / 2
    );
    scene.add(food);
}

function updateScore() {
    scoreElement.textContent = `Score: ${score}`;
}

// Controls
document.addEventListener('keydown', (event) => {
    if (gameOver) return;
    switch (event.key) {
        case 'ArrowUp':
            if (direction.y === 0) direction.set(0, 1, 0);
            break;
        case 'ArrowDown':
            if (direction.y === 0) direction.set(0, -1, 0);
            break;
        case 'ArrowLeft':
            if (direction.x === 0) direction.set(-1, 0, 0);
            break;
        case 'ArrowRight':
            if (direction.x === 0) direction.set(1, 0, 0);
            break;
        case 'q':
            if (direction.z === 0) direction.set(0, 0, -1);
            break;
        case 'a':
            if (direction.z === 0) direction.set(0, 0, 1);
            break;
    }
});

camera.position.z = 30;
let lastUpdateTime = 0;
const updateInterval = 200; // ms
let animationFrameId;

function animate(currentTime = 0) {
    animationFrameId = requestAnimationFrame(animate);

    if (gameOver) {
        gameOverElement.textContent = 'Game Over';
        gameOverElement.style.display = 'block';
        restartButton.style.display = 'block';
        return;
    }

    const deltaTime = currentTime - lastUpdateTime;
    if (deltaTime > updateInterval) {
        lastUpdateTime = currentTime;

        const head = snake[0];
        const newHead = new THREE.Mesh(snakeGeometry, snakeMaterial);
        newHead.position.copy(head.position).add(direction);
        newHead.castShadow = true;

        // Wall collision
        if (Math.abs(newHead.position.x) > gameAreaSize / 2 || Math.abs(newHead.position.y) > gameAreaSize / 2 || Math.abs(newHead.position.z) > gameAreaSize / 2) {
            gameOver = true;
            return;
        }

        // Self collision
        for (let i = 1; i < snake.length; i++) {
            if (newHead.position.equals(snake[i].position)) {
                gameOver = true;
                return;
            }
        }

        snake.unshift(newHead);
        scene.add(newHead);

        // Food collision
        if (newHead.position.distanceTo(food.position) < 1) {
            score++;
            updateScore();
            spawnFood();
        } else {
            const tail = snake.pop();
            scene.remove(tail);
        }
    }

    renderer.render(scene, camera);
}

// Handle window resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

init();
