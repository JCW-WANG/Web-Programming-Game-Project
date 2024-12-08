const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const backgroundMusic = document.getElementById("backgroundMusic");
const scoreSound = document.getElementById("scoreSound");
const winSound = document.getElementById("winSound");
const loseSound = document.getElementById("loseSound");
const almostWinSound = document.getElementById("almostWinSound");
const winImage = document.getElementById("winImage");
const loseImage = document.getElementById("loseImage");

let playerScore = 0;
let computerScore = 0;
let ballRadius = 10;
let x;
let y;
let dx = 3;
let dy = -3;
const paddleHeight = 10;
const paddleWidth = 75;
let playerPaddleX = (canvas.width - paddleWidth) / 2;
let computerPaddleX = (canvas.width - paddleWidth) / 2;
const scoreDiv = document.getElementById("score");
let ballType = 'normal';
let isGameRunning = false;
let curveDirection = 1;
let difficulty = 'easy';
let computerSpeed = 2;

function positionBallOnPaddle() {
    x = playerPaddleX + paddleWidth / 2;
    y = canvas.height - paddleHeight - ballRadius;
}

canvas.addEventListener("mousemove", mouseMoveHandler, false);
window.addEventListener("resize", resizeCanvas, false);
document.getElementById("startBtn").addEventListener("click", startGame, false);
document.getElementById("resetBtn").addEventListener("click", resetGame, false);
document.getElementById("difficulty").addEventListener("change", changeDifficulty, false);

function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    positionBallOnPaddle();
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

function drawPaddle(x, y) {
    ctx.beginPath();
    ctx.rect(x, y, paddleWidth, paddleHeight);
    ctx.fillStyle = "#000000";
    ctx.fill();
    ctx.closePath();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBall();
    drawPaddle(playerPaddleX, canvas.height - paddleHeight);
    drawPaddle(computerPaddleX, 0);

    if (ballType === 'curve') {
        dx += curveDirection * Math.sin(y / 50) * 0.5;
    }

    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
        curveDirection = -curveDirection;
    }
    if (y + dy < ballRadius) {
        if (x > computerPaddleX && x < computerPaddleX + paddleWidth) {
            dy = -dy;
            adjustBallSpeed();
        } else {
            playerScore++;
            scoreSound.play();
            scoreDiv.innerHTML = `玩家得分: ${playerScore} | 機器得分: ${computerScore}`;
            resetBall();
        }
    } else if (y + dy > canvas.height - ballRadius) {
        if (x > playerPaddleX && x < playerPaddleX + paddleWidth) {
            dy = -dy;
            adjustBallSpeed();
        } else {
            computerScore++;
            scoreSound.play();
            scoreDiv.innerHTML = `玩家得分: ${playerScore} | 機器得分: ${computerScore}`;
            resetBall();
        }
    }

    if (playerScore >= 11 || computerScore >= 11) {
        isGameRunning = false;
        stopMusic();
        const winner = playerScore > computerScore ? 'player' : 'computer';
        if (winner === 'player') {
            winSound.play();
            drawEndImage(winImage);
        } else {
            almostWinSound.play();
            drawEndImage(loseImage);
        }
        document.getElementById("startBtn").disabled = true;
    }

    if (isGameRunning) {
        x += dx;
        y += dy;
        moveComputerPaddle();
        requestAnimationFrame(draw);
    }
}

function drawEndImage(image) {
    const imgWidth = image.width;
    const imgHeight = image.height;
    const ratio = Math.min(canvas.width / imgWidth, canvas.height / imgHeight);
    const newWidth = imgWidth * ratio;
    const newHeight = imgHeight * ratio;
    const xPos = (canvas.width - newWidth) / 2;
    const yPos = (canvas.height - newHeight) / 2;
    ctx.drawImage(image, xPos, yPos, newWidth, newHeight);
}

function adjustBallSpeed() {
    switch (ballType) {
        case 'normal':
            dx = (dx > 0 ? 3 : -3);
            dy = (dy > 0 ? 3 : -3);
            break;
        case 'fast':
            dx = (dx > 0 ? 4 : -4);
            dy = (dy > 0 ? 4 : -4);
            break;
        case 'cut':
            dx = (dx > 0 ? 3 : -3);
            dy = (dy > 0 ? 1.5 : -1.5);
            break;
        case 'curve':
            dx = (dx > 0 ? 3 : -3);
            dy = 3;
            curveDirection = dx > 0 ? 1 : -1;
            break;
    }
}

function resetBall() {
    positionBallOnPaddle();
    dx = (Math.random() < 0.5 ? -3 : 3);
    dy = -3;
}

function moveComputerPaddle() {
    if (x < computerPaddleX + paddleWidth / 2) {
        computerPaddleX -= computerSpeed;
    } else if (x > computerPaddleX + paddleWidth / 2) {
        computerPaddleX += computerSpeed;
    }
}

function mouseMoveHandler(e) {
    const relativeX = e.clientX - canvas.getBoundingClientRect().left;
    playerPaddleX = Math.max(Math.min(relativeX - paddleWidth / 2, canvas.width - paddleWidth), 0);
    if (!isGameRunning) {
        positionBallOnPaddle();
    }
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
    if (e.key === 'q' || e.key === 'Q') {
        ballType = 'fast';
    } else if (e.key === 'w' || e.key === 'W') {
        ballType = 'cut';
    } else if (e.key === 'e' || e.key === 'E') {
        ballType = 'curve';
    }
}

function keyUpHandler(e) {
    if (['q', 'w', 'e', 'Q', 'W', 'E'].includes(e.key)) {
        ballType = 'normal';
    }
}

function startGame() {
    if (!isGameRunning) {
        isGameRunning = true;
        playMusic();
        draw();
    }
}

function resetGame() {
    playerScore = 0;
    computerScore = 0;
    scoreDiv.innerHTML = `玩家得分: ${playerScore} | 機器得分: ${computerScore}`;
    positionBallOnPaddle();
    stopMusic();
    isGameRunning = false;
    document.getElementById("startBtn").disabled = false;
}

function playMusic() {
    backgroundMusic.currentTime = 0;
    backgroundMusic.play();
}

function stopMusic() {
    backgroundMusic.pause();
}

function changeDifficulty() {
    const difficulty = document.getElementById("difficulty").value;
    switch (difficulty) {
        case 'easy':
            computerSpeed = 2;
            break;
        case 'medium':
            computerSpeed = 5;
            break;
        case 'hard':
            computerSpeed = 7;
            break;
    }
}

positionBallOnPaddle();


