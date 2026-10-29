
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("score");
const livesText = document.getElementById("lives");
const message = document.getElementById("message");
const startBtn = document.getElementById("startBtn");

let player, objects, score, lives, running;
let keys = {};
let animationId;
let lastSpawn = 0;
let lastTime = 0;

function resetGame() {
    player = {
        x: 155,
        y: 445,
        width: 50,
        height: 30,
        speed: 280
    };

    objects = [];
    score = 0;
    lives = 3;
    running = true;
    lastSpawn = 0;
    lastTime = 0;

    scoreText.textContent = score;
    livesText.textContent = "❤️❤️❤️";
    message.textContent = "Tangkap koin, hindari bom!";
    startBtn.textContent = "↻ Mulai Ulang";

    cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(gameLoop);
}

function spawnObject() {
    const bomb = Math.random() < 0.25;

    objects.push({
        x: 15 + Math.random() * (canvas.width - 30),
        y: -20,
        radius: bomb ? 12 : 10,
        speed: 120 + Math.random() * 100 + score * 2,
        bomb
    });
}

function drawPlayer() {
    ctx.font = "38px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
        "🧺",
        player.x + player.width / 2,
        player.y + player.height
    );
}

function drawObjects() {
    ctx.textAlign = "center";

    for (const obj of objects) {
        ctx.font = "26px Arial";
        ctx.fillText(
            obj.bomb ? "💣" : "🪙",
            obj.x,
            obj.y
        );
    }
}

function update(dt, timestamp) {
    if (keys.ArrowLeft || keys.a) {
        player.x -= player.speed * dt;
    }

    if (keys.ArrowRight || keys.d) {
        player.x += player.speed * dt;
    }

    player.x = Math.max(
        0,
        Math.min(canvas.width - player.width, player.x)
    );

    if (timestamp - lastSpawn > Math.max(300, 850 - score * 10)) {
        spawnObject();
        lastSpawn = timestamp;
    }

    for (const obj of objects) {
        obj.y += obj.speed * dt;

        const caught =
            obj.y + obj.radius > player.y &&
            obj.y - obj.radius < player.y + player.height &&
            obj.x > player.x - 5 &&
            obj.x < player.x + player.width + 5;

        if (caught && !obj.done) {
            obj.done = true;

            if (obj.bomb) {
                lives--;
                livesText.textContent =
                    "❤️".repeat(lives) + "🖤".repeat(3 - lives);
            } else {
                score++;
                scoreText.textContent = score;
            }
        }

        if (obj.y > canvas.height + 20) {
            obj.done = true;
        }
    }

    objects = objects.filter(obj => !obj.done);

    if (lives <= 0) {
        running = false;
        message.textContent = `Game Over! Skor kamu: ${score}`;
        startBtn.textContent = "🔄 Main Lagi";
    }
}

function gameLoop(timestamp) {
    if (!running) return;

    const dt = lastTime
        ? Math.min((timestamp - lastTime) / 1000, 0.04)
        : 0;

    lastTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Bintang latar belakang
    ctx.fillStyle = "#ffffff22";
    for (let i = 0; i < 25; i++) {
        const x = (i * 67) % canvas.width;
        const y = (i * 97) % canvas.height;
        ctx.fillRect(x, y, 2, 2);
    }

    update(dt, timestamp);
    drawPlayer();
    drawObjects();

    if (running) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

document.addEventListener("keydown", event => {
    if (["ArrowLeft", "ArrowRight", " "].includes(event.key)) {
        event.preventDefault();
    }
    keys[event.key] = true;
});

document.addEventListener("keyup", event => {
    keys[event.key] = false;
});

function holdButton(id, key) {
    const btn = document.getElementById(id);

    btn.addEventListener("pointerdown", event => {
        event.preventDefault();
        keys[key] = true;
    });

    for (const type of ["pointerup", "pointerleave", "pointercancel"]) {
        btn.addEventListener(type, () => {
            keys[key] = false;
        });
    }
}

holdButton("leftBtn", "ArrowLeft");
holdButton("rightBtn", "ArrowRight");

startBtn.addEventListener("click", resetGame);

ctx.font = "24px Arial";
ctx.textAlign = "center";
ctx.fillStyle = "white";
ctx.fillText("Tekan Mulai Game!", 180, 250);
