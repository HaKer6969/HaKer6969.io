const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartButton = document.getElementById('restartButton');
const ballColorInput = document.getElementById('ballColor');
const paddleColorInput = document.getElementById('paddleColor');
const audio = new Audio('https://pixabay.com/music/download/144461/');

restartButton.addEventListener('click', restartGame);
ballColorInput.addEventListener('input', updateBallColor);
paddleColorInput.addEventListener('input', updatePaddleColor);

canvas.addEventListener('mousemove', mouseMoveHandler);
canvas.addEventListener('touchmove', touchMoveHandler);

let gameWidth = canvas.width;
let gameHeight = canvas.height;
let ballRadius = 15;
let ballX = Math.random() * (gameWidth - 2 * ballRadius) + ballRadius;
let ballY = gameHeight - 30;
let ballSpeedX = (Math.random() * 4) - 2;
let ballSpeedY = -Math.random() * 2 - 1;
let ballColor = '#0095DD';
let paddleColor = '#0095DD';

let paddleHeight = 10;
let paddleWidth = 75;
let paddleX = (gameWidth - paddleWidth) / 2;

let score = 0;
let coins = 0;
let coinRadius = 15;
let coinX = Math.random() * (gameWidth - 2 * coinRadius) + coinRadius;
let coinY = Math.random() * (gameHeight / 2 - 2 * coinRadius) + coinRadius;
let gameOver = false;

// Add new variables for the spray can animation
let sprayCanImage = new Image();
sprayCanImage.src = 'https://i.imgur.com/gsT5oDq.png'; // Updated with your spray can image URL
let sprayCanX = 0;
let sprayCanY = gameHeight;
let sprayCanRolling = false;
let sprayCanFlying = false;
let sprayCanSpraying = false;
let sprayProgress = 0;

function mouseMoveHandler(e) {
    let relativeX = e.clientX - canvas.getBoundingClientRect().left;
    if (relativeX > 0 && relativeX < gameWidth) {
        paddleX = relativeX - paddleWidth / 2;
    }
}

function touchMoveHandler(e) {
    e.preventDefault();
    let touchX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
    if (touchX > 0 && touchX < gameWidth) {
        paddleX = touchX - paddleWidth / 2;
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = ballColor;
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
  // Create an SVG racket
  const svgRacket = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="30" viewBox="0 0 100 30">
  <rect x="10" y="10" width="80" height="20" fill="${paddleColor}" />
  <circle cx="10" cy="15" r="10" fill="${paddleColor}" />
    <circle cx="90" cy="15" r="10" fill="${paddleColor}" />
</svg>`;

  // Convert SVG to an image
  const img = new Image();
  img.src = 'data:image/svg+xml;base64,' + btoa(svgRacket);

  // Draw the racket image
  ctx.drawImage(img, paddleX, gameHeight - paddleHeight - 30);
}

function drawScore() {
    ctx.font = 'bold 30px Arial';
    ctx.fillStyle = '#FF80C0';
    ctx.fillText(score, gameWidth / 2, 40);
}

function drawCoins() {
    ctx.beginPath();
    ctx.arc(gameWidth - 45, 35, 30, 0, Math.PI * 2);
    ctx.fillStyle = 'gold';
    ctx.fill();
    ctx.closePath();
    ctx.font = 'bold 30px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(coins, gameWidth - 45, 45);
}

function drawCoin() {
    ctx.beginPath();
    ctx.arc(coinX, coinY, coinRadius + 5, 0, Math.PI * 2);
    ctx.fillStyle = 'gold';
    ctx.fill();
    ctx.closePath();
    ctx.beginPath();
    ctx.arc(coinX, coinY, coinRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.closePath();
    ctx.font = 'bold16px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(coins, coinX, coinY + 5);
}

function drawConfetti(x, y) {
    ctx.beginPath();
    ctx.rect(x, y, 3, 3);
    ctx.fillStyle = randomColor();
    ctx.fill();
    ctx.closePath();
}

function randomColor() {
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function update() {
    ballX += ballSpeedX;
    ballY += ballSpeedY;
    if (ballX + ballRadius > gameWidth || ballX - ballRadius < 0) {
        ballSpeedX = -ballSpeedX;
    }

    if (ballY - ballRadius < 0) {
        ballSpeedY = -ballSpeedY;
    } else if (ballY + ballRadius > gameHeight - paddleHeight) {
        if (ballX > paddleX && ballX < paddleX + paddleWidth) {
            ballSpeedY = -ballSpeedY * 1.05;
            ballSpeedX *= 1.05;
            score++;
        } else {
            gameOver = true;
            return;
        }
    }

    // Coin collection
    if (ballX + ballRadius > coinX - coinRadius && ballX - ballRadius < coinX + coinRadius &&
        ballY + ballRadius > coinY - coinRadius && ballY - ballRadius < coinY + coinRadius) {
        coins++;
        coinX = Math.random() * (gameWidth - 2 * coinRadius) + coinRadius;
        coinY = Math.random() * (gameHeight / 2 - 2 * coinRadius) + coinRadius;

        // Draw confetti when coin is collected
                for (let i = 0; i < 50; i++) {
            drawConfetti(coinX + Math.random() * 20 - 10, coinY + Math.random() * 20 - 10);
        }
    }

    // Update spray can animation
    if (gameOver) {
        if (!sprayCanRolling) {
            sprayCanRolling = true;
            audio.play();
        }
        if (sprayCanX < gameWidth / 2 - sprayCanImage.width / 2) {
            sprayCanX += 5;
        } else {
            sprayCanRolling = false;
            if (!sprayCanFlying) {
                sprayCanFlying = true;
                audio.play();
            }
            if (sprayCanY > 40) {
                sprayCanY -= 5;
            } else {
                sprayCanFlying = false;
                if (!sprayCanSpraying) {
                    sprayCanSpraying = true;
                    setTimeout(() => {
                        sprayProgress = 100;
                    }, 3000);
                }
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, gameWidth, gameHeight);

    if (!gameOver) {
        drawBall();
        drawPaddle();
        drawScore();
        drawCoins();
        drawCoin();
    } else {
        ctx.drawImage(sprayCanImage, sprayCanX, sprayCanY);
        if (sprayProgress === 100) {
            ctx.font = 'bold 80px Arial';
            ctx.fillStyle = '#FF80C0';
            ctx.textAlign = 'center';
            ctx.fillText('Wasted', gameWidth / 2, gameHeight / 2);
            restartButton.style.display = 'block';
        }
    }

    update();
    requestAnimationFrame(draw);
}

function restartGame() {
    gameOver = false;
    restartButton.style.display = 'none';
    ballX = Math.random() * (gameWidth - 2 * ballRadius) + ballRadius;
    ballY = gameHeight - 30;
    ballSpeedX = (Math.random() * 4) - 2;
    ballSpeedY = -Math.random() * 2 - 1;
    score = 0;
    coins = 0;
    sprayCanX = 0;
    sprayCanY = gameHeight;
    sprayCanRolling = false;
    sprayCanFlying = false;
    sprayCanSpraying = false;
    sprayProgress = 0;
}

function updateBallColor() {
    ballColor = ballColorInput.value;
}

function updatePaddleColor() {
    paddleColor = paddleColorInput.value;
}

function draw() {
    ctx.clearRect(0, 0, gameWidth, gameHeight);

    if (!gameOver) {
        drawBall();
        drawPaddle();
        drawScore();
        drawCoins();
        drawCoin();
    } else {
        // Scale spray can to 1/3 of its size
        ctx.drawImage(sprayCanImage, sprayCanX, sprayCanY, sprayCanImage.width / 3, sprayCanImage.height / 3);
        if (sprayProgress === 100) {
            ctx.font = 'bold 80px "Permanent Marker"';
            ctx.fillStyle = '#FF80C0';
            ctx.textAlign = 'center';
            // Shake effect for the text
            const shakeX = Math.random() * 6 - 3;
            const shakeY = Math.random() * 6 - 3;
            ctx.fillText('Wasted', gameWidth / 2 + shakeX, gameHeight / 2 + shakeY);

            // Draw restart button
            ctx.fillStyle = '#f00';
            ctx.fillRect(gameWidth / 2 - 60, gameHeight / 2 + 20, 120, 40);
            ctx.font = 'bold 24px Arial';
            ctx.fillStyle = '#fff';
            ctx.fillText('Restart', gameWidth / 2 - 30, gameHeight / 2 + 50);
        }
    }

    update();
    requestAnimationFrame(draw);
}

draw();