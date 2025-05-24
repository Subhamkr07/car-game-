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

let touchStartX = 0;
let touchStartY = 0;
const swipeThreshold = 30; // Minimum distance for a swipe to be registered

gameArea.addEventListener("touchstart", function (e) {
  if (e.touches.length === 1) { // Only consider single touch for swipe
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;

    // Reset all keys on touch start to prevent sticky movement
    keys.ArrowUp = false;
    keys.ArrowDown = false;
    keys.ArrowLeft = false;
    keys.ArrowRight = false;
  }
}, false);

gameArea.addEventListener("touchend", function (e) {
  // Only process if it was a single touch that ended
  if (e.changedTouches.length === 1) {
    let touchEndX = e.changedTouches[0].clientX;
    let touchEndY = e.changedTouches[0].clientY;

    let diffX = touchEndX - touchStartX;
    let diffY = touchEndY - touchStartY;

    // Determine if it was a significant swipe
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > swipeThreshold) {
      // Horizontal swipe
      if (diffX > 0) {
        // Swipe Right
        keys.ArrowRight = true;
        setTimeout(() => (keys.ArrowRight = false), 150); // Keep active for a short duration
      } else {
        // Swipe Left
        keys.ArrowLeft = true;
        setTimeout(() => (keys.ArrowLeft = false), 150); // Keep active for a short duration
      }
    } else if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > swipeThreshold) {
      // Vertical swipe
      if (diffY > 0) {
        // Swipe Down
        keys.ArrowDown = true;
        setTimeout(() => (keys.ArrowDown = false), 150); // Keep active for a short duration
      } else {
        // Swipe Up
        keys.ArrowUp = true;
        setTimeout(() => (keys.ArrowUp = false), 150); // Keep active for a short duration
      }
    }
  }
}, false);


