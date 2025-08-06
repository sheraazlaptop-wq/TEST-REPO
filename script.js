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

const startMenu = document.createElement('div');
startMenu.style.position = 'absolute';
startMenu.style.top = '50%';
startMenu.style.left = '50%';
startMenu.style.transform = 'translate(-50%, -50%)';
startMenu.style.textAlign = 'center';
startMenu.style.color = 'white';
startMenu.style.fontFamily = 'Arial';
document.body.appendChild(startMenu);

const titleElement = document.createElement('h1');
titleElement.textContent = '3D Snake';
startMenu.appendChild(titleElement);

const startButton = document.createElement('button');
startButton.textContent = 'Start Game';
startButton.onclick = () => {
    startMenu.style.display = 'none';
    init();
};
startMenu.appendChild(startButton);

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

// Audio
const listener = new THREE.AudioListener();
camera.add(listener);
const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();

const eatSound = new THREE.PositionalAudio(listener);
audioLoader.load('https://threejs.org/examples/sounds/ping_pong.mp3', (buffer) => {
    eatSound.setBuffer(buffer);
});

const gameOverSound = new THREE.PositionalAudio(listener);
audioLoader.load('https://threejs.org/examples/sounds/game_over.mp3', (buffer) => {
    gameOverSound.setBuffer(buffer);
});

const powerUpSound = new THREE.PositionalAudio(listener);
audioLoader.load('https://threejs.org/examples/sounds/powerup.mp3', (buffer) => {
    powerUpSound.setBuffer(buffer);
});


// Basic lighting
const ambientLight = new THREE.AmbientLight(0x606060);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Ground
const groundTexture = new THREE.TextureLoader().load('https://threejsfundamentals.org/threejs/resources/images/checker.png');
groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
groundTexture.repeat.set(10, 10);
const groundMaterial = new THREE.MeshStandardMaterial({ map: groundTexture });
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Obstacles
const obstacles = [];
const obstacleGeometry = new THREE.BoxGeometry(5, 5, 5);
const obstacleMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
for (let i = 0; i < 10; i++) {
    const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
    obstacle.position.set(
        (Math.random() - 0.5) * 100,
        2.5,
        (Math.random() - 0.5) * 100
    );
    obstacle.castShadow = true;
    obstacle.receiveShadow = true;
    scene.add(obstacle);
    obstacles.push(obstacle);
}

// Snake
let snake = [];
const snakeSegmentGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
const snakeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
let direction = new THREE.Vector3(0, 0, -1);
let velocity = new THREE.Vector3();

// Food
const foodGeometry = new THREE.SphereGeometry(0.8, 32, 32);
const foodMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
let food = new THREE.Mesh(foodGeometry, foodMaterial);
food.castShadow = true;

// Power-up
const powerUpGeometry = new THREE.TorusGeometry(0.8, 0.3, 16, 100);
const powerUpMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
let powerUp = new THREE.Mesh(powerUpGeometry, powerUpMaterial);
powerUp.castShadow = true;

// Game state
let score = 0;
let gameOver = false;
let speedBoost = false;
let speedBoostTimer = 0;
let gameStarted = false;

function init() {
    gameStarted = true;
    // Reset snake
    snake.forEach(segment => scene.remove(segment));
    snake = [];
    const head = new THREE.Mesh(snakeSegmentGeometry, snakeMaterial);
    head.position.set(0, 0.5, 0);
    head.castShadow = true;
    snake.push(head);
    scene.add(head);
    head.add(eatSound);
    head.add(gameOverSound);
    head.add(powerUpSound);


    // Reset food
    spawnFood();
    spawnPowerUp();

    // Reset game state
    score = 0;
    updateScore();
    gameOver = false;
    speedBoost = false;
    speedBoostTimer = 0;
    direction.set(0, 0, -1);
    velocity.set(0,0,0);
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    animate();
}

function spawnFood() {
    if (food) scene.remove(food);
    food = new THREE.Mesh(foodGeometry, foodMaterial);
    food.position.set(
        (Math.random() - 0.5) * 100,
        0.5,
        (Math.random() - 0.5) * 100
    );
    scene.add(food);
}

function spawnPowerUp() {
    if (powerUp) scene.remove(powerUp);
    powerUp = new THREE.Mesh(powerUpGeometry, powerUpMaterial);
    powerUp.position.set(
        (Math.random() - 0.5) * 100,
        0.5,
        (Math.random() - 0.5) * 100
    );
    scene.add(powerUp);
}

function updateScore() {
    scoreElement.textContent = `Score: ${score}`;
}

// Controls
const moveDirection = {
    forward: false,
    backward: false,
    left: false,
    right: false
};

document.addEventListener('keydown', (event) => {
    if (gameOver) return;
    switch (event.key) {
        case 'w':
        case 'ArrowUp':
            moveDirection.forward = true;
            break;
        case 's':
        case 'ArrowDown':
            moveDirection.backward = true;
            break;
        case 'a':
        case 'ArrowLeft':
            moveDirection.left = true;
            break;
        case 'd':
        case 'ArrowRight':
            moveDirection.right = true;
            break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'w':
        case 'ArrowUp':
            moveDirection.forward = false;
            break;
        case 's':
        case 'ArrowDown':
            moveDirection.backward = false;
            break;
        case 'a':
        case 'ArrowLeft':
            moveDirection.left = false;
            break;
        case 'd':
        case 'ArrowRight':
            moveDirection.right = false;
            break;
    }
});

let lastUpdateTime = 0;
const updateInterval = 100; // ms
let animationFrameId;
const clock = new THREE.Clock();

function animate() {
    animationFrameId = requestAnimationFrame(animate);
    const delta = clock.getDelta();

    if (!gameStarted) {
        renderer.render(scene, camera);
        return;
    }

    if (gameOver) {
        gameOverElement.textContent = 'Game Over';
        gameOverElement.style.display = 'block';
        restartButton.style.display = 'block';
        return;
    }

    const head = snake[0];

    // Update velocity based on input
    let speed = speedBoost ? 800.0 : 400.0;
    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    direction.z = Number(moveDirection.forward) - Number(moveDirection.backward);
    direction.x = Number(moveDirection.left) - Number(moveDirection.right);
    direction.normalize();

    if (moveDirection.forward || moveDirection.backward) velocity.z -= direction.z * speed * delta;
    if (moveDirection.left || moveDirection.right) velocity.x -= direction.x * speed * delta;

    head.position.x += velocity.x * delta;
    head.position.z += velocity.z * delta;
    head.rotation.y = Math.atan2(velocity.x, velocity.z);

    // Update camera to follow the snake
    const cameraOffset = new THREE.Vector3(0, 2, 5);
    const cameraPosition = cameraOffset.clone().applyMatrix4(head.matrixWorld);
    camera.position.copy(cameraPosition);
    camera.lookAt(head.position);

    // Speed boost timer
    if (speedBoost) {
        speedBoostTimer -= delta;
        if (speedBoostTimer <= 0) {
            speedBoost = false;
        }
    }

    const currentTime = clock.getElapsedTime() * 1000;
    if (currentTime - lastUpdateTime > updateInterval) {
        lastUpdateTime = currentTime;

        const newHead = new THREE.Mesh(snakeSegmentGeometry, snakeMaterial);
        newHead.position.copy(head.position);
        newHead.rotation.copy(head.rotation);
        newHead.castShadow = true;

        // Obstacle collision
        for (const obstacle of obstacles) {
            if (newHead.position.distanceTo(obstacle.position) < 3) {
                gameOverSound.play();
                gameOver = true;
                return;
            }
        }

        // Self collision
        for (let i = 1; i < snake.length; i++) {
            if (newHead.position.distanceTo(snake[i].position) < 1) {
                gameOverSound.play();
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
            eatSound.play();
            spawnFood();
        } else {
            const tail = snake.pop();
            scene.remove(tail);
        }

        // Power-up collision
        if (newHead.position.distanceTo(powerUp.position) < 1) {
            speedBoost = true;
            speedBoostTimer = 5; // 5 seconds
            powerUpSound.play();
            spawnPowerUp();
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

animate();
