// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.setClearColor(0x87ceeb); // Sky blue background
renderer.domElement.id = 'mainCanvas';
document.body.appendChild(renderer.domElement);

// UI Elements
const uiContainer = document.createElement('div');
uiContainer.style.position = 'absolute';
uiContainer.style.top = '0';
uiContainer.style.left = '0';
uiContainer.style.width = '100%';
uiContainer.style.height = '100%';
uiContainer.style.pointerEvents = 'none';
document.body.appendChild(uiContainer);

const interactionPrompt = document.createElement('div');
interactionPrompt.style.position = 'absolute';
interactionPrompt.style.bottom = '20px';
interactionPrompt.style.left = '50%';
interactionPrompt.style.transform = 'translateX(-50%)';
interactionPrompt.style.color = 'white';
interactionPrompt.style.backgroundColor = 'rgba(0,0,0,0.5)';
interactionPrompt.style.padding = '10px';
interactionPrompt.style.borderRadius = '5px';
interactionPrompt.style.fontFamily = 'Arial';
interactionPrompt.style.fontSize = '24px';
interactionPrompt.style.display = 'none';
uiContainer.appendChild(interactionPrompt);

const infoModal = document.createElement('div');
infoModal.style.position = 'absolute';
infoModal.style.top = '50%';
infoModal.style.left = '50%';
infoModal.style.transform = 'translate(-50%, -50%)';
infoModal.style.backgroundColor = 'rgba(0,0,0,0.8)';
infoModal.style.color = 'white';
infoModal.style.padding = '20px';
infoModal.style.border = '2px solid white';
infoModal.style.borderRadius = '10px';
infoModal.style.display = 'none';
infoModal.style.pointerEvents = 'auto';
uiContainer.appendChild(infoModal);

const infoTitle = document.createElement('h2');
infoModal.appendChild(infoTitle);

const infoDescription = document.createElement('p');
infoModal.appendChild(infoDescription);

const closeInfoModalButton = document.createElement('button');
closeInfoModalButton.textContent = 'Close';
closeInfoModalButton.style.marginTop = '10px';
closeInfoModalButton.onclick = () => {
    infoModal.style.display = 'none';
};
infoModal.appendChild(closeInfoModalButton);

const miniMap = document.createElement('canvas');
miniMap.width = 200;
miniMap.height = 200;
miniMap.style.position = 'absolute';
miniMap.style.bottom = '20px';
miniMap.style.right = '20px';
miniMap.style.border = '2px solid white';
miniMap.style.backgroundColor = 'rgba(0,0,0,0.5)';
uiContainer.appendChild(miniMap);
const miniMapCtx = miniMap.getContext('2d');

// Audio
const listener = new THREE.AudioListener();
camera.add(listener);

const ambientSound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();
audioLoader.load('https://threejs.org/examples/sounds/ambient.ogg', (buffer) => {
    ambientSound.setBuffer(buffer);
    ambientSound.setLoop(true);
    ambientSound.setVolume(0.5);
    ambientSound.play();
});


// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(100, 100, 50);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

// Ground
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.8 });
const groundGeometry = new THREE.PlaneGeometry(200, 200);
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Skybox
const skyboxLoader = new THREE.CubeTextureLoader();
const skyboxTexture = skyboxLoader.load([
    'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/pos-x.jpg',
    'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/neg-x.jpg',
    'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/pos-y.jpg',
    'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/neg-y.jpg',
    'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/pos-z.jpg',
    'https://threejsfundamentals.org/threejs/resources/images/cubemaps/computer-history-museum/neg-z.jpg',
]);
scene.background = skyboxTexture;

// City layout
const buildings = [];
const buildingMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.5, roughness: 0.3 });
const buildingGeometry = new THREE.BoxGeometry(10, 20, 10);

function createBuilding(x, z, project) {
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.set(x, 10, z);
    building.castShadow = true;
    building.receiveShadow = true;
    building.userData.project = project;
    scene.add(building);
    buildings.push(building);
}

createBuilding(-30, -30, { title: 'Project 1', description: 'This is the first project.', url: '#' });
createBuilding(30, -30, { title: 'Project 2', description: 'This is the second project.', url: '#' });
createBuilding(-30, 30, { title: 'Project 3', description: 'This is the third project.', url: '#' });
createBuilding(30, 30, { title: 'Project 4', description: 'This is the fourth project.', url: '#' });

// Info Hotspots
const hotspots = [];
const hotspotGeometry = new THREE.TorusGeometry(1, 0.3, 16, 100);
const hotspotMaterial = new THREE.MeshStandardMaterial({ color: 0x00ffff, emissive: 0x00ffff });

function createHotspot(x, z, info) {
    const hotspot = new THREE.Mesh(hotspotGeometry, hotspotMaterial);
    hotspot.position.set(x, 2, z);
    hotspot.userData.info = info;
    scene.add(hotspot);
    hotspots.push(hotspot);
}

createHotspot(0, -20, { title: 'Skills', description: 'JavaScript, Three.js, WebGL' });
createHotspot(-20, 0, { title: 'Experience', description: '10 years of experience in game development.' });
createHotspot(20, 0, { title: 'About Me', description: 'I am a passionate game developer.' });


// Player (Visitor)
const playerGeometry = new THREE.SphereGeometry(1, 32, 32);
const playerMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffff00 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.set(0, 1, 0);
player.castShadow = true;
scene.add(player);

// Controls
const moveDirection = {
    forward: false,
    backward: false,
    left: false,
    right: false
};

let interactable = null;

document.addEventListener('keydown', (event) => {
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
        case 'e':
            if (interactable) {
                if (interactable.userData.project) {
                    const project = interactable.userData.project;
                    infoTitle.textContent = project.title;
                    infoDescription.textContent = project.description;
                    infoModal.style.display = 'block';
                } else if (interactable.userData.info) {
                    const info = interactable.userData.info;
                    infoTitle.textContent = info.title;
                    infoDescription.textContent = info.description;
                    infoModal.style.display = 'block';
                }
            }
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

const clock = new THREE.Clock();
const playerSpeed = 10;

function updateMiniMap() {
    miniMapCtx.clearRect(0, 0, miniMap.width, miniMap.height);
    const mapScale = 1;
    const mapCenterX = miniMap.width / 2;
    const mapCenterY = miniMap.height / 2;

    // Draw buildings
    miniMapCtx.fillStyle = 'grey';
    buildings.forEach(building => {
        const x = mapCenterX + building.position.x * mapScale;
        const y = mapCenterY + building.position.z * mapScale;
        miniMapCtx.fillRect(x - 5, y - 5, 10, 10);
    });

    // Draw hotspots
    miniMapCtx.fillStyle = 'cyan';
    hotspots.forEach(hotspot => {
        const x = mapCenterX + hotspot.position.x * mapScale;
        const y = mapCenterY + hotspot.position.z * mapScale;
        miniMapCtx.beginPath();
        miniMapCtx.arc(x, y, 3, 0, Math.PI * 2);
        miniMapCtx.fill();
    });

    // Draw player
    miniMapCtx.fillStyle = 'yellow';
    const playerX = mapCenterX + player.position.x * mapScale;
    const playerY = mapCenterY + player.position.z * mapScale;
    miniMapCtx.beginPath();
    miniMapCtx.arc(playerX, playerY, 5, 0, Math.PI * 2);
    miniMapCtx.fill();
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    const moveVector = new THREE.Vector3();
    if (moveDirection.forward) moveVector.z -= 1;
    if (moveDirection.backward) moveVector.z += 1;
    if (moveDirection.left) moveVector.x -= 1;
    if (moveDirection.right) moveVector.x += 1;

    if (moveVector.length() > 0) {
        moveVector.normalize();
        player.position.add(moveVector.multiplyScalar(playerSpeed * delta));
    }

    // Camera follows player
    const cameraOffset = new THREE.Vector3(0, 10, 15);
    const cameraPosition = player.position.clone().add(cameraOffset);
    camera.position.lerp(cameraPosition, 0.1);
    camera.lookAt(player.position);

    // Check for interaction
    interactable = null;
    let closestDist = Infinity;

    for (const building of buildings) {
        const dist = player.position.distanceTo(building.position);
        if (dist < 15 && dist < closestDist) {
            closestDist = dist;
            interactable = building;
        }
    }

    for (const hotspot of hotspots) {
        const dist = player.position.distanceTo(hotspot.position);
        if (dist < 5 && dist < closestDist) {
            closestDist = dist;
            interactable = hotspot;
        }
    }

    if (interactable) {
        interactionPrompt.style.display = 'block';
        interactionPrompt.innerHTML = `Press "E" to interact with ${interactable.userData.project ? interactable.userData.project.title : interactable.userData.info.title}`;
    } else {
        interactionPrompt.style.display = 'none';
    }

    updateMiniMap();
    renderer.render(scene, camera);
}

animate();

// Handle window resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
