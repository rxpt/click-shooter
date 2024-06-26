document.addEventListener("DOMContentLoaded", function () {
  // Constants
  const PAGE_WIDTH = window.innerWidth;
  const PAGE_HEIGHT = window.innerHeight;
  const ENEMY_RESPAWN_TIME = 4000;
  const ENEMY_MOVEMENT_TIME = 4000;
  const PLAYER_MOVEMENT_TIME = 100;
  const LASER_VELOCITY = 700;

  // Elements
  const scoreElement = document.querySelector(".score");
  const playerElement = document.querySelector(".player");
  const laserElement = document.querySelector(".laser");
  const bodyElement = document.body;

  // Game State Variables
  let enemyElement,
    enemyTimeout,
    scoreGame = 0,
    inAction = false;

  // --- Functions ---
  function laserShot(position = 50) {
    if (inAction) return;

    inAction = true;
    position = Math.max(0, Math.min(100, position));

    const playerTop =
      ((PAGE_HEIGHT - playerElement.offsetHeight) / 100) * position;
    animate(playerElement, { top: playerTop }, PLAYER_MOVEMENT_TIME, () => {
      animate(laserElement, { left: PAGE_WIDTH }, LASER_VELOCITY, () => {
        laserElement.removeAttribute("style");
        inAction = false;
      });
    });
  }

  function spawnEnemy() {
    const topPos = () => rand(0, PAGE_HEIGHT - enemyElement.offsetHeight);
    enemyElement = document.createElement("div");
    enemyElement.classList.add("enemy");
    enemyElement.style.top = topPos() + "px";
    bodyElement.appendChild(enemyElement);

    (function enemyAnimate() {
      animate(
        enemyElement,
        { opacity: 1, top: topPos(), right: rand(0, PAGE_WIDTH / 4) },
        ENEMY_MOVEMENT_TIME
      );
      enemyTimeout = setTimeout(enemyAnimate, ENEMY_MOVEMENT_TIME * 0.2);
    })();
  }

  function collisionDetection() {
    if (collision(laserElement, enemyElement)) {
      scoreGame++;
      scoreElement.textContent = scoreGame;

      const enemyRect = enemyElement.getBoundingClientRect();
      explode(
        enemyRect.left + enemyRect.width / 2,
        enemyRect.top + enemyRect.height / 2
      );

      enemyElement.remove();
      clearTimeout(enemyTimeout);
      setTimeout(spawnEnemy, ENEMY_RESPAWN_TIME);
    }
    setTimeout(collisionDetection, 10);
  }

  function collision(div1, div2) {
    const rect1 = div1.getBoundingClientRect();
    const rect2 = div2.getBoundingClientRect();

    return !(
      rect1.bottom < rect2.top ||
      rect1.top > rect2.bottom ||
      rect1.right < rect2.left ||
      rect1.left > rect2.right
    );
  }

  function explode(x, y) {
    const particles = 15;
    const explosionElement = document.createElement("div");
    explosionElement.classList.add("explosion");
    bodyElement.appendChild(explosionElement);

    explosionElement.style.left = x - explosionElement.offsetWidth / 2 + "px";
    explosionElement.style.top = y - explosionElement.offsetHeight / 2 + "px";

    for (let i = 0; i < particles; i++) {
      const angle = (2 * Math.PI * i) / rand(particles - 10, particles + 10);
      const radius = rand(80, 150);
      const particleX =
        explosionElement.offsetWidth / 2 + radius * Math.cos(angle);
      const particleY =
        explosionElement.offsetHeight / 2 + radius * Math.sin(angle);
      const color = `rgb(${rand(0, 255)}, ${rand(0, 255)}, ${rand(0, 255)})`;

      const particleElement = document.createElement("div");
      particleElement.classList.add("particle");
      particleElement.style.backgroundColor = color;
      particleElement.style.top = particleY + "px";
      particleElement.style.left = particleX + "px";

      if (i === 0) {
        particleElement.addEventListener("animationend", () => {
          explosionElement.remove();
        });
      }

      explosionElement.appendChild(particleElement);
    }
  }

  function rand(min, max) {
    return Math.floor(Math.random() * (max + 1)) + min;
  }

  function animate(element, properties, duration, callback) {
    let start = performance.now();

    requestAnimationFrame(function animate(time) {
      let timeFraction = (time - start) / duration;
      if (timeFraction > 1) timeFraction = 1;

      let progress = timeFraction;

      for (const property in properties) {
        let startValue = parseInt(getComputedStyle(element)[property]);
        let endValue = properties[property];
        element.style[property] =
          startValue + (endValue - startValue) * progress + "px";
      }

      if (timeFraction < 1) {
        requestAnimationFrame(animate);
      } else {
        if (callback) callback();
      }
    });
  }

  // --- Initialization ---
  spawnEnemy();
  collisionDetection();

  // --- Event Handlers ---
  bodyElement.addEventListener("click", (e) =>
    laserShot(e.clientY / (PAGE_HEIGHT / 100))
  );
  window.addEventListener("resize", () => location.reload(true));
});
