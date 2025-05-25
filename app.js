const score = document.querySelector(".score");
const startScreen = document.querySelector(".startScreen");
const gameArea = document.querySelector(".gameArea");
const modeScreen = document.querySelector(".modeSelectScreen");
const touchBtn = document.getElementById("touchMode");
const arrowBtn = document.getElementById("arrowMode");
const controls = document.querySelector(".controls");
const gameOverScreen = document.querySelector(".gameOverScreen");
const finalScoreSpan = document.getElementById("finalScore");
const countdownOverlay = document.getElementById("countdownOverlay");

let useTouch = true;
let modeSelected = false;

let player = {
  speed: 3,
};

let keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
};

document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

function keyDown(e) {
  e.preventDefault();
  keys[e.key] = true;
}
function keyUp(e) {
  e.preventDefault();
  keys[e.key] = false;
}

// Show countdown overlay before game start
function showCountdown(callback) {
  let count = 3;
  countdownOverlay.innerText = count;
  countdownOverlay.style.display = "flex";
  let countdown = setInterval(() => {
    count--;
    if (count === 0) {
      countdownOverlay.innerText = "GO!";
    } else if (count < 0) {
      clearInterval(countdown);
      countdownOverlay.style.display = "none";
      callback();
    } else {
      countdownOverlay.innerText = count;
    }
  }, 1000);
}

// Handle start and restart
touchBtn.addEventListener("click", () => {
  useTouch = true;
  modeSelected = true;
  modeScreen.classList.add("hide");
  controls.classList.add("hide");
  showCountdown(startGame);
});

arrowBtn.addEventListener("click", () => {
  useTouch = false;
  modeSelected = true;
  modeScreen.classList.add("hide");
  controls.classList.remove("hide");
  showCountdown(startGame);
});

document.querySelector(".startButton").addEventListener("click", () => {
  startScreen.classList.add("hide");
  if (!modeSelected) {
    modeScreen.classList.remove("hide");
  } else {
    showCountdown(startGame);
  }
});

document.querySelector(".restartButton").addEventListener("click", () => {
  gameOverScreen.classList.add("hide");
  showCountdown(startGame);
});

// Start game logic
function startGame() {
  score.classList.remove("hide");
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

// Game Loop
function gamePlay() {
  let car = document.querySelector(".car");
  let road = gameArea.getBoundingClientRect();

  if (player.start) {
    moveLines();
    moveEnemyCar(car);

    if (keys.ArrowUp && player.y > road.top + 150) player.y -= player.speed;
    if (keys.ArrowDown && player.y < road.bottom - 80) player.y += player.speed;
    if (keys.ArrowLeft && player.x > 0) player.x -= player.speed;
    if (keys.ArrowRight && player.x < road.width - 70) player.x += player.speed;

    car.style.top = `${player.y}px`;
    car.style.left = `${player.x}px`;

    player.score += 0.1;
    player.speed = 3 + Math.floor(player.score / 150);
    score.innerHTML = "Score: " + Math.floor(player.score);

    window.requestAnimationFrame(gamePlay);
  }
}

// Enemy car movement
function moveEnemyCar(car) {
  document.querySelectorAll(".enemyCar").forEach((enemyCar) => {
    if (isCollide(car, enemyCar)) {
      endGame();
    }
    if (enemyCar.y >= 750) {
      enemyCar.y = -300;
      let targetX = player.x + Math.floor(Math.random() * 100 - 50);
      targetX = Math.max(0, Math.min(targetX, gameArea.offsetWidth - 40));
      enemyCar.style.left = targetX + "px";
    }
    enemyCar.y += player.speed;
    enemyCar.style.top = enemyCar.y + "px";
  });
}

// Collision detection
function isCollide(car, enemyCar) {
  let c = car.getBoundingClientRect();
  let e = enemyCar.getBoundingClientRect();
  return !(
    c.top > e.bottom || c.left > e.right || c.right < e.left || c.bottom < e.top
  );
}

// Road line movement
function moveLines() {
  document.querySelectorAll(".line").forEach((line) => {
    if (line.y >= 700) line.y -= 750;
    line.y += player.speed;
    line.style.top = line.y + "px";
  });
}

// End game logic
function endGame() {
  player.start = false;
  finalScoreSpan.textContent = Math.floor(player.score);
  gameOverScreen.classList.remove("hide");
}

// Disable scrolling on mobile
document.body.addEventListener("touchmove", (e) => e.preventDefault(), { passive: false });

// Arrow button controls
if (controls) {
  document.querySelector(".up").addEventListener("touchstart", () => keys.ArrowUp = true);
  document.querySelector(".down").addEventListener("touchstart", () => keys.ArrowDown = true);
  document.querySelector(".left").addEventListener("touchstart", () => keys.ArrowLeft = true);
  document.querySelector(".right").addEventListener("touchstart", () => keys.ArrowRight = true);

  document.querySelectorAll(".control-button").forEach(btn => {
    btn.addEventListener("touchend", () => {
      keys.ArrowUp = false;
      keys.ArrowDown = false;
      keys.ArrowLeft = false;
      keys.ArrowRight = false;
    });
  });
}

// Swipe touch control
let touchStartX = 0;
let touchStartY = 0;
const swipeThreshold = 30;

gameArea.addEventListener("touchstart", function (e) {
  if (useTouch && e.touches.length === 1) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    keys.ArrowUp = false;
    keys.ArrowDown = false;
    keys.ArrowLeft = false;
    keys.ArrowRight = false;
  }
}, false);

gameArea.addEventListener("touchend", function (e) {
  if (useTouch && e.changedTouches.length === 1) {
    let touchEndX = e.changedTouches[0].clientX;
    let touchEndY = e.changedTouches[0].clientY;
    let diffX = touchEndX - touchStartX;
    let diffY = touchEndY - touchStartY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > swipeThreshold) {
      if (diffX > 0) {
        keys.ArrowRight = true;
        setTimeout(() => (keys.ArrowRight = false), 100);
      } else {
        keys.ArrowLeft = true;
        setTimeout(() => (keys.ArrowLeft = false), 100);
      }
    } else if (Math.abs(diffY) > swipeThreshold) {
      if (diffY > 0) {
        keys.ArrowDown = true;
        setTimeout(() => (keys.ArrowDown = false), 100);
      } else {
        keys.ArrowUp = true;
        setTimeout(() => (keys.ArrowUp = false), 100);
      }
    }
  }
}, false);


// Splash Animation Logic
document.addEventListener('DOMContentLoaded', () => {
  const logoSplash = document.getElementById('logo-splash');
  const logoImg = logoSplash.querySelector('img');
  const carGameElement = document.querySelector('.carGame'); // Get the game container

  const introText = document.createElement('div');
  introText.id = 'intro-text';
  introText.textContent = 'Prepare to Enter a New World';
  logoSplash.appendChild(introText);

  const loadingText = document.createElement('div');
  loadingText.id = 'loading-text';
  loadingText.textContent = 'Loading';
  logoSplash.appendChild(loadingText);

  introText.classList.add('animate-in');
  loadingText.style.opacity = '1';

  let dotCount = 0;
  const maxDots = 3;
  const loadingInterval = setInterval(() => {
    dotCount = (dotCount % (maxDots + 1));
    const dots = '.'.repeat(dotCount);
    loadingText.textContent = 'Loading' + dots;
    dotCount++;
  }, 300);

  const loadingPhaseDuration = 2500; // Duration for loading text and crack effect start

  setTimeout(() => {
    clearInterval(loadingInterval);
    loadingText.classList.add('fade-out');

    // Introduce crack effect from the center of the logo after a slight delay
    setTimeout(() => {
      const crackEffect = document.createElement('div');
      crackEffect.classList.add('crack-effect');
      logoSplash.appendChild(crackEffect);

      // Position the crack effect to originate from the center of the logo
      // This is handled by CSS (left: 50%; top: 50%; transform: translate(-50%, -50%))
      crackEffect.style.opacity = '1';

      // Logo appears and scales
      setTimeout(() => {
        logoImg.style.opacity = '1';
        logoImg.style.transform = 'scale(1)';

        // Logo stays on screen for 3.5 seconds after appearing fully
        setTimeout(() => {
            // Text parts animate out
            const words = introText.textContent.split(' ');
            const middle = Math.ceil(words.length / 2);
            introText.innerHTML = `<span class="intro-text-part part-left">${words.slice(0, middle).join(' ')}</span><span class="intro-text-part part-right">${words.slice(middle).join(' ')}</span>`;

            const partLeft = introText.querySelector('.part-left');
            const partRight = introText.querySelector('.part-right');
            partLeft.style.transform = 'translateX(-150vw)';
            partRight.style.transform = 'translateX(150vw)';
            partLeft.style.opacity = '0';
            partRight.style.opacity = '0';

            // Fade out the entire splash screen
            setTimeout(() => {
                logoSplash.style.opacity = '0';
                setTimeout(() => {
                    logoSplash.style.display = 'none';
                    carGameElement.classList.remove('hide-initial'); // Show the game
                }, 1000); // Duration of the fade-out transition
            }, 1200); // Delay before fading out after text parts animate out
        }, 3500); // Logo stays for 3.5 seconds
      }, 300); // Delay for logo to start appearing after crack
    }, 500); // Delay before crack effect starts
  }, loadingPhaseDuration);
});
