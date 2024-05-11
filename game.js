var canvas = document.getElementById("gameArea");
var c = canvas.getContext("2d");

var ship = {
    img: new Image(),
    x: 10,
    y: 200,
    height: 31,
    width: 46
};

var heart = {
    imgFull: new Image(),
    imgEmpty: new Image(),
    height: 40,
    width: 40
};

var enemy = {
    img1: new Image(),
    img2: new Image(),
    height: 23,
    width: 46,
    spawnClock: 15
};

var boss = {
    img1: new Image(),
    img2: new Image(),
    height: 100,
    width: 100
};

var soundImg = {
    on: new Image(),
    off: new Image()
};

var scores = {
    easy: 50,
    medium: 100,
    hard: 300,
    boss: 5000
};

var bullet = { height: 5, width: 15 };

var shipLaserSound = new Audio('Sounds/shiplaser.wav');
var mediumLaserSound = new Audio('Sounds/mediumlaser.wav');
var blastSound = new Audio('Sounds/explosion.wav');
var bgMusic = new Audio('Sounds/bgmusic.mp3');
var gameStartSound = new Audio('Sounds/gamestart.wav');
var healthDownSound = new Audio('Sounds/healthdown.wav');
var gameOverSound = new Audio('Sounds/gameover.mp3');
var mahLazerSound = new Audio('Sounds/mahLazer.wav');


bgMusic.volume = 0;
gameStartSound.volume = 0;
shipLaserSound.volume = 0;
mediumLaserSound.volume = 0;
blastSound.volume = 0;
healthDownSound.volume = 0;
gameOverSound.volume = 0;
mahLazerSound.volume = 0;

ship.img.src = "Sprites/ship_blue.png";
heart.imgFull.src = "Sprites/heart_1.png";
heart.imgEmpty.src = "Sprites/heart_2.png";
soundImg.on.src = "Sprites/soundOn.png";
soundImg.off.src = "Sprites/soundOff.png";
enemy.img1.src = "Sprites/enemy_white1.png";
enemy.img2.src = "Sprites/enemy_white2.png";
boss.img1.src = "Sprites/swoop01.png";
boss.img2.src = "Sprites/swoop02.png";

var UIHeight = 50;

var enemies = [];
var shipBullets = [];
var enemyBullets = [];
var menuParticles = [];
var isShipFiring = false;
const fireRate = 15;
var shipFireClock = fireRate;
const maxHealth = 3;
var health = maxHealth;
var playing = true;
var menu = true;
var gif = 0;
var score = 0;
var bossAlive = true;
var bossFiring = false;
var won = false;
var lose = false;
var underFire = false;

var killCounter = 0;

var sound = false;
var hover = false;


var colors = [
    "#E832CC",
    "#FE6961",
    "#E6C415",
    "#C4E51B",
    "#64FE6E",
    "#29F7A1",
    "#05C3E6",
    "#6765FD",
    "#FDFF00",
    "#5dff53"
];

canvas.addEventListener('mousemove', shipSetPos, false);
canvas.addEventListener('mousemove', menuButtonHover, false);
canvas.addEventListener('mousedown', shipStartFire, false);
canvas.addEventListener('mousedown', onButtonClick, false);
canvas.addEventListener('mouseup', shipStopFire, false);

var requestAnimationFrame = window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame;

window.onload = function () {
    startAnimating(60);
};

function onButtonClick(ev) {
    if (menu) {
        var rect = canvas.getBoundingClientRect();
        var mouseX = ev.clientX - rect.left;
        var mouseY = ev.clientY - rect.top;

        if (mouseY >= 300 && mouseY <= 370 && mouseX >= 300 && mouseX <= 500) {
            menu = false;
            playing = true;

            gameStartSound.currentTime = 0;
            gameStartSound.play();

            bgMusic.currentTime = 0;
            bgMusic.play();

        }

        if (mouseY >= canvas.height - 100 && mouseY <= canvas.height - 50 && mouseX >= 50 && mouseX <= 100) {
            toggleSound();
        }
    }

    if (won || lose) {
        var rect = canvas.getBoundingClientRect();
        var mouseX = ev.clientX - rect.left;
        var mouseY = ev.clientY - rect.top;

        if (mouseY >= 400 && mouseY <= 470 && mouseX >= 300 && mouseX <= 500) {
            playAgain();
        }

    }

}

function menuButtonHover(ev) {
    if (menu) {
        var rect = canvas.getBoundingClientRect();
        var mouseX = ev.clientX - rect.left;
        var mouseY = ev.clientY - rect.top;

        if (mouseY >= 300 && mouseY <= 370 && mouseX >= 300 && mouseX <= 500) {
            hover = true;
        } else {
            hover = false;
        }
    }

    if (won || lose) {
        var rect = canvas.getBoundingClientRect();
        var mouseX = ev.clientX - rect.left;
        var mouseY = ev.clientY - rect.top;

        if (mouseY >= 400 && mouseY <= 470 && mouseX >= 300 && mouseX <= 500) {
            hover = true;
        } else {
            hover = false;
        }
    }
}

var frameCount = 0;
var $results = $("#results");
var fps, fpsInterval, startTime, now, then, elapsed;

function startAnimating(fps) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    console.log(startTime);
    animate();
}

function animate() {

    // request another frame
    requestAnimationFrame(animate);

    // calc elapsed time since last loop
    now = Date.now();
    elapsed = now - then;

    // if enough time has elapsed, draw the next frame
    if (elapsed > fpsInterval) {

        // Get ready for next frame by setting then=now, but...
        // Also, adjust for fpsInterval not being multiple of 16.67
        then = now - (elapsed % fpsInterval);

        // draw next frame
        playGame();

        // TESTING...Report #seconds since start and achieved fps.
        var sinceStart = now - startTime;
        var currentFps = Math.round(1000 / (sinceStart / ++frameCount) * 100) / 100;
        $results.text("Elapsed time= " + Math.round(sinceStart / 1000 * 100) / 100 + " secs @ " + currentFps + " fps.");
    }

}


function playGame() {

    if (health === 0) {
        if (playing === true) {
            playing = false;
            lose = true;
            gameOverSound.play();
            for (var i = 0; i < enemies.length; i++) {
                enemies.shift();
            }
        }
    }


    if (menu) {
        drawMenu();
        moveMenuParticle();
        removeMenuParticles();
    } else {
        if (playing && !won) {
            shipFire();
            spawnEnemy();
            checkEnemy();
            checkEnemyBullets();
            checkShip();
            checkBoss();
        }

        drawBackground();
        drawUI();
        drawShip();
        drawShipBullets();
        drawEnemy();
        removeEnemy();
        drawEnemyBullets();
        removeEnemyBullets();
        removeShipBullets();
        moveMenuParticle();
        removeMenuParticles();

        if (won) {
            playing = false;
            c.fillStyle = "#a1ff00";
            c.font = "100px Roboto";
            c.fillText("You Won!", 190, 300);

            if (!hover) {
                c.fillStyle = "#2dbbff";
                c.fillRect(300, 400, 200, 70);
                c.fillStyle = "#000000";
                c.font = "38px Roboto";
                c.fillText("Play Again", 307, 447);
            } else {
                c.fillStyle = "#0063ad";
                c.fillRect(300, 400, 200, 70);
                c.fillStyle = "#000000";
                c.font = "38px Roboto";
                c.fillText("Play Again", 307, 447);
            }
        }

        if (lose) {
            playing = false;
            c.fillStyle = "#a20001";
            c.font = "100px Roboto";
            c.fillText("Game Over!", 140, 300);
            c.lineWidth = 3;
            c.strokeStyle = "#ff0d00";
            c.strokeText("Game Over!", 140, 300);

            if (!hover) {
                c.fillStyle = "#2dbbff";
                c.fillRect(300, 400, 200, 70);
                c.fillStyle = "#000000";
                c.font = "38px Roboto";
                c.fillText("Play Again", 307, 447);
            } else {
                c.fillStyle = "#0063ad";
                c.fillRect(300, 400, 200, 70);
                c.fillStyle = "#000000";
                c.font = "38px Roboto";
                c.fillText("Play Again", 307, 447);
            }
        }
    }

    // requestAnimationFrame(playGame);
}

function playAgain() {
    menu = true;
    health = maxHealth;
    score = 0;
    bossAlive = true;
    bossFiring = false;
    won = false;
    lose = false;
    underFire = false;
    killCounter = 0;
    bgMusic.pause();

    for (var i = 0; i < enemies.length; i++) {
        enemies.shift();
    }
}

function toggleSound() {
    if (!sound) {
        bgMusic.volume = 0.05;
        gameStartSound.volume = 0.05;
        shipLaserSound.volume = 0.05;
        mediumLaserSound.volume = 0.05;
        blastSound.volume = 0.05;
        healthDownSound.volume = 0.05;
        gameOverSound.volume = 0.2;
        mahLazerSound.volume = 0.1;

    } else {
        bgMusic.volume = 0;
        gameStartSound.volume = 0;
        shipLaserSound.volume = 0;
        mediumLaserSound.volume = 0;
        blastSound.volume = 0;
        healthDownSound.volume = 0;
        gameOverSound.volume = 0;
        mahLazerSound.volume = 0;
    }
    sound = !sound;
}

function drawMenu() {

    c.fillStyle = "#101010";
    c.fillRect(0, 0, canvas.width, canvas.height);

    if (randomInt(0, 3) === 0) {
        menuParticles.push({
            x: canvas.width,
            y: randomInt(0, canvas.height),
            color: colors[randomInt(0, colors.length)],
            w: randomInt(4, 20)
        });
    }

    for (var i in menuParticles) {
        var particle = menuParticles[i];

        c.fillStyle = particle.color;
        c.fillRect(particle.x, particle.y, particle.w, 4);
    }

    c.fillStyle = "#151515";
    c.font = "90px Roboto";
    c.fillText("Space Impact", 120, 200);
    c.lineWidth = 2;
    c.strokeStyle = "#0072FF";
    c.strokeText('Space Impact', 120, 200);

    if (!hover) {
        c.fillStyle = "#2dbbff";
        c.fillRect(300, 300, 200, 70);
        c.fillStyle = "#000000";
        c.font = "38px Roboto";
        c.fillText("Play Game", 307, 347);
    } else {
        c.fillStyle = "#0063ad";
        c.fillRect(300, 300, 200, 70);
        c.fillStyle = "#000000";
        c.font = "38px Roboto";
        c.fillText("Play Game", 307, 347);
    }

    if (sound) {
        c.fillStyle = "#2dbbff";
        c.fillRect(50, canvas.height - 100, 50, 50);
        c.drawImage(soundImg.on, 55, canvas.height - 95, 40, 40);
    } else {
        c.fillStyle = "#0063ad";
        c.fillRect(50, canvas.height - 100, 50, 50);
        c.drawImage(soundImg.off, 55, canvas.height - 95, 40, 40);
    }

    c.fillStyle = "#ffffff";
    c.font = "16px Roboto Mono";
    c.fillText("Created by zoltanvi", canvas.width - 240, canvas.height - 10);

}

function removeMenuParticles() {
    if (menuParticles.length > 0 && menuParticles[0].x < 0) {
        menuParticles.shift();
    }
}

function moveMenuParticle() {
    for (var i in menuParticles) {
        var particle = menuParticles[i];
        particle.x -= 12;
    }
}

function drawBackground() {
    c.fillStyle = "#000000";
    c.fillRect(0, 0, canvas.width, canvas.height);
}

function drawUI() {
    c.fillStyle = "#ff001a";
    c.fillRect(0, 0, canvas.width, UIHeight + 3);

    c.fillStyle = "#e4e4e4";
    c.fillRect(0, 0, canvas.width, UIHeight);

    for (var i = 0; i < maxHealth; i++) {

        if (i < health) {
            c.drawImage(heart.imgFull, 40 + (i * heart.width) + (i * 10), 5, heart.width, heart.height);
        } else {
            c.drawImage(heart.imgEmpty, 40 + (i * heart.width) + (i * 10), 5, heart.width, heart.height);
        }
    }

    c.fillStyle = "#000000";
    c.font = "40px Roboto";
    c.fillText(score.toString(), 300, 37);

    if (killCounter >= 51) {
        var bossHP = 0;
        for (var i = 0; i < enemies.length; i++) {
            if (enemies[i].type === "boss") {
                bossHP = enemies[i].lives;
            }
        }

        c.fillStyle = "#be646c";
        c.font = "40px Roboto";
        c.fillText("Boss HP: " + bossHP, 500, 37);
    }

}


function drawShip() {
    if (!menu) {
        c.drawImage(ship.img, ship.x, ship.y, ship.width, ship.height);
    }
}


function shipSetPos(ev) {
    if (playing) {
        var rect = canvas.getBoundingClientRect();
        var mouseY = ev.clientY - rect.top - (ship.height / 2);
        var mouseX = ev.clientX - rect.left - (ship.width / 2);

        if (mouseX > 0 && mouseX < canvas.width / 3) {
            ship.x = mouseX;
            drawShip();
        }

        if (mouseY >= UIHeight && mouseY < canvas.height - 32) {
            ship.y = mouseY;
            drawShip();
        }

    }
}


function shipStartFire() {
    isShipFiring = true;
}

function shipStopFire() {
    isShipFiring = false;
    shipFireClock = 0;
}


function shipFire() {
    if (isShipFiring) {
        if (shipFireClock % fireRate === 0) {
            shipBullets.push({
                x: ship.x + ship.width,
                y: ship.y + (ship.height / 2) - 2,
                color: colors[randomInt(0, colors.length)]
            });

            shipLaserSound.currentTime = 0;
            shipLaserSound.play();
        }
        shipFireClock++;
    }
}

function drawShipBullets() {
    for (var i in shipBullets) {
        var _bullet = shipBullets[i];

        c.fillStyle = _bullet.color;
        c.fillRect(_bullet.x, _bullet.y, bullet.width, bullet.height);

        _bullet.x += 10;
    }
}

function removeShipBullets() {
    if (shipBullets.length > 0 && shipBullets[0].x > canvas.width) {
        shipBullets.shift();
    }
}

function distanceToEnemy(b, e) {
    var dx = (b.x + bullet.width / 2) - (e.x + enemy.width / 2);
    var dy = (b.y + bullet.height / 2) - (e.y + enemy.height / 2);
    return Math.sqrt(dx * dx + dy * dy);
}

function distanceToShip(s, e) {
    var dx = (s.x + ship.width / 2) - (e.x + enemy.width / 2);
    var dy = (s.y + ship.height / 2) - (e.y + enemy.height / 2);
    return Math.sqrt(dx * dx + dy * dy);
}

function distanceToShipE(s, b) {
    var dx = (s.x + (ship.width / 2)) - b.x;
    var dy = (s.y + (ship.height / 2)) - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function distanceToBoss(b, e) {
    var dx = (b.x + bullet.width / 2) - (e.x + boss.width / 2);
    var dy = (b.y + bullet.height / 2) - (e.y + boss.height / 2);
    return Math.sqrt(dx * dx + dy * dy);
}

function distanceToBossLaser(bo) {
    var sh = ship.y + ship.height / 2;
    var b = bo.y + boss.height / 2;
    return Math.sqrt((sh - b) * (sh - b));
}


function spawnEnemy() {
    if (enemies.length === 0 && killCounter >= 51) {
        bossAlive = false;
    }

    if (killCounter <= 10) {
        if (enemy.spawnClock % 35 === 0) {
            enemies.push({
                x: canvas.width,
                y: randomInt(UIHeight + 10, canvas.height - 30),
                type: "easy"
            });
        }
        enemy.spawnClock++;
    } else if (killCounter <= 25) {
        if (enemy.spawnClock % 55 == 0) {
            enemies.push({
                x: canvas.width,
                y: randomInt(UIHeight + 10, canvas.height - 30),
                type: "medium",
                shootClock: 0
            });
        }
        enemy.spawnClock++;
    } else if (killCounter <= 50) {
        if (enemy.spawnClock % 60 == 0) {
            enemies.push({
                x: canvas.width,
                y: randomInt(UIHeight + 10, canvas.height - 30),
                type: "hard",
                shootClock: 0,
                horizontal: randomInt(0, 1) == 0 ? 3 : -3
            });
        }
        enemy.spawnClock++;
    } else {
        if (!bossAlive && !won) {
            enemies.push({
                x: canvas.width - 100,
                y: canvas.height / 2,
                type: "boss",
                shootClock: 0,
                horizontal: randomInt(0, 1) == 0 ? 2 : -2,
                lives: 100,
                firing: false
            });
            bossAlive = true;

        }

    }
}

function drawEnemy() {
    for (var i in enemies) {
        var _enemy = enemies[i];


        if (_enemy.type != "boss") {
            if (gif++ % 50 < 25) {
                c.drawImage(enemy.img1, _enemy.x, _enemy.y, enemy.width, enemy.height);
            } else {
                c.drawImage(enemy.img2, _enemy.x, _enemy.y, enemy.width, enemy.height);
            }
        } else {
            if (bossFiring === false) {
                c.drawImage(boss.img1, _enemy.x, _enemy.y, boss.width, boss.height);
            } else {
                c.drawImage(boss.img2, _enemy.x, _enemy.y, boss.width, boss.height);
                c.fillStyle = "#4ad2ff";
                c.fillRect(0, _enemy.y + 38, _enemy.x + 50, 50);
                c.fillStyle = "#fffcf9";
                c.fillRect(0, _enemy.y + 48, _enemy.x + 50, 30);
            }
        }

        if (gif >= 1000000) {
            gif = 15;
        }

        if (_enemy.type === "easy") {
            _enemy.x -= 5;
        } else if (_enemy.type === "medium") {
            _enemy.x -= 4;

            if (_enemy.shootClock % 120 == 0) {
                enemyBullets.push({
                    x: _enemy.x,
                    y: _enemy.y,
                    type: "medium"
                });

                mediumLaserSound.currentTime = 0;
                mediumLaserSound.play();

            }
            _enemy.shootClock++;
        } else if (_enemy.type === "hard") {
            _enemy.x -= 6;

            if (_enemy.y >= canvas.height - 30 || _enemy.y <= UIHeight + 10) {
                _enemy.horizontal *= -1;
            }
            _enemy.y += _enemy.horizontal;

            if (_enemy.shootClock % 120 == 0) {
                enemyBullets.push({
                    x: _enemy.x,
                    y: _enemy.y,
                    type: "hard"
                });

                mediumLaserSound.currentTime = 0;
                mediumLaserSound.play();
            }
            _enemy.shootClock++;

        } else if (_enemy.type === "boss") {


            if (_enemy.y >= canvas.height - 100 || _enemy.y <= UIHeight) {
                _enemy.horizontal *= -1;
            }
            _enemy.y += _enemy.horizontal;

            if (_enemy.shootClock % 300 === 0) {
                mahLazerSound.currentTime = 0;
                mahLazerSound.play();
            }

            if (_enemy.shootClock % 300 >= 0 && _enemy.shootClock % 300 <= 80) {
                bossFiring = true;

            } else {
                bossFiring = false;
            }
            _enemy.shootClock++;

        }
    }
}

function drawEnemyBullets() {
    for (var i in enemyBullets) {
        var _bullet = enemyBullets[i];

        if (_bullet.type === "medium") {
            c.fillStyle = "#ff0700";
            c.fillRect(_bullet.x, _bullet.y, bullet.width, bullet.height);

            _bullet.x -= 7;
        } else if (_bullet.type === "hard") {
            c.fillStyle = "#ffdf00";
            c.fillRect(_bullet.x, _bullet.y, bullet.width, bullet.height);
            _bullet.x -= 10;
        }

    }
}

function checkEnemyBullets() {
    for (var i in enemyBullets) {
        var _bullet = enemyBullets[i];

        if (distanceToShipE(ship, _bullet) <= 20) {
            _bullet.x = 0;
            _bullet.y = -10000;

            healthDownSound.currentTime = 0;
            healthDownSound.play();

            health--;

        }

    }
}

function removeEnemyBullets() {
    if (enemyBullets.length > 0 && enemyBullets[0].x < 0) {
        enemyBullets.shift();
    }
}

function checkEnemy() {
    for (var i = 0; i < enemies.length; i++) {
        for (var j = 0; j < shipBullets.length; j++) {
            if (!won && enemies[i].type != "boss" && distanceToEnemy(shipBullets[j], enemies[i]) < 25) {
                enemies[i].y = -10000;
                shipBullets[j].y = -10000;

                enemies[i].x = 0;
                shipBullets[j].x = canvas.width - bullet.width;

                killCounter++;

                blastSound.currentTime = 0;
                blastSound.play();

                if (enemies[i].type === "easy") {
                    score += scores.easy;
                } else if (enemies[i].type === "medium") {
                    score += scores.medium;
                } else if (enemies[i].type === "hard") {
                    score += scores.hard;
                }
            }

            if (!won && enemies[i].type === "boss" && distanceToBoss(shipBullets[j], enemies[i]) < 50) {
                if (enemies[i].lives > 0) {
                    enemies[i].lives--;
                } else {

                    bossAlive = false;
                    killCounter++;
                    score += scores.boss;
                    won = true;

                    for (var x = 0; x < enemies.length; x++) {
                        enemies.pop();
                    }

                }

                blastSound.currentTime = 0;
                blastSound.play();

                shipBullets[j].y = -10000;

            }
        }
    }
}

function removeEnemy() {
    if (enemies.length > 0 && enemies[0].x <= 0) {
        enemies.shift();
    }
}

function checkShip() {
    for (var i = 0; i < enemies.length; i++) {
        if (distanceToShip(ship, enemies[i]) < 25) {
            enemies[i].y = -10000;
            enemies[i].x = 0;

            healthDownSound.currentTime = 0;
            healthDownSound.play();


            health--;
        }
    }
}

function checkBoss() {
    for (var i = 0; i < enemies.length; i++) {
        if (!won && enemies[i].type === "boss") {
            if (!bossFiring) {
                underFire = false;
            }

            if (bossFiring && distanceToBossLaser(enemies[i]) < 25 && !underFire) {
                health--;
                healthDownSound.currentTime = 0;
                healthDownSound.play();
                underFire = true;
            }
        }
    }
}


function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
