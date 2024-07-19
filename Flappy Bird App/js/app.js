// app.js
document.addEventListener('DOMContentLoaded', () => {
    const bird = document.getElementById('bird');
    const gameContainer = document.getElementById('gameContainer');
    const scoreDisplay = document.getElementById('score');

    let birdY = gameContainer.clientHeight / 2;
    let birdVelocity = 0;
    const gravity = 0.025;  // Decreased gravity for slower descent
    const jump = -3.5;      // Increased jump for higher lift
    let gameStarted = false;
    let obstacles = [];
    let score = 0;

    const ws = new WebSocket('ws://localhost:8765');

    ws.onopen = () => {
        console.log('Connected');
    };

    ws.onmessage = (event) => {
        const message = event.data;
        if (message === 'JUMP') {
            console.log('Jump detected!');
            if (!gameStarted) {
                gameStarted = true;
                setInterval(createObstacle, 3000);  // Adjust obstacle creation interval
                gameLoop();
            }
            birdVelocity = jump;
        } else {
            console.log('Not jumping');
            
        }
    };

    ws.onclose = () => {
        console.log('Disconnected');
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
    
    const createObstacle = () => {
        const obstacleGap =  Math.random() * (450 - 250) + 450;; // Gap between top and bottom obstacles
        const minObstacleHeight = 50;
        const maxObstacleHeight = gameContainer.clientHeight - obstacleGap - minObstacleHeight;

        const obstacleTopHeight = Math.random() * (maxObstacleHeight - minObstacleHeight) + minObstacleHeight;
        const obstacleBottomHeight = gameContainer.clientHeight - obstacleGap - obstacleTopHeight;

        const obstacleWidth = 80; // Fixed width for consistency

        // Create top obstacle
        const obstacleTop = document.createElement('div');
        obstacleTop.classList.add('obstacle');
        obstacleTop.style.height = `${obstacleTopHeight}px`;
        obstacleTop.style.width = `${obstacleWidth}px`;
        obstacleTop.style.left = `${gameContainer.clientWidth}px`;
        obstacleTop.style.top = '0px';
        obstacleTop.style.position = 'absolute';

        // Create bottom obstacle
        const obstacleBottom = document.createElement('div');
        obstacleBottom.classList.add('obstacle');
        obstacleBottom.style.height = `${obstacleBottomHeight}px`;
        obstacleBottom.style.width = `${obstacleWidth}px`;
        obstacleBottom.style.left = `${gameContainer.clientWidth}px`;
        obstacleBottom.style.top = `${gameContainer.clientHeight - obstacleBottomHeight}px`;
        obstacleBottom.style.position = 'absolute';

        gameContainer.appendChild(obstacleTop);
        gameContainer.appendChild(obstacleBottom);
        obstacles.push(obstacleTop);
        obstacles.push(obstacleBottom);
    };

    const moveObstacles = () => {
        obstacles.forEach(obstacle => {
            let obstacleLeft = parseInt(obstacle.style.left);
            obstacleLeft -= 2;  // Decreased speed for obstacles
            obstacle.style.left = `${obstacleLeft}px`;

            if (obstacleLeft + obstacle.clientWidth < 0) {
                obstacle.remove();
                obstacles = obstacles.filter(obs => obs !== obstacle);
                if (obstacle.classList.contains('obstacle')) {
                    score++;
                    scoreDisplay.innerText = "SCORE: " +  score/2;
                }
            }
        });
    };

    const checkCollision = () => {
        const birdRect = bird.getBoundingClientRect();

        for (const obstacle of obstacles) {
            const obstacleRect = obstacle.getBoundingClientRect();
            const inHorizontalRange = birdRect.right > obstacleRect.left && birdRect.left < obstacleRect.right;
            const collidesWithTop = birdRect.top < obstacleRect.bottom && obstacleRect.top === 0;  // Only check top obstacles
            const collidesWithBottom = birdRect.bottom > obstacleRect.top && obstacleRect.bottom === gameContainer.clientHeight;  // Only check bottom obstacles

            if (inHorizontalRange && (collidesWithTop || collidesWithBottom)) {
                return true;
            }
        }
        return false;
    };

    const endGame = () => {
        gameStarted = false;
        localStorage.setItem('finalScore', score/2);

        // Retrieve the current scores from localStorage
        let scores = JSON.parse(sessionStorage.getItem('scores')) || [];

        // Add the current score to the scores array
        scores.push(score/2);

        // Store the updated scores array in localStorage
        sessionStorage.setItem('scores', JSON.stringify(scores));

        window.location.href = 'score.html';
    };

    const gameLoop = () => {
        if (!gameStarted) return;

        birdVelocity += gravity;
        birdY += birdVelocity;

        if (birdY < 0) {
            birdY = 0;
            birdVelocity = 0;
        } else if (birdY > gameContainer.clientHeight - bird.clientHeight) {
            birdY = gameContainer.clientHeight - bird.clientHeight;
            birdVelocity = 0;
            endGame();
        }

        bird.style.top = `${birdY}px`;

        moveObstacles();

        if (checkCollision()) {
            endGame();
        }

        requestAnimationFrame(gameLoop);
    };

    document.addEventListener('keydown', e => {
        if (e.code === 'Space') {
            if (!gameStarted) {
                gameStarted = true;
                setInterval(createObstacle, 3000);  // Adjust obstacle creation interval
                gameLoop();
            }
            birdVelocity = jump;
        }
    });
});
