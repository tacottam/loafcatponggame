document.addEventListener("DOMContentLoaded", function () {
  // Game Constants and Variables
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const paddleWidth = 60;
  const paddleHeight = 80;
  const paddleSpeed = 5;

  const player1Paddle = {
    x: 0,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    image: new Image(),
  };

  const player2Paddle = {
    x: canvas.width - paddleWidth,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    image: new Image(),
  };

  const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    dx: 0,
    dy: 0,
    originalSpeed: 4, // Original speed of the ball
    collidedWithPaddle: false, // Track if the ball has collided with a paddle
    speedIncreased: false, // Track if the ball speed has already increased
  };

  let player1Score = 0;
  let player2Score = 0;

  let gameMode = "one-player"; // Default to one-player mode

  const soundEffects = []; // Array to store the preloaded sound effects

  // Preload sound effects
  function preloadSoundEffects() {
    for (let i = 1; i <= 10; i++) {
      const audio = new Audio(`audio/meow${i}.mp3`);
      soundEffects.push(audio);
    }
  }

  // Play random sound effect
  function playRandomSoundEffect() {
    const soundIndex = Math.floor(Math.random() * 10);
    soundEffects[soundIndex].currentTime = 0; // Reset the audio to the beginning
    soundEffects[soundIndex].play(); // Play the sound effect
  }

  // Event Listeners
  document.addEventListener("keydown", function (event) {
    if (gameMode === "two-players") {
      // Two Players Mode Controls
      if (event.key === "a") {
        player1Paddle.dy = -paddleSpeed;
      } else if (event.key === "z") {
        player1Paddle.dy = paddleSpeed;
      } else if (event.key === "ArrowUp") {
        player2Paddle.dy = -paddleSpeed;
      } else if (event.key === "ArrowDown") {
        player2Paddle.dy = paddleSpeed;
      }
    } else if (gameMode === "one-player") {
      // One Player Mode Controls
      if (event.key === "a" || event.key === "ArrowUp") {
        player1Paddle.dy = -paddleSpeed;
      } else if (event.key === "z" || event.key === "ArrowDown") {
        player1Paddle.dy = paddleSpeed;
      }
    }
  });

  document.addEventListener("keyup", function (event) {
    if (gameMode === "two-players") {
      // Two Players Mode Controls
      if (event.key === "a" || event.key === "z") {
        player1Paddle.dy = 0;
      } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        player2Paddle.dy = 0;
      }
    } else if (gameMode === "one-player") {
      // One Player Mode Controls
      if (
        event.key === "a" ||
        event.key === "ArrowUp" ||
        event.key === "z" ||
        event.key === "ArrowDown"
      ) {
        player1Paddle.dy = 0;
      }
    }
  });

  // Button Event Listeners
  const onePlayerBtn = document.getElementById("onePlayerBtn");
  const twoPlayersBtn = document.getElementById("twoPlayersBtn");
  const startBtn = document.getElementById("startBtn");

  onePlayerBtn.addEventListener("click", function () {
    gameMode = "one-player";
    resetGame();
  });

  twoPlayersBtn.addEventListener("click", function () {
    gameMode = "two-players";
    resetGame();
  });

  startBtn.addEventListener("click", function () {
    startGame();
  });

  // Game Functions
  function update() {
    movePaddles();
    checkPaddleCollision();
    moveBall(); // Move the ball after checking paddle collision
    checkBoundaryCollision();
    updateScore();
  }

  function movePaddles() {
    player1Paddle.y += player1Paddle.dy;

    if (gameMode === "two-players") {
      player2Paddle.y += player2Paddle.dy;

      // Limit Player 2 paddle movement within the game board
      if (player2Paddle.y < 0) {
        player2Paddle.y = 0;
      } else if (player2Paddle.y + player2Paddle.height > canvas.height) {
        player2Paddle.y = canvas.height - player2Paddle.height;
      }
    } else if (gameMode === "one-player") {
      // Computer Paddle Movement
      if (ball.y < player2Paddle.y + player2Paddle.height / 2) {
        player2Paddle.y -= paddleSpeed * 0.5; // Adjusted speed for easier gameplay
      } else {
        player2Paddle.y += paddleSpeed * 0.5; // Adjusted speed for easier gameplay
      }

      // Limit Player 2 paddle movement within the game board
      if (player2Paddle.y < 0) {
        player2Paddle.y = 0;
      } else if (player2Paddle.y + player2Paddle.height > canvas.height) {
        player2Paddle.y = canvas.height - player2Paddle.height;
      }
    }

    // Limit Player 1 paddle movement within the game board
    if (player1Paddle.y < 0) {
      player1Paddle.y = 0;
    } else if (player1Paddle.y + player1Paddle.height > canvas.height) {
      player1Paddle.y = canvas.height - player1Paddle.height;
    }
  }

  function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Increase the ball speed once if it hasn't already increased
    if (!ball.speedIncreased) {
      ball.dx *= 1.4; // Increase the horizontal speed by 10%
      ball.dy *= 1.4; // Increase the vertical speed by 10%
      ball.speedIncreased = true; // Set the flag to indicate that the speed has increased
    }
  }

  function checkBoundaryCollision() {
    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
      ball.dy *= -1;
      playRandomSoundEffect();
    }

    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
      if (ball.x + ball.radius > canvas.width) {
        player1Score++;
      } else {
        player2Score++;
      }
      resetBall();
    }
  }

  function checkPaddleCollision() {
    if (
      ball.x - ball.radius < player1Paddle.x + player1Paddle.width &&
      ball.x + ball.radius > player1Paddle.x &&
      ball.y > player1Paddle.y &&
      ball.y < player1Paddle.y + player1Paddle.height
    ) {
      playRandomSoundEffect();
      ball.dx *= -1;
      ball.collidedWithPaddle = true; // Set collidedWithPaddle to true
    }

    if (
      ball.x - ball.radius < player2Paddle.x + player2Paddle.width &&
      ball.x + ball.radius > player2Paddle.x &&
      ball.y > player2Paddle.y &&
      ball.y < player2Paddle.y + player2Paddle.height
    ) {
      playRandomSoundEffect();
      ball.dx *= -1;
      ball.collidedWithPaddle = true; // Set collidedWithPaddle to true
    }
  }

  function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx *= -1;
    ball.dy = Math.random() > 0.5 ? 4 : -4; // Randomize the vertical direction of the ball
    ball.collidedWithPaddle = false; // Reset collidedWithPaddle to false
  }

  function updateScore() {
    document.getElementById("player1Score").textContent = player1Score;
    document.getElementById("player2Score").textContent = player2Score;

    if (player1Score >= 11) {
      alert("Player 1 wins!");
      resetGame();
    } else if (player2Score >= 11) {
      alert("Player 2 wins!");
      resetGame();
    }
  }

  function resetGame() {
    player1Score = 0;
    player2Score = 0;
    resetBall();
    disableGame();
    startBtn.disabled = false; // Enable the start button for a new game
  
    // Reset paddle positions to their original state
    player1Paddle.y = canvas.height / 2 - paddleHeight / 2;
    player2Paddle.y = canvas.height / 2 - paddleHeight / 2;
  
    // Draw the paddles at their updated positions
    ctx.drawImage(
      player1Paddle.image,
      player1Paddle.x,
      player1Paddle.y,
      player1Paddle.width,
      player1Paddle.height
    );
    ctx.drawImage(
      player2Paddle.image,
      player2Paddle.x,
      player2Paddle.y,
      player2Paddle.width,
      player2Paddle.height
    );
  }  

  function disableGame() {
    player1Paddle.dy = 0;
    player2Paddle.dy = 0;
    ball.dx = 0;
    ball.dy = 0;
  }

  function enableGame() {
    player1Paddle.dy = 0;
    player2Paddle.dy = 0;
    ball.dx = 4;
    ball.dy = 4;
  }  

  function startGame() {
    enableGame();
    startBtn.disabled = true;
  }

  // Initialize
  function init() {
    preloadSoundEffects(); // Preload sound effects

    player1Paddle.image.src = "images/loafcat_lt.png";
    player2Paddle.image.src = "images/loafcat_rt.png";

    player1Paddle.image.addEventListener("load", function () {
      update();
    });

    player2Paddle.image.addEventListener("load", function () {
      update();
    });
  }

  init();

  // Game Loop
  function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(
      player1Paddle.image,
      player1Paddle.x,
      player1Paddle.y,
      player1Paddle.width,
      player1Paddle.height
    );
    ctx.drawImage(
      player2Paddle.image,
      player2Paddle.x,
      player2Paddle.y,
      player2Paddle.width,
      player2Paddle.height
    );

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = "#000000";
    ctx.fill();

    update();

    requestAnimationFrame(gameLoop);
  }

  // Disable the game initially
  disableGame();

  // Start the game when both players have selected paddle colors
  startBtn.addEventListener("click", function () {
    startGame();
  });

  gameLoop();
});
