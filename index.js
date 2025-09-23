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
    constructor({ position, velocity }) {
        this.position = position;
        this.speed = 3;
        this.radius = 10;
        this.direction = null;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'yellow';
        ctx.fill();
        ctx.closePath();
    }

    update() {
        if (this.direction === "up") this.position.y -= this.speed;
        if (this.direction === "down") this.position.y += this.speed;
        if (this.direction === "left") this.position.x -= this.speed;
        if (this.direction === "right") this.position.x += this.speed;

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
        player.direction = action;
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

    player.update();

}

animate();
