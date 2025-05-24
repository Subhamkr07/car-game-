const score = document.querySelector(".score");
const startScreen = document.querySelector(".startScreen");
const gameArea = document.querySelector(".gameArea");

document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

let player = {
  speed: 3,
};

startScreen.addEventListener("click", startGame);

let keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
};

function keyDown(e) {
  e.preventDefault();
  keys[e.key] = true;
}
function keyUp(e) {
  e.preventDefault();
  keys[e.key] = false;
}

function gamePlay() {
  let car = document.querySelector(".car");
  let road = gameArea.getBoundingClientRect();

  if (player.start) {
    moveLines();
    moveEnemyCar(car);

    // Car movement based on key presses or active touch controls
    if (keys.ArrowUp && player.y > road.top + 150) {
      player.y -= player.speed;
    }
    if (keys.ArrowDown && player.y < road.bottom - 80) {
      player.y += player.speed;
    }
    if (keys.ArrowLeft && player.x > 0) {
      player.x -= player.speed;
    }
    if (keys.ArrowRight && player.x < road.width - 70) {
      player.x += player.speed;
    }

    car.style.top = `${player.y}px`;
    car.style.left = `${player.x}px`;

    player.score += 0.1; // slower score
    player.speed = 3 + Math.floor(player.score / 150); // slower speed growth
    score.innerHTML = "Score: " + Math.floor(player.score);

    window.requestAnimationFrame(gamePlay);
  }
}

function moveLines() {
  let lines = document.querySelectorAll(".line");
  lines.forEach((line) => {
    if (line.y >= 700) {
      line.y -= 750;
    }
    line.y += player.speed;
    line.style.top = line.y + "px";
  });
}

function isCollide(car, enemyCar) {
  carRect = car.getBoundingClientRect();
  enemyCarRect = enemyCar.getBoundingClientRect();

  return !(
    carRect.top > enemyCarRect.bottom ||
    carRect.left > enemyCarRect.right ||
    carRect.right < enemyCarRect.left ||
    carRect.bottom < enemyCarRect.top
  );
}

function moveEnemyCar(car) {
  let enemyCars = document.querySelectorAll(".enemyCar");
  enemyCars.forEach((enemyCar) => {
    if (isCollide(car, enemyCar)) {
      endGame();
    }

    if (enemyCar.y >= 750) {
      enemyCar.y = -300;

      // Targeted spawn
      let targetX = player.x + Math.floor(Math.random() * 100 - 50);
      targetX = Math.max(0, Math.min(targetX, gameArea.offsetWidth - 40));
      enemyCar.style.left = targetX + "px";
    }

    enemyCar.y += player.speed;
    enemyCar.style.top = enemyCar.y + "px";
  });
}

function startGame() {
  score.classList.remove("hide");
  startScreen.classList.add("hide");
  gameArea.innerHTML = "";

  player.start = true;
  player.score = 0;
  player.speed = 3;
  window.requestAnimationFrame(gamePlay);

  for (let i = 0; i < 5; i++) {
    let roadLine = document.createElement("div");
    roadLine.setAttribute("class", "line");
    roadLine.y = i * 150;
    roadLine.style.top = roadLine.y + "px";
    gameArea.appendChild(roadLine);
  }

  let car = document.createElement("div");
  car.setAttribute("class", "car");

  gameArea.appendChild(car);

  player.x = car.offsetLeft;
  player.y = car.offsetTop;

  let maxX = gameArea.offsetWidth - 40;

  for (let i = 0; i < 3; i++) {
    let enemyCar = document.createElement("div");
    enemyCar.setAttribute("class", "enemyCar");
    enemyCar.y = (i + 1) * 350 * -1;
    enemyCar.style.top = enemyCar.y + "px";
    enemyCar.style.backgroundImage = `url("./images/car${i + 1}.png")`;

    let targetX = player.x + Math.floor(Math.random() * 100 - 50);
    targetX = Math.max(0, Math.min(targetX, maxX));
    enemyCar.style.left = targetX + "px";

    gameArea.appendChild(enemyCar);
  }
}

function endGame() {
  player.start = false;
  startScreen.classList.remove("hide");
}

// Prevent default touch behavior for smoother game experience
document.body.addEventListener("touchmove", function (e) {
  e.preventDefault();
}, { passive: false });

let touchIdentifier = null; // To track a single touch for continuous movement

gameArea.addEventListener("touchstart", function (e) {
  // Only handle the first touch if multiple touches occur
  if (e.touches.length === 1) {
    touchIdentifier = e.touches[0].identifier; // Store the identifier of the touch
    handleTouchMove(e.touches[0]);
  }
}, false);

gameArea.addEventListener("touchmove", function (e) {
  // Find the touch that started the movement
  for (let i = 0; i < e.changedTouches.length; i++) {
    if (e.changedTouches[i].identifier === touchIdentifier) {
      handleTouchMove(e.changedTouches[i]);
      break;
    }
  }
}, false);

gameArea.addEventListener("touchend", function (e) {
  // Reset all keys to false when touch ends
  for (let i = 0; i < e.changedTouches.length; i++) {
    if (e.changedTouches[i].identifier === touchIdentifier) {
      keys.ArrowUp = false;
      keys.ArrowDown = false;
      keys.ArrowLeft = false;
      keys.ArrowRight = false;
      touchIdentifier = null; // Clear the touch identifier
      break;
    }
  }
}, false);

function handleTouchMove(touch) {
  let touchX = touch.clientX;
  let touchY = touch.clientY;

  let car = document.querySelector(".car");
  let carRect = car.getBoundingClientRect();
  let gameAreaRect = gameArea.getBoundingClientRect();

  // Calculate the center of the car
  let carCenterX = carRect.left + carRect.width / 2;
  let carCenterY = carRect.top + carRect.height / 2;

  // Determine movement based on touch position relative to the car's center
  // Horizontal movement
  if (touchX < carCenterX - 20) { // If touch is significantly to the left of the car
    keys.ArrowLeft = true;
    keys.ArrowRight = false;
  } else if (touchX > carCenterX + 20) { // If touch is significantly to the right of the car
    keys.ArrowRight = true;
    keys.ArrowLeft = false;
  } else { // If touch is horizontally aligned with the car, stop horizontal movement
    keys.ArrowLeft = false;
    keys.ArrowRight = false;
  }

  // Vertical movement
  if (touchY < carCenterY - 20) { // If touch is significantly above the car
    keys.ArrowUp = true;
    keys.ArrowDown = false;
  } else if (touchY > carCenterY + 20) { // If touch is significantly below the car
    keys.ArrowDown = true;
    keys.ArrowUp = false;
  } else { // If touch is vertically aligned with the car, stop vertical movement
    keys.ArrowUp = false;
    keys.ArrowDown = false;
  }
}

