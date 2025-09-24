const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "24px sans-serif";
    ctx.fillText("Canvas size: " + canvas.width + " × " + canvas.height, 20, 40);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

//////////////////////////////////////////////////////
// FUNVTION LIBRARY
//////////////////////////////////////////////////////
function circleCollidesWithRectangle({ circle, rectangle, steps = 5 }) {
    for (let i = 1; i <= steps; i++) {
        const nextX = circle.position.x + circle.velocity.x * i;
        const nextY = circle.position.y + circle.velocity.y * i;

        const closestX = Math.max(rectangle.position.x,
            Math.min(nextX, rectangle.position.x + rectangle.width));
        const closestY = Math.max(rectangle.position.y,
            Math.min(nextY, rectangle.position.y + rectangle.height));

        const dx = nextX - closestX;
        const dy = nextY - closestY;

        if ((dx * dx + dy * dy) <= (circle.radius * circle.radius)) {
            return true; 
        }
    }
    return false;
}



//////////////////////////////////////////////////////
// GAME OBJECTS
//////////////////////////////////////////////////////

class Boundary {
    static width = 40;
    static height = 40;
    constructor({ position }) {
        this.position = position;
        this.width = 40;
        this.height = 40;
    }

    draw() {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}

class Player {
    constructor({ position }) {
        this.position = position;
        this.speed = 2;
        this.radius = 15;
        this.direction = null;
        this.desiredDirection = null;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'yellow';
        ctx.fill();
        ctx.closePath();
    }

    isAtTileCenter() {
        const tolerance = 2;
        return (
            Math.abs(this.position.x % Boundary.width - Boundary.width / 2) < tolerance &&
            Math.abs(this.position.y % Boundary.height - Boundary.height / 2) < tolerance
        );
    }

    willCollide(boundaries, dir) {
        let velocity = { x: 0, y: 0 };
        if (dir === "up") velocity.y = -this.speed;
        if (dir === "down") velocity.y = this.speed;
        if (dir === "left") velocity.x = -this.speed;
        if (dir === "right") velocity.x = this.speed;

        return boundaries.some(boundary =>
            circleCollidesWithRectangle({
                circle: { ...this, velocity },
                rectangle: boundary
            })
        );
    }

    update(boundaries) {
        // 在瓦片中心时处理转向
        if (this.desiredDirection && this.isAtTileCenter()) {
            // 如果当前被卡住，允许任何方向的转向
            let currentlyBlocked = this.direction ? this.willCollide(boundaries, this.direction) : false;

            if (currentlyBlocked) {
                // 被卡住时，直接转向（不需要检测）
                this.direction = this.desiredDirection;
            } else {
                // 没被卡住时，检测新方向是否会撞墙
                let newDirectionBlocked = this.willCollide(boundaries, this.desiredDirection);
                if (!newDirectionBlocked) {
                    this.direction = this.desiredDirection;
                }
            }
            this.desiredDirection = null;
        }

        // 移动
        if (this.direction) {
            let velocity = { x: 0, y: 0 };
            if (this.direction === "up") velocity.y = -this.speed;
            if (this.direction === "down") velocity.y = this.speed;
            if (this.direction === "left") velocity.x = -this.speed;
            if (this.direction === "right") velocity.x = this.speed;

            // 检测当前方向是否会碰撞
            if (!this.willCollide(boundaries, this.direction)) {
                this.position.x += velocity.x;
                this.position.y += velocity.y;
            } else {
                // 撞到墙了，停止移动
                this.direction = null;
            }
        }

        this.draw();
    }
}

//////////////////////////////////////////////////////
// CREATE PLAYER
//////////////////////////////////////////////////////

const player = new Player({
    position: {
        x: Boundary.width * 3 / 2,
        y: Boundary.height * 3 / 2
    },
    velocity: {
        x: 0,
        y: 0
    }
});

//////////////////////////////////////////////////////
// CREATE MAP
//////////////////////////////////////////////////////

const map = [
    ['-', '-', '-', '-', '-', '-', '-'],
    ['-', ' ', ' ', ' ', ' ', ' ', '-'],
    ['-', ' ', '-', ' ', '-', ' ', '-'],
    ['-', ' ', ' ', ' ', ' ', ' ', '-'],
    ['-', '-', '-', '-', '-', '-', '-']
]

const boundaries = [];

map.forEach((row, i) => {
    row.forEach((symbol, j) => {
        switch (symbol) {
            case '-':
                boundaries.push(new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    }
                }));
                break;
        }
    });
});

//////////////////////////////////////////////////////
// INPUT SYSTEM
//////////////////////////////////////////////////////

const actions = {
    w: "up",
    ArrowUp: "up",
    s: "down",
    ArrowDown: "down",
    a: "left",
    ArrowLeft: "left",
    d: "right",
    ArrowRight: "right"
};

window.addEventListener("keydown", (event) => {
    const action = actions[event.key];
    if (action) {
        player.desiredDirection = action;
    }
});

//////////////////////////////////////////////////////
// GAME LOOP (RENDERING)
//////////////////////////////////////////////////////

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    boundaries.forEach((boundary) => {
        boundary.draw();
    });

    player.update(boundaries);

}

animate();
