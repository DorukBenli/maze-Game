const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const cellSize = 40;
const width = canvas.width / cellSize;
const height = canvas.height / cellSize;

class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.visited = false;
        this.walls = { top: true, right: true, bottom: true, left: true };
    }


    draw() {
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 2;

        if (this.walls.top) {
            ctx.beginPath();
            ctx.moveTo(this.x * cellSize, this.y * cellSize);
            ctx.lineTo((this.x + 1) * cellSize, this.y * cellSize);
            ctx.stroke();
        }
        if (this.walls.right) {
            ctx.beginPath();
            ctx.moveTo((this.x + 1) * cellSize, this.y * cellSize);
            ctx.lineTo((this.x + 1) * cellSize, (this.y + 1) * cellSize);
            ctx.stroke();
        }
        if (this.walls.bottom) {
            ctx.beginPath();
            ctx.moveTo((this.x + 1) * cellSize, (this.y + 1) * cellSize);
            ctx.lineTo(this.x * cellSize, (this.y + 1) * cellSize);
            ctx.stroke();
        }
        if (this.walls.left) {
            ctx.beginPath();
            ctx.moveTo(this.x * cellSize, (this.y + 1) * cellSize);
            ctx.lineTo(this.x * cellSize, this.y * cellSize);
            ctx.stroke();
        }

        if (this.visited) {
            ctx.fillStyle = '#333';
            ctx.fillRect(this.x * cellSize + 1, this.y * cellSize + 1, cellSize - 2, cellSize - 2);
        }
    }
} 

function buildMaze() {
    const stack = [];
    const grid = [];
    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            row.push(new Cell(x, y));
        }
        grid.push(row);
    }

    const current = grid[0][0];
    current.visited = true;
    stack.push(current);

    while (stack.length > 0) {
        const current = stack.pop();
        const neighbors = getUnvisitedNeighbors(current, grid);

        if (neighbors.length > 0) {
            stack.push(current);
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            removeWallBetween(current, next);
            next.visited = true;
            stack.push(next);
        }
    }

    return grid;
}

function getUnvisitedNeighbors(cell, grid) {
    const neighbors = [];

    if (cell.y > 0 && !grid[cell.y - 1][cell.x].visited) neighbors.push(grid[cell.y - 1][cell.x]);
    if (cell.x < width - 1 && !grid[cell.y][cell.x + 1].visited) neighbors.push(grid[cell.y][cell.x + 1]);
    if (cell.y < height - 1 && !grid[cell.y + 1][cell.x].visited) neighbors.push(grid[cell.y + 1][cell.x]);
    if (cell.x > 0 && !grid[cell.y][cell.x - 1].visited) neighbors.push(grid[cell.y][cell.x - 1]);

    return neighbors;
}

function removeWallBetween(a, b) {
    if (a.x === b.x) {
        if (a.y < b.y) {
            a.walls.bottom = false;
            b.walls.top = false;
        } else {
            a.walls.top = false;
            b.walls.bottom = false;
        }
    } else {
        if (a.x < b.x) {
            a.walls.right = false;
            b.walls.left = false;
        } else {
            a.walls.left = false;
            b.walls.right = false;
        }
    }
}

let maze = buildMaze();


let solvedMazes = 0;
let timer;
let timeRemaining = 15 * 60; // 30 minutes in seconds

function startTimer() {
    timer = setInterval(function () {
        timeRemaining--;

        if (timeRemaining <= 0) {
            clearInterval(timer);
            alert(`Time is up! solved mazes:${solvedMazes}`);
        }
    }, 1000);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function drawTimer() {
    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'right';
    ctx.fillText(`Time: ${formatTime(timeRemaining)}`, canvas.width - 10, canvas.height - 10);
}

function drawSolvedMazes() {
    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.fillText(`Mazes Solved: ${solvedMazes}`, 10, canvas.height - 10);
}

function resetMaze() {
    maze = buildMaze()
    playerPosition = { x: 0, y: 0 };
    currentCell = maze[playerPosition.y][playerPosition.x];
}

function drawMaze() {
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const row of maze) {
        for (const cell of row) {
            cell.draw();
        }
    }
    drawPlayer();
    drawEnd();
    drawTimer();
    drawSolvedMazes();
}
function drawEnd() {
    ctx.fillStyle = 'green';
    ctx.fillRect((width - 1) * cellSize + cellSize / 4, (height - 1) * cellSize + cellSize / 4, cellSize / 2, cellSize / 2);
}

function checkWinCondition() {
    if (playerPosition.x === width - 1 && playerPosition.y === height - 1) {
        solvedMazes++;
        playerPosition = { x: 0, y: 0 }; // Reset player position to top left
        resetMaze();
    }
}

function drawPlayer() {
    ctx.fillStyle = 'red';
    ctx.fillRect(playerPosition.x * cellSize + cellSize / 4, playerPosition.y * cellSize + cellSize / 4, cellSize / 2, cellSize / 2);
}

let playerPosition = { x: 0, y: 0 };

function movePlayer(direction) {
    const currentCell = maze[playerPosition.y][playerPosition.x];
    if (direction === 'up' && !currentCell.walls.top) playerPosition.y--;
    if (direction === 'right' && !currentCell.walls.right) playerPosition.x++;
    if (direction === 'down' && !currentCell.walls.bottom) playerPosition.y++;
    if (direction === 'left' && !currentCell.walls.left) playerPosition.x--;
    checkWinCondition();
}
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') movePlayer('up');
    if (e.key === 'ArrowRight') movePlayer('right');
    if (e.key === 'ArrowDown') movePlayer('down');
    if (e.key === 'ArrowLeft') movePlayer('left');
});

function gameLoop() {
    drawMaze();
    requestAnimationFrame(gameLoop);
}

gameLoop();
startTimer();
