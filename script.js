
/*
    VOSC Activity-1
    Ludo Game

    Players:
    0 = Red
    1 = Green
    2 = Yellow
    3 = Blue
*/


// =========================
// PLAYER DATA
// =========================

const players = [
    {
        name: "Red",
        color: "#c0392b",
        start: 0
    },

    {
        name: "Green",
        color: "#27ae60",
        start: 13
    },

    {
        name: "Yellow",
        color: "#d4ac0d",
        start: 26
    },

    {
        name: "Blue",
        color: "#2980b9",
        start: 39
    }
];


// =========================
// GAME VARIABLES
// =========================

let currentPlayer = 0;

let diceValue = 0;

let gameOver = false;


// Each player has 4 tokens.
//
// position = -1
// means token is still at home.
//
// position = 0 to 51
// means token is on the main path.
//
// position = 52 to 56
// means token is moving toward home.
//
// position = 57
// means token reached the finish.

let tokens = [];


// Create 4 tokens for every player

function createTokens() {

    tokens = [];

    for (let player = 0; player < 4; player++) {

        let playerTokens = [];

        for (let i = 0; i < 4; i++) {

            playerTokens.push({
                position: -1
            });

        }

        tokens.push(playerTokens);
    }
}


// =========================
// CREATE BOARD
// =========================

const pathElement =
    document.getElementById("path");


function createBoard() {

    pathElement.innerHTML = "";

    for (let i = 0; i < 36; i++) {

        const cell =
            document.createElement("div");

        cell.classList.add("path-cell");

        cell.id = "cell-" + i;

        // Some cells are safe

        if ([0, 8, 13, 21, 26, 34].includes(i)) {

            cell.classList.add("safe");

            cell.textContent = "⭐";
        }

        // Starting cells

        if (i === 0) {

            cell.classList.add("start-red");

            cell.textContent = "R";
        }

        if (i === 9) {

            cell.classList.add("start-green");

            cell.textContent = "G";
        }

        if (i === 18) {

            cell.classList.add("start-yellow");

            cell.textContent = "Y";
        }

        if (i === 27) {

            cell.classList.add("start-blue");

            cell.textContent = "B";
        }

        pathElement.appendChild(cell);
    }
}


// =========================
// DISPLAY TOKENS
// =========================

function renderTokens() {

    // Remove existing board tokens

    document
        .querySelectorAll(".board-token")
        .forEach(token => token.remove());


    for (let player = 0; player < 4; player++) {

        for (let tokenIndex = 0; tokenIndex < 4; tokenIndex++) {

            const tokenData =
                tokens[player][tokenIndex];

            // Token still at home

            if (tokenData.position === -1) {
                continue;
            }

            // Finished token

            if (tokenData.position === 57) {
                continue;
            }

            const cellIndex =
                getBoardPosition(
                    player,
                    tokenData.position
                );

            const cell =
                document.getElementById(
                    "cell-" + cellIndex
                );

            if (!cell) {
                continue;
            }

            const token =
                document.createElement("button");

            token.classList.add("board-token");

            token.textContent =
                tokenIndex + 1;

            token.style.background =
                players[player].color;

            token.dataset.player = player;

            token.dataset.token = tokenIndex;


            // Highlight movable token

            if (
                player === currentPlayer &&
                canMove(player, tokenIndex)
            ) {

                token.classList.add("highlight");

                token.addEventListener(
                    "click",
                    function () {

                        moveToken(
                            player,
                            tokenIndex
                        );
                    }
                );
            }

            cell.appendChild(token);
        }
    }
}


// =========================
// GET BOARD POSITION
// =========================

function getBoardPosition(
    player,
    position
) {

    // Main path

    if (position <= 51) {

        return (
            players[player].start +
            position
        ) % 36;
    }

    // Home path

    return (
        players[player].start +
        position
    ) % 36;
}


// =========================
// CHECK IF TOKEN CAN MOVE
// =========================

function canMove(
    player,
    tokenIndex
) {

    const position =
        tokens[player][tokenIndex].position;


    // Finished token

    if (position === 57) {
        return false;
    }


    // Token at home

    if (position === -1) {

        return diceValue === 6;
    }


    // Normal movement

    if (position + diceValue <= 57) {

        return true;
    }


    return false;
}


// =========================
// MOVE TOKEN
// =========================

function moveToken(
    player,
    tokenIndex
) {

    if (gameOver) {
        return;
    }

    if (player !== currentPlayer) {
        return;
    }

    if (!canMove(player, tokenIndex)) {
        return;
    }

    const token =
        tokens[player][tokenIndex];


    // Bring token out of home

    if (token.position === -1) {

        token.position = 0;
    }

    else {

        token.position += diceValue;
    }


    // Check for capture

    captureOpponent(
        player,
        tokenIndex
    );


    // Check winner

    if (checkWinner(player)) {

        gameOver = true;

        document.getElementById(
            "winner"
        ).style.display = "flex";

        document.getElementById(
            "winner"
        ).textContent =
            `🏆 ${players[player].name} Wins!`;

        document.getElementById(
            "message"
        ).textContent =
            `${players[player].name} completed all 4 tokens!`;

        renderTokens();

        return;
    }


    // If dice is 6,
    // player gets another turn

    if (diceValue === 6) {

        document.getElementById(
            "message"
        ).textContent =
            `${players[player].name} gets another turn!`;

    }

    else {

        nextPlayer();
    }

    renderTokens();
}


// =========================
// CAPTURE OPPONENT
// =========================

function captureOpponent(
    player,
    tokenIndex
) {

    const currentToken =
        tokens[player][tokenIndex];


    // Don't capture tokens
    // in their home path.

    if (
        currentToken.position < 0 ||
        currentToken.position > 51
    ) {
        return;
    }


    const currentBoardPosition =
        getBoardPosition(
            player,
            currentToken.position
        );


    // Safe cells cannot capture

    const safeCells =
        [0, 8, 13, 21, 26, 34];

    if (
        safeCells.includes(
            currentBoardPosition
        )
    ) {
        return;
    }


    for (
        let opponent = 0;
        opponent < 4;
        opponent++
    ) {

        if (opponent === player) {
            continue;
        }


        for (
            let opponentToken = 0;
            opponentToken < 4;
            opponentToken++
        ) {

            const enemy =
                tokens[opponent][opponentToken];


            if (
                enemy.position < 0 ||
                enemy.position > 51
            ) {
                continue;
            }


            const enemyBoardPosition =
                getBoardPosition(
                    opponent,
                    enemy.position
                );


            if (
                enemyBoardPosition ===
                currentBoardPosition
            ) {

                enemy.position = -1;

                document.getElementById(
                    "message"
                ).textContent =
                    `${players[player].name} captured ${players[opponent].name}'s token!`;
            }
        }
    }
}


// =========================
// CHECK WINNER
// =========================

function checkWinner(player) {

    return tokens[player].every(
        token => token.position === 57
    );
}


// =========================
// NEXT PLAYER
// =========================

function nextPlayer() {

    currentPlayer++;

    if (currentPlayer >= 4) {

        currentPlayer = 0;
    }

    diceValue = 0;

    updateTurn();

    renderTokens();
}


// =========================
// UPDATE TURN
// =========================

function updateTurn() {

    const player =
        players[currentPlayer];

    const turnText =
        document.getElementById(
            "turnText"
        );

    turnText.textContent =
        `${player.name}'s Turn`;

    turnText.style.color =
        player.color;
}


// =========================
// ROLL DICE
// =========================

function rollDice() {

    if (gameOver) {
        return;
    }


    // Don't roll twice

    if (diceValue !== 0) {

        return;
    }


    diceValue =
        Math.floor(
            Math.random() * 6
        ) + 1;


    document.getElementById(
        "dice"
    ).textContent =
        diceValue;


    const player =
        players[currentPlayer];


    const movableTokens = [];


    for (
        let i = 0;
        i < 4;
        i++
    ) {

        if (
            canMove(
                currentPlayer,
                i
            )
        ) {

            movableTokens.push(i);
        }
    }


    if (
        movableTokens.length === 0
    ) {

        document.getElementById(
            "message"
        ).textContent =
            `${player.name} rolled ${diceValue}, but no token can move.`;

        if (diceValue !== 6) {

            setTimeout(
                nextPlayer,
                1000
            );
        }

        else {

            diceValue = 0;

            document.getElementById(
                "message"
            ).textContent =
                `${player.name} gets another turn!`;
        }

        return;
    }


    document.getElementById(
        "message"
    ).textContent =
        `${player.name} rolled ${diceValue}. Select a highlighted token.`;

    renderTokens();
}


// =========================
// RESTART GAME
// =========================

function restartGame() {

    currentPlayer = 0;

    diceValue = 0;

    gameOver = false;

    createTokens();

    createBoard();

    document.getElementById(
        "dice"
    ).textContent = "🎲";


    document.getElementById(
        "winner"
    ).style.display = "none";


    document.getElementById(
        "message"
    ).textContent =
        "Roll the dice to start!";


    updateTurn();

    renderTokens();
}


// =========================
// BUTTON EVENTS
// =========================

document
    .getElementById("rollBtn")
    .addEventListener(
        "click",
        rollDice
    );


document
    .getElementById("restartBtn")
    .addEventListener(
        "click",
        restartGame
    );


// =========================
// START GAME
// =========================

createTokens();

createBoard();

updateTurn();

renderTokens();

