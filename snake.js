/* HTML constants */
const ID_GRID_VIEW = "grid_view"
const ID_SCORE = "score"
const ID_GAME_OVER_SCORE = "game_over_score"
const ID_BTN_RESTART = "btn_restart"
const ID_BTN_PLAY = "btn_pause_resume"
const ID_BTN_PLAY_TEXT = "btn_play_text"
const ID_BTN_PLAY_IC_PAUSE = "btn_play_ic_pause"
const ID_BTN_PLAY_IC_PLAY = "btn_play_ic_play"
const TEXT_PAUSE = "Pause"
const TEXT_RESUME = "Resume"
const TEXT_PLAY = "Play"

/* Game constants */
const GRID_HEIGHT = 41                                                                      // Number of blocks vertically
const GRID_WIDTH = 41                                                                       // Number of blocks horizontally
const FRAME_DUR = 150                                                                       // Duration per frame in milliseconds
const START_X = 0                                                                           // X-coordinate of the snake's starting point
const START_Y = 10                                                                          // Y-coordinate of the snake's starting point
const SCORE_OFFSET = 10                                                                     // Score per food
const SNAKE_LENGTH = 4                                                                      // Initial length of the snake
const GAME_OVER_DUR = 20                                                                    // Game over dialog duration in number of frames 
const Direction = {
    "UP": -1,
    "DOWN": 1,
    "LEFT": -2,
    "RIGHT": 2
}

/* Represents a single point/block in the grid field; stores its coordinates */
class Point {
    /**
     * @param {number} x - the X-coordinate of the point
     * @param {number} y - the Y-coordinate of the point
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

/* Creates and manages the game and all of its activities */
class Game {
    /**
     * Make everything ready for starting the game
     * @param {document} doc - the html document
     */
    constructor(doc) {
        this.started = false;
        this.running = false;
        this.doc = doc;
        this.snake = new Snake(GRID_WIDTH, GRID_HEIGHT, START_X, START_Y, SNAKE_LENGTH);
        this.food = new Point(Math.floor(Math.random() * GRID_WIDTH), Math.floor(Math.random() * GRID_HEIGHT));
        this.delay = 0;
        this.score = 0;
        this.topScore = 0;
        this.updateScore();
        this.makeGrid(GRID_WIDTH, GRID_HEIGHT);
        // Initial appearance: stopped state
        this.setStoppedAppearance();
    }

    /**
     * Generates HTML for grid view of the given width and height
     * @param {number} w - width of the grid
     * @param {number} h - height of the grid
     */
    makeGrid(w, h) {
        let grids = "";
        for (let i = 0; i < h; ++i) {
            for (let j = 0; j < w; ++j) {
                grids += "<div class=\"point\"></div>";
            }
        }
        this.doc.getElementById(ID_GRID_VIEW).innerHTML = grids;
    }

    /**
     * Updates HTML for a given point to make it active/inactive
     * We use this function to make points active and draw the snake
     * Or to make points inactive to clear the snake
     * @param {number} x - X-coordinate of the point
     * @param {number} y - Y-coordinate of the point
     * @param {boolean} active - true to make this point active, false otherwise
     */
    updatePoint(x, y, active) {
        let pos = y * GRID_WIDTH + x;
        let element = this.doc.getElementById(ID_GRID_VIEW).children[pos];
        if (active == true) {
            element.setAttribute("class", "point-active");
        } else {
            element.setAttribute("class", "point");
        }
    }

    /**
     * Updates HTML for a given point(food) to make it active/inactive
     * We use this function to make a point active and draw the food
     * Or to make a point inactive and clear the food
     * @param {number} x - X-coordinate of the point
     * @param {number} y - Y-coordinate of the point
     * @param {boolean} active - true to make this point active, false otherwise
     */
    updateFood(x, y, active) {
        let pos = y * GRID_WIDTH + x;
        let element = this.doc.getElementById(ID_GRID_VIEW).children[pos];
        if (active == true) {
            element.setAttribute("class", "food");
        } else {
            element.setAttribute("class", "point");
        }
    }

    /**
     * Updates HTML/CSS for the buttons as in stopped state
     */
    setStoppedAppearance() {
        this.doc.getElementById(ID_BTN_PLAY_IC_PAUSE).style.display = 'none';               // Hide pause icon
        this.doc.getElementById(ID_BTN_PLAY_IC_PLAY).style.display = 'inline-block';        // Show play icon
        this.doc.getElementById(ID_BTN_PLAY_TEXT).innerHTML = TEXT_PLAY;                    // Change text to 'Play'
        this.doc.getElementById(ID_BTN_RESTART).disabled = true;                            // Disable restart button
    }

    /**
     * Updates HTML/CSS for the buttons as in resumed state
     */
    setResumedAppearance() {
        this.doc.getElementById(ID_BTN_PLAY_IC_PLAY).style.display = 'none';                // Hide play icon
        this.doc.getElementById(ID_BTN_PLAY_IC_PAUSE).style.display = 'inline-block';       // Show pause icon
        this.doc.getElementById(ID_BTN_PLAY_TEXT).innerHTML = TEXT_PAUSE;                   // Change text to 'Pause'
        this.doc.getElementById(ID_BTN_RESTART).disabled = true;                            // Disable restart button
    }

    /**
     * Updates HTML/CSS for the buttons as in paused state
     */
    setPausedAppearance() {
        this.doc.getElementById(ID_BTN_PLAY_IC_PAUSE).style.display = 'none';               // Hide pause icon
        this.doc.getElementById(ID_BTN_PLAY_IC_PLAY).style.display = 'inline-block';        // Show play icon
        this.doc.getElementById(ID_BTN_PLAY_TEXT).innerHTML = TEXT_RESUME;                  // Change text to 'Resume'
        this.doc.getElementById(ID_BTN_RESTART).disabled = false;                           // Enable restart button
    }

    /**
     * Updates HTML/CSS to show/hide the game over modal dialog
     * @param {boolean} show true to show, or false to hide
     */
    showGameOverModal(show) {
        let modal = this.doc.getElementById('game_over_modal');
        if (show == true) {
            modal.style.display = 'flex';
        } else {
            modal.style.display = 'none';
        }
    }

    /**
     * Starts the game from initial state
     */
    startGame() {
        // Ignore if already started
        if (this.started) {
            return;
        }
        // Reveal food
        this.showFood();
        // Reveal snake
        for (let i = 0; i < this.snake.points.length; i++) {
            const point = this.snake.points[i];
            this.updatePoint(point.x, point.y, true);
        }
        // Set started status
        this.started = true;
        this.running = true;
        // Appearance change: resumed state
        this.setResumedAppearance();
    }

    /**
     * Pauses the started game
     */
    pauseGame() {
        // Ignore if already paused or stopped
        if (!this.running || !this.started) {
            return;
        }
        // Set paused status
        this.running = false;
        // Appearance change: paused state
        this.setPausedAppearance();
    }

    /**
     * Resumes the previously paused game
     */
    resumeGame() {
        // Ignore if already resumed or not started
        if (this.running || !this.started) {
            return;
        }
        // Set resumed status
        this.running = true;
        // Appearance change: resumed state
        this.setResumedAppearance();
    }

    /**
     * Stops the game and resets to inital state
     * After calling this function, the game can be started again by calling startGame()
     */
    stopGame() {
        // Ignore if already stopped
        if (!this.started) {
            return;
        }
        // Clear food
        this.clearFood();
        // Clear snake
        for (let i = 0; i < this.snake.points.length; i++) {
            const point = this.snake.points[i];
            this.updatePoint(point.x, point.y, false);
        }
        // Set stopped status
        this.started = false;
        this.running = false;
        this.setNewFood();
        this.snake.resetSnake(START_X, START_Y, SNAKE_LENGTH);
        this.score = 0;
        this.updateScore();
        // Appearance change: stopped state
        this.setStoppedAppearance();
    }

    /**
     * Generates a random point for new food ensuring that it is not on the snake's body
     * @returns a random point(food)
     */
    setNewFood() {
        // Generate new random point for food
        let newFood = new Point(Math.floor(Math.random() * GRID_WIDTH), Math.floor(Math.random() * GRID_HEIGHT));
        // Check if this point is on the snake body
        for (let i = 0; i < this.snake.points.length; i++) {
            let point = this.snake.points[i];
            if (newFood.x == point.x && newFood.y == point.y) {
                return this.setNewFood();
            }
        }
        this.food = newFood;
    }

    /**
     * Make the current food visible
     */
    showFood() {
        this.updateFood(this.food.x, this.food.y, true);
    }

    /**
     * Make the current food invisible
     */
    clearFood() {
        this.updateFood(this.food.x, this.food.y, false);
    }

    /**
     * Updates HTML for the score section with the current score and also saves top score
     */
    updateScore() {
        this.doc.getElementById(ID_SCORE).innerHTML = this.score;
        this.doc.getElementById(ID_GAME_OVER_SCORE).innerHTML = this.score;
    }

    /**
     * Called once on each frame
     * Used to make the snake transition, food position etc. frame by frame
     */
    onFrame() {
        if (this.delay > 0) {
            --this.delay;
            if (this.delay == 0) {
                // Hide the game over dialog
                this.showGameOverModal(false);
                // Finally, stop the game
                this.stopGame();
            }
        } else if (this.started && this.running) {
            let tail = this.snake.tail;
            let status = this.snake.moveSnake(this.food);
            if (status == Snake.COLIDED) {
                // Set delay for the modal
                this.delay = GAME_OVER_DUR;
                // Show game over modal and stop later
                this.showGameOverModal(true);
            } else if (status == Snake.CONSUMED) {
                // Increase score and save top score (further implementation) if necessary
                this.score += SCORE_OFFSET;
                if (this.score > this.topScore) {
                    this.topScore = this.score;
                }
                // Update score
                this.updateScore();
                // Update old food as snake's body so that it does not go over the snake
                this.updatePoint(this.food.x, this.food.y, true);
                // Set new food and reveal
                this.setNewFood();
                this.showFood();
            } else if (status == Snake.AVOIDED) {
                // Clearing tail, and adding head for transition
                this.updatePoint(tail.x, tail.y, false);
                let head = this.snake.head;
                this.updatePoint(head.x, head.y, true);
            }
        }
    }
}

/* Represents the snake; stores its body, length, directions etc. */
class Snake {
    static CONSUMED = 1;                                                                // Food consumed by snake
    static AVOIDED = 2;                                                                 // Food not consumed by snake
    static COLIDED = 3;                                                                 // Collision with walls
    /**
     * Initializes the snake with an initial coordinate and a fixed length. [(w-x) >= len]
     * @param {number} w - width of the grid
     * @param {number} h - height of the grid
     * @param {number} x - initial X-coordinate
     * @param {number} y - initial Y-coordinate
     * @param {number} len - initial length of the snake
     */
    constructor(w, h, x, y, len) {
        // Save grid size
        this.w = w;
        this.h = h;
        // Create points
        this.points = [];
        for (let i = 0; i < len; i++) {
            this.points.push(new Point(x + i, y));
        }
        // Default direction is to-right
        this.directions = [Direction.RIGHT];
        this.activeDirection = [Direction.RIGHT];
    }

    /**
     * Changes the current direction of the snake to a specified direction
     * @param {number} newDirection - new direction to change
     * @returns {boolean} true if direction was changed, false otherwise
     */
    changeDirection(newDirection) {
        let len = this.directions.length;
        let last = this.directions[len - 1];
        // Reverse direction not allowed
        if (newDirection + last == 0) {
            return false;
        }
        // If last direction is not yet active, post new direction so that last is not lost;
        // Otherwise, replace direction directly
        if (last != this.activeDirection) {
            this.directions.push(newDirection);
        } else {
            this.directions[len - 1] = newDirection;
        }
        return true;
    }

    /**
     * Move the snake one frame with its transition info
     * Called on each frame when the game is running
     * @param {Point} food - the Point containing the coordinate of the food
     * @returns {number} - {@member CONSUMED} if food consumed, {@member AVOIDED} if food not consumed, {@member COLIDED} if collision occurred
     */
    moveSnake(food) {
        // Getting head coordinates
        let x = this.head.x;
        let y = this.head.y;
        // Obtaining direction
        let direction = this.directions[0];
        this.activeDirection = direction;
        if (this.directions.length > 1) {
            this.directions.shift();
        }
        if (direction == Direction.UP) {
            --y;
        } else if (direction == Direction.DOWN) {
            ++y;
        } else if (direction == Direction.LEFT) {
            --x;
        } else if (direction == Direction.RIGHT) {
            ++x;
        }
        // Checking for collision
        if (x < 0 || x >= this.w || y < 0 || y >= this.h) {
            console.log("Colided, x=" + x + " y=" + y);
            return Snake.COLIDED;
        } else {
            for (let i = 0; i < this.points.length; i++) {
                let point = this.points[i];
                if (x == point.x && y == point.y) {
                    return Snake.COLIDED;
                }
            }
        }
        // Adding new head
        this.points.push(new Point(x, y))
        if (x == food.x && y == food.y) {
            // Food consumed
            return Snake.CONSUMED;
        }
        // Food not conusmed
        this.points.shift();
        return Snake.AVOIDED;
    }

    /**
     * Resets the snake with an initial coordinate and a fixed length.
     * Called after stopped state
     * @param {number} x - initial x coordinate
     * @param {number} y - initial y coordinate
     * @param {number} len - initial length of the snake
     */
    resetSnake(x, y, len) {
        // Creating points
        this.points = [];
        for (let i = 0; i < len; i++) {
            this.points.push(new Point(x + i, y));
        }
        // Default direction is to-right
        this.directions = [Direction.RIGHT];
        this.activeDirection = [Direction.RIGHT];
    }

    get head() {
        return this.points[this.points.length - 1];
    }

    get tail() {
        return this.points[0];
    }
}




/* Here we go: Our main page logics */
var game;
var intervalId;

function loadAll() {
    game = new Game(document);
    // Start the frames
    intervalId = setInterval(() => {
        game.onFrame();
    }, FRAME_DUR);
    // Adding listener
    document.addEventListener("keyup", function (event) {
        handleKeyPress(event.key);
    })
}

function handleKeyPress(keyCode) {
    switch (keyCode) {
        case "P":
        case "p":
            doPlayOrPause();
            return;
        case "R":
        case "r":
            doRestart();
            return;
        default:
            if (game.running) {
                switch (keyCode) {
                    case "ArrowUp":
                        game.snake.changeDirection(Direction.UP);
                        break;
                    case "ArrowDown":
                        game.snake.changeDirection(Direction.DOWN);
                        break;
                    case "ArrowLeft":
                        game.snake.changeDirection(Direction.LEFT);
                        break;
                    case "ArrowRight":
                        game.snake.changeDirection(Direction.RIGHT);
                        break;
                    default:
                        break;
                }
            }
    }
}

function doRestart() {
    // Restart operation, only if game is paused
    if (game.started && !game.running) {
        game.stopGame();
        game.startGame();
    }
}

function doPlayOrPause() {
    if (game.started) {
        // Game started, hence resume/pause operation
        if (game.running) {
            game.pauseGame();
        } else {
            game.resumeGame();
        }
    } else {
        // Game not started, hence start operation
        game.startGame();
    }
}