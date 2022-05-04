/**
 * Pac Man Game
 * 
 * The following is a pac man game with 3 ghosts where the user has to collect all
 * the pac dots before getting eaten by the ghosts.
 * 
 * 
 * Created by: Elia El Atram
 * On: 25/11/2020
 */

//getting the canvas
var canvas = document.getElementById("EliaCanvas");
var ctx = canvas.getContext("2d");

canvas.width = 600; // setting canvas width
canvas.height = 600; // setting canvas height

var choice = false; // user choice initially false
var endGame = false; // ending the game state
var pacDots = 0; // initial number of pacdots

var gridDivision = 40; // cell grid size
var gridWidth = 600 / gridDivision; // logical grid width
var gridHeight = 600 / gridDivision; // logical grid height

// declaring the grid 2d array
var arrayOfCells = [];
for (var i = 0; i < gridHeight; i++) {
    arrayOfCells[i] = [];
}

// changing the background based on the users choice
// this imgae object will be constintly changing when the user presses different options of the game like play or end
var mainMenu = new Image();
mainMenu.src = "./assets/images/Main.png";

var cherryImage = new Image(); // cherry image
var lifeImage = new Image(); // life image

var cherryReady = false; // cherry image state
var lifeReady = false; // life image state

// changing the state of the cherry image on load
cherryImage.onload = () => {
    cherryReady = true;
}
cherryImage.src = "./assets/images/cherry.png";

// changing the state of the life image on load
lifeImage.onload = () => {
    lifeReady = true;
}
lifeImage.src = "./assets/images/life.png";

// taking input from the user
var keysdown = [];

// add an eventListener to browser window
addEventListener("keydown", (e) => {
    keysdown = [];
    keysdown.push(e.keyCode);
}, false);

// add an eventListener to browser window
addEventListener("keyup", (e) => {
    delete keysdown[e.keyCode];
}, false);

// creating the sound function
function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function () {
        this.sound.play();
    };
    this.stop = function () {
        this.sound.pause();
    };
}

var intro = new sound("./assets/audios/PacmanIntro.mp3"); // intro of the game sound
var eating = new sound("./assets/audios/PacmanEating.wav"); // pacman eating dots sound effect
var eatingCherry = new sound("./assets/audios/PacmanCherry.mp3"); // pacman eating cherry sound effect
var dying = new sound("./assets/audios/PacmanDying.mp3"); // pacman dying sound effect
var eatingGhost = new sound("./assets/audios/PacmanGhost.mp3"); // pacman eating ghost sound effect
var moving = new sound("./assets/audios/PacmanMoving.mp3"); // pacman moving sound
var extraLife = new sound("./assets/audios/PacmanExtraLife.mp3"); // pacman getting extra life sound effect

// global collision criteria
function collision(firstObjectX, firstObjectY, firstObjectHeight, firstObjectWidth,
    secondObjectX, secondObjectY, secondObjectHeight, seconObjectWidth) {
    if (firstObjectX < secondObjectX + seconObjectWidth
        && firstObjectX + firstObjectWidth > secondObjectX
        && firstObjectY < secondObjectY + secondObjectHeight
        && firstObjectY + firstObjectHeight > secondObjectY) {
        return true;
    }
}

// the menu function that will handle the change of the background
function menu() {
    ctx.drawImage(mainMenu, 0, 0, 600, 600);
}

// assigning menu options for the user
function options(event) {
    var x = event.clientX;
    var y = event.clientY;

    // starting the game
    if (x >= 221 && x < 403 && y >= 221 && y < 257 && endGame === false) {
        choice = true;
        intro.play();
    }

    // displaying a message for the end of the game
    else if (x >= 221 && x < 403 && y >= 384 && y < 416) {
        ctx.fillStyle = "yellow";
        ctx.font = "34px Helvetica";
        ctx.textAlign = "center";
        ctx.textBaseline = "center";
        ctx.fillText("Thanks for Playing", 300, 320);
        endGame = true;
        moving.stop()
        return false;
    }
}


class Cell {
    /**
     * 
     * @param {*} x x position of the cell
     * @param {*} y y position of the cell
     * @param {*} isWall wall state of the cell
     */
    constructor(x, y, isWall) {
        this.xPos = x;
        this.yPos = y;
        this.wall = isWall;
        this.pacDot = false; // pacdot criteria
        this.isCherry = false; // cherry criteria
        this.isLife = false; // life criteria
    }

    // draw function of the class
    draw() {
        // the cell becomes black if it is a wall
        if (this.wall) {
            ctx.fillStyle = "black";
        }
        // the cell becomes blue if it is not a wall
        else {
            ctx.fillStyle = "blue";
        }
        ctx.beginPath();
        ctx.fillRect(this.xPos * gridDivision, this.yPos * gridDivision, gridDivision, gridDivision);

        // drawing pacdots
        if (this.pacDot === true) {
            ctx.beginPath();
            ctx.fillStyle = "white";
            ctx.lineWidth = 1;
            ctx.arc(this.xPos * gridDivision + 20, this.yPos * gridDivision + 20, 4, 0, 2 * Math.PI, false);
            ctx.fill();
        }

        // drawing cherry
        else if (this.isCherry === true) {
            if (cherryReady) {
                ctx.drawImage(cherryImage, this.xPos * gridDivision, this.yPos * gridDivision, 40, 40);
            }
        }

        // drawing life
        else if (this.isLife === true) {
            if (lifeReady) {
                ctx.drawImage(lifeImage, this.xPos * gridDivision, this.yPos * gridDivision, 40, 40);
            }
        }
    }
}

// intializing the grid by setting every position in the 2d array to a new cell object
// setting the walls
function initializeGrid() {

    for (var x = 0; x < gridHeight; x++) {
        for (var y = 0; y < gridWidth; y++) {
            arrayOfCells[x][y] = new Cell(x, y, false);
        }
    }

    for (var i = 0; i < arrayOfCells.length; i++) {
        arrayOfCells[i][0].wall = true;
        arrayOfCells[i][arrayOfCells.length - 1].wall = true;
        arrayOfCells[0][i].wall = true;
        arrayOfCells[arrayOfCells.length - 1][i].wall = true;
    }

    for (var i = 2; i < 7; i++) {
        arrayOfCells[i][2].wall = true;
        arrayOfCells[i][arrayOfCells.length - 3].wall = true;
    }

    for (var i = 8; i < arrayOfCells.length - 2; i++) {
        arrayOfCells[i][2].wall = true;
        arrayOfCells[i][arrayOfCells.length - 3].wall = true;
    }

    for (var i = 2; i < 7; i++) {
        arrayOfCells[2][i].wall = true;
        arrayOfCells[arrayOfCells.length - 3][i].wall = true;
    }

    for (var i = 8; i < arrayOfCells.length - 2; i++) {
        arrayOfCells[2][i].wall = true;
        arrayOfCells[arrayOfCells.length - 3][i].wall = true;
    }

    for (var i = 5; i < 7; i++) {
        arrayOfCells[i][5].wall = true;
        arrayOfCells[i][arrayOfCells.length - 6].wall = true;
    }

    for (var i = 8; i < arrayOfCells.length - 5; i++) {
        arrayOfCells[i][5].wall = true;
        arrayOfCells[i][arrayOfCells.length - 6].wall = true;
    }

    for (var i = 5; i < 7; i++) {
        arrayOfCells[5][i].wall = true;
        arrayOfCells[arrayOfCells.length - 6][i].wall = true;
    }

    for (var i = 5; i < arrayOfCells.length - 5; i++) {
        arrayOfCells[5][i].wall = true;
        arrayOfCells[arrayOfCells.length - 6][i].wall = true;
    }
}

// drawing the grid
// looping over the 2d array and drawing all cell objects
function drawGrid() {
    for (var i = 0; i < gridHeight; i++) {
        for (var j = 0; j < gridHeight; j++) {
            arrayOfCells[i][j].draw();
        }
    }
}

// initialzing pac dots along with all extra elements such as lifes and cherries
function initializePacDots() {
    for (var i = 0; i < gridHeight; i++) {
        for (var j = 0; j < gridHeight; j++) {
            if (arrayOfCells[i][j].wall === false) {
                if (i === 3 && j === 3) {
                    continue;
                }
                else if ((i === 13 && j === 1) || (i === 1 && j === 13) || (i === 13 && j === 13)) {
                    arrayOfCells[i][j].isCherry = true;
                }
                else if (i === 7 && j === 7) {
                    arrayOfCells[i][j].isLife = true;
                }
                else {
                    arrayOfCells[i][j].pacDot = true;
                    pacDots++;
                }
            }
        }
    }
}

class Pacman {
    constructor() {
        this.x = arrayOfCells[3][3].xPos * gridDivision; // initial x position of pacman
        this.y = arrayOfCells[3][3].xPos * gridDivision; // initial y position of pacman
        this.speed = 4; // speed of pacman
        this.directionX = 0; // x direction of pacman
        this.directionY = 0; // y direction of pacman
        this.pacmanImage = new Image(); // pacman image
        this.pacmanImage.src = "./assets/images/pacmanRight.png";
        this.pacmanImage.onload = () => {
            this.pacmanReady = true;
        }

        this.life = 3; // number of pacman lifes
        this.score = 0; // score of the user
        this.collided = false; // intial collision state
        this.powerUp = false; // initial power up state
        this.powerUpTime = 0; // initial power up timer
    }

    // draw function of the class
    draw(ctx) {
        // drawing pacman
        if (this.pacmanReady) {
            ctx.drawImage(this.pacmanImage, this.x, this.y, 40, 40);
        }

        // drawing number of lifes left
        ctx.fillStyle = "white";
        ctx.font = "24px Helvetica";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText("life: ", 50, 20);

        // drawing score
        ctx.font = "24px Helvetica";
        ctx.textAlign = "right";
        ctx.textBaseline = "top";
        ctx.fillText("score: " + this.score, 550, 20);

        // checking number of lifes
        if (this.life >= 1) {
            ctx.drawImage(this.pacmanImage, 90, 20, 20, 20);
        }
        if (this.life >= 2) {
            ctx.drawImage(this.pacmanImage, 112, 20, 20, 20);
        }
        if (this.life === 3) {
            ctx.drawImage(this.pacmanImage, 134, 20, 20, 20);
        }
    }

    // update function
    update() {
        this.x += this.directionX * this.speed;
        this.y += this.directionY * this.speed;
        if (this.powerUp === true) {
            this.powerUpTime++;
            if (this.powerUpTime >= 180) {
                this.powerUp = false;
                this.powerUpTime = 0;
            }
        }

        // restricting the movement to 40, cell by cell
        if (this.x % gridDivision === 0 && this.y % gridDivision === 0) {

            // moving according to user input while checking neighbors for collision
            if (keysdown[0] === 37) {
                if (arrayOfCells[Math.floor(this.x / gridDivision) - 1][Math.floor(this.y / gridDivision)].wall === false) {
                    this.directionX = -1;
                    this.directionY = 0;
                    this.pacmanImage.src = "./assets/images/pacmanLeft.png";
                    keysdown = [];
                }
            }
            if (keysdown[0] === 38) {
                if (arrayOfCells[Math.floor(this.x / gridDivision)][Math.floor(this.y / gridDivision) - 1].wall === false) {
                    this.directionX = 0;
                    this.directionY = -1;
                    this.pacmanImage.src = "./assets/images/pacmanUp.png";
                    keysdown = [];
                }
            }
            if (keysdown[0] === 39) {
                if (arrayOfCells[Math.floor(this.x / gridDivision) + 1][Math.floor(this.y / gridDivision)].wall === false) {
                    this.directionX = 1;
                    this.directionY = 0;
                    this.pacmanImage.src = "./assets/images/pacmanRight.png";
                    keysdown = [];
                }
            }
            if (keysdown[0] === 40) {
                if (arrayOfCells[Math.floor(this.x / gridDivision)][Math.floor(this.y / gridDivision) + 1].wall === false) {
                    this.directionX = 0;
                    this.directionY = 1;
                    this.pacmanImage.src = "./assets/images/pacmanDown.png";
                    keysdown = [];
                }
            }
            if (this.directionX === -1) {
                if (arrayOfCells[Math.floor(this.x / gridDivision) - 1][Math.floor(this.y / gridDivision)].wall === true) {
                    this.directionX = 0;
                }
            }
            if (this.directionY === -1) {
                if (arrayOfCells[Math.floor(this.x / gridDivision)][Math.floor(this.y / gridDivision) - 1].wall === true) {
                    this.directionY = 0;
                }
            }
            if (this.directionX === 1) {
                if (arrayOfCells[Math.floor(this.x / gridDivision) + 1][Math.floor(this.y / gridDivision)].wall === true) {
                    this.directionX = 0;
                }
            }
            if (this.directionY === 1) {
                if (arrayOfCells[Math.floor(this.x / gridDivision)][Math.floor(this.y / gridDivision) + 1].wall === true) {
                    this.directionY = 0;
                }
            }

            // checking for collision with pacdots
            if (arrayOfCells[Math.floor(this.x / gridDivision)][Math.floor(this.y / gridDivision)].pacDot === true) {
                eating.play();
                this.score += 10;
                pacDots--;
                arrayOfCells[Math.floor(this.x / gridDivision)][Math.floor(this.y / gridDivision)].pacDot = false;
            }
            // checking for collision with cherries
            else if (arrayOfCells[Math.floor(this.x / gridDivision)][Math.floor(this.y / gridDivision)].isCherry === true) {
                if (this.powerUp === true) {
                    this.powerUpTime = 0;
                }
                eatingCherry.play();
                this.score += 20;
                this.powerUp = true;
                arrayOfCells[Math.floor(this.x / gridDivision)][Math.floor(this.y / gridDivision)].isCherry = false;
            }
            // checking for collision with life
            else if (arrayOfCells[Math.floor(this.x / gridDivision)][Math.floor(this.y / gridDivision)].isLife === true) {
                extraLife.play();
                if (this.life < 3) {
                    this.life++;
                }
                arrayOfCells[Math.floor(this.x / gridDivision)][Math.floor(this.y / gridDivision)].isLife = false;
            }

            // checking for collision with ghosts
            this.ghostCollision(ghost1, ghost1.dead);
            this.ghostCollision(ghost2, ghost2.dead);
            this.ghostCollision(ghost3, ghost3.dead);
        }
    }

    // global collision function of ghost with pacman
    ghostCollision(ghost, dead) {
        if (dead === false) {
            if (collision(this.x, this.y, 40, 40, ghost.x, ghost.y, 40, 40)) {
                if (this.powerUp === true) {
                    eatingGhost.play();
                    ghost.setDead(true);
                }
                else {
                    dying.play();
                    this.reset();
                    this.life--;
                }
            }
        }
    }

    // resetting the criterias of pacman 
    reset() {
        this.x = arrayOfCells[3][3].xPos * gridDivision;
        this.y = arrayOfCells[3][3].xPos * gridDivision;
        this.directionX = 0;
        this.directionY = 0;
    }
}

class Ghost {
    /**
     * 
     * @param {*} startX x initial position of the ghost
     * @param {*} startY y initial position of the ghost
     * @param {*} movement nature of movement of the ghost
     */
    constructor(startX, startY, movement) {
        this.x = arrayOfCells[startX][startY].xPos * gridDivision;
        this.y = arrayOfCells[startX][startY].yPos * gridDivision;
        this.movement = movement;
        this.ghostImage = new Image();
        this.ghostReady = false;
        this.ghostImage.onload = () => {
            this.ghostReady = true;
        }
        this.ghostImage.src = "./assets/images/Ghost.png";

        this.move = 4;
        this.dead = false;
        this.deadTime = 0;
    }

    // drawing the ghosts based on its state dead or not
    draw(ctx) {
        if (this.ghostReady) {
            if (this.dead === true) {
                this.ghostImage.src = "./assets/images/GhostDead.png";
            }
            else {
                this.ghostImage.src = "./assets/images/Ghost.png";
            }
            ctx.drawImage(this.ghostImage, this.x, this.y, 40, 40);
        }
    }

    // updating ghost movement
    update() {
        if (this.dead === true) {
            this.deadTime++;
            if (this.deadTime >= 180) {
                this.dead = false;
                this.deadTime = 0;
            }
        }

        // vertical nature movement
        if (this.movement === "vertical") {
            this.y += this.move;
            if (arrayOfCells[Math.floor(this.x / gridDivision)][Math.floor(this.y / gridDivision) + 1].wall === true) {
                this.move = -4;
            }
            else if (arrayOfCells[Math.floor(this.x / gridDivision)][Math.floor(this.y / gridDivision)].wall === true) {
                this.move = 4;
            }
        }

        // horizontal nature movement
        else if (this.movement === "horizontal") {
            this.x += this.move;
            if (arrayOfCells[Math.floor(this.x / gridDivision) + 1][Math.floor(this.y / gridDivision)].wall === true) {
                this.move = -4;
            }
            else if (arrayOfCells[Math.floor(this.x / gridDivision)][Math.floor(this.y / gridDivision)].wall === true) {
                this.move = 4;
            }
        }
    }

    // changing the dead status of the ghost
    setDead(status) {
        this.dead = status;
    }
}

// handling the ghost draw and update
function ghostState(ghost) {
    ghost.draw(ctx);
    ghost.update();
}

// resetting the game criterias
function gameReset() {
    pacman.life = 3;
    pacman.score = 0;
    pacDots = 0;
    keysdown = [];
    pacman.reset();
    ghost1.x = 13 * gridDivision;
    ghost1.y = 1 * gridDivision;
    ghost2.x = 1 * gridDivision;
    ghost2.y = 13 * gridDivision;
    ghost3.x = 1 * gridDivision;
    ghost3.y = 13 * gridDivision;
    choice = false;
    initializePacDots();
}

initializeGrid(); // intializing the grid
initializePacDots(); // intializing pacdots

let pacman = new Pacman(); // delcaring pacman object

// delcaring the 3 ghost objects
let ghost1 = new Ghost(13, 1, "vertical");
let ghost2 = new Ghost(1, 13, "vertical");
let ghost3 = new Ghost(1, 13, "horizontal");

var main = function () {

    // displaying menu
    menu();

    // checking if player chose his option
    if (choice === false) {
        // taking input from the mouse
        addEventListener("click", options, false);
    }

    // launching game
    else {
        drawGrid(); // drawing the grid

        pacman.draw(ctx); // drawing pacman
        pacman.update(); // updating pacmam

        // updating and drawing ghosts
        ghostState(ghost1);
        ghostState(ghost2);
        ghostState(ghost3);

        // checking if pacman is dead or not
        if (pacman.life > 0) {
            moving.play();
        }

        // displaying losing menu
        else {
            mainMenu.src = "./assets/images/Lost.png";
            gameReset();
        }

        // displaying winning menu
        if (pacDots === 0) {
            mainMenu.src = "./assets/images/Won.png";
            gameReset();
        }
    }

    // Game loop keeps repeating until the user chooses to end the game
    if (endGame != true) {
        requestAnimationFrame(main);
    }
}

requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame
    || window.msRequestAnimationFrame || window.mozRequestAnimationFrame;
main();