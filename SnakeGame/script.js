// Constants
const scale = 32; // Scale for the game grid
const spriteSheet = new Image();
spriteSheet.src = 'spritesheet.png'; // Replace with your actual sprite sheet path

// Game variables
let canvas, ctx;
let snake, level;
let score = 0;
let gameover = true;
let gameovertime = 0;
let gameoverdelay = 0.5;

// Initialize game
window.onload = function() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    // Create objects
    snake = new Snake();
    level = new Level(20, 15, scale, scale);

    // Start new game
    newGame();

    // Set up event listeners
    document.addEventListener('keydown', handleKeyPress);
    setInterval(gameLoop, 1000 / 10); // Game loop running at 10 frames per second
}

// Snake object
function Snake() {
    this.segments = [];
    this.direction = 'right';
    this.moveInterval = 0.5; // Controls snake speed (higher is slower)
    this.timeSinceLastMove = 0;

    this.init = function(x, y, length) {
        this.direction = 'right';
        this.segments = [];
        for (let i = 0; i < length; i++) {
            this.segments.push({ x: x - i, y: y });
        }
    }

    this.move = function(delta) {
        this.timeSinceLastMove += delta;
        if (this.timeSinceLastMove < this.moveInterval) {
            return; // Not time to move yet
        }
        
        this.timeSinceLastMove = 0;

        const head = { x: this.segments[0].x, y: this.segments[0].y };
        switch (this.direction) {
            case 'right':
                head.x += 1;
                break;
            case 'left':
                head.x -= 1;
                break;
            case 'up':
                head.y -= 1;
                break;
            case 'down':
                head.y += 1;
                break;
        }
        this.segments.unshift(head);
        this.segments.pop();

        // Check collision with walls
        const nx = this.segments[0].x;
        const ny = this.segments[0].y;
        if (nx < 0 || nx >= level.columns || ny < 0 || ny >= level.rows) {
            gameover = true; // Hit a wall
            gameovertime = 0;
        }

        // Check collision with itself
        for (let i = 1; i < this.segments.length; i++) {
            if (nx === this.segments[i].x && ny === this.segments[i].y) {
                gameover = true;
                gameovertime = 0;
                break;
            }
        }

        // Check collision with apple
        if (level.tiles[nx][ny] === 2) {
            level.tiles[nx][ny] = 0;
            addApple();
            this.grow();
            score++;
        }
    }

    this.grow = function() {
        const tail = { x: this.segments[this.segments.length - 1].x, y: this.segments[this.segments.length - 1].y };
        this.segments.push(tail);
    }
}

// Level object
function Level(columns, rows, tilewidth, tileheight) {
    this.columns = columns;
    this.rows = rows;
    this.tilewidth = tilewidth;
    this.tileheight = tileheight;
    this.tiles = [];
    this.generate = function() {
        this.tiles = [];
        for (let x = 0; x < this.columns; x++) {
            const column = [];
            for (let y = 0; y < this.rows; y++) {
                column.push(0);
            }
            this.tiles.push(column);
        }
    }
}

// Function to add an apple
function addApple() {
    let valid = false;
    while (!valid) {
        const ax = randRange(0, level.columns - 1);
        const ay = randRange(0, level.rows - 1);

        let overlap = false;
        for (let i = 0; i < snake.segments.length; i++) {
            const sx = snake.segments[i].x;
            const sy = snake.segments[i].y;
            if (ax === sx && ay === sy) {
                overlap = true;
                break;
            }
        }

        if (!overlap && level.tiles[ax][ay] === 0) {
            level.tiles[ax][ay] = 2;
            valid = true;
        }
    }
}

// Function to update the game state
function updateGame() {
    if (!gameover) {
        snake.move();
        
        // Check collision with walls (already checked in snake.move)
        
        // Check collision with apple (already checked in snake.move)
    }
}

// Function to draw the game
function drawGame() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw snake
    for (let i = 0; i < snake.segments.length; i++) {
        const segment = snake.segments[i];
        const tilex = segment.x * scale;
        const tiley = segment.y * scale;
        let tx = 0;
        let ty = 0;

        if (i === 0) {
            const nseg = snake.segments[i + 1];
            if (segment.y < nseg.y) {
                tx = 3; ty = 0;
            } else if (segment.x > nseg.x) {
                tx = 4; ty = 0;
            } else if (segment.y > nseg.y) {
                tx = 4; ty = 1;
            } else if (segment.x < nseg.x) {
                tx = 3; ty = 1;
            }
        } else if (i === snake.segments.length - 1) {
            const pseg = snake.segments[i - 1];
            if (pseg.y < segment.y) {
                tx = 3; ty = 2;
            } else if (pseg.x > segment.x) {
                tx = 4; ty = 2;
            } else if (pseg.y > segment.y) {
                tx = 4; ty = 3;
            } else if (pseg.x < segment.x) {
                tx = 3; ty = 3;
            }
        } else {
            const pseg = snake.segments[i - 1];
            const nseg = snake.segments[i + 1];
            if ((pseg.x < segment.x && nseg.x > segment.x) || (nseg.x < segment.x && pseg.x > segment.x)) {
                tx = 1; ty = 0;
            } else if ((pseg.x < segment.x && nseg.y > segment.y) || (nseg.x < segment.x && pseg.y > segment.y)) {
                tx = 2; ty = 0;
            } else if ((pseg.y < segment.y && nseg.y > segment.y) || (nseg.y < segment.y && pseg.y > segment.y)) {
                tx = 2; ty = 1;
            } else if ((pseg.y < segment.y && nseg.x < segment.x) || (nseg.y < segment.y && pseg.x < segment.x)) {
                tx = 2; ty = 2;
            } else if ((pseg.x > segment.x && nseg.y < segment.y) || (nseg.x > segment.x && pseg.y < segment.y)) {
                tx = 0; ty = 1;
            } else if ((pseg.y > segment.y && nseg.x > segment.x) || (nseg.y > segment.y && pseg.x > segment.x)) {
                tx = 0; ty = 0;
            }
        }

        ctx.drawImage(spriteSheet, tx * 64, ty * 64, 64, 64, tilex, tiley, scale, scale);
    }

    // Draw apple
    for (let x = 0; x < level.columns; x++) {
        for (let y = 0; y < level.rows; y++) {
            if (level.tiles[x][y] === 2) {
                const tilex = x * scale;
                const tiley = y * scale;
                const tx = 0; // Column index for apple in sprite sheet
                const ty = 3; // Row index for apple in sprite sheet (bottom-left corner)
                ctx.drawImage(spriteSheet, tx * 64, ty * 64, 64, 64, tilex, tiley, scale, scale);
            }
        }
    }

    // Draw score
    ctx.fillStyle = '#000';
    ctx.font = '24px Arial';
    ctx.fillText('Score: ' + score, 10, 24);

    // Draw game over message
    if (gameover) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#000';
        ctx.font = '48px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 120, canvas.height / 2);
    }
}

// Game loop
function gameLoop() {
    const currentTime = Date.now();
    const delta = (currentTime - gameovertime) / 1000;

    if (!gameover) {
        updateGame(delta);
    } else {
        gameovertime += delta;
        if (gameovertime >= gameoverdelay) {
            gameover = true;
        }
    }

    drawGame();
}

// Handle key presses
function handleKeyPress(event) {
    if (!gameover) {
        switch (event.key) {
            case 'ArrowUp':
                if (snake.direction !== 'down') {
                    snake.direction = 'up';
                }
                break;
            case 'ArrowDown':
                if (snake.direction !== 'up') {
                    snake.direction = 'down';
                }
                break;
            case 'ArrowLeft':
                if (snake.direction !== 'right') {
                    snake.direction = 'left';
                }
                break;
            case 'ArrowRight':
                if (snake.direction !== 'left') {
                    snake.direction = 'right';
                }
                break;
        }
    } else if (event.key === 'Enter') {
        newGame();
    }
}

// Start a new game
function newGame() {
    gameover = false;
    score = 0;
    snake.init(10, 7, 5);
    level.generate();
    addApple();
}

// Utility function to get a random integer within a range
function randRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
