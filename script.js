const board = [
    [
        [5, 3, "", "", 7, "", "", "", ""],
        [6, "", "", 1, 9, 5, "", "", ""],
        ["", 9, 8, "", "", "", "", 6, ""],
        [8, "", "", "", 6, "", "", "", 3],
        [4, "", "", 8, "", 3, "", "", 1],
        [7, "", "", "", 2, "", "", "", 6],
        ["", 6, "", "", "", "", 2, 8, ""],
        ["", "", "", 4, 1, 9, "", "", 5],
        ["", "", "", "", 8, "", "", 7, 9],
    ],
    [
        ["", "", 3, "", 2, "", 6, "", ""],
        [9, "", "", 3, "", 5, "", "", 1],
        ["", "", 1, 8, "", 6, 4, "", ""],
        ["", "", 8, 1, "", 2, 9, "", ""],
        [7, "", "", "", "", "", "", "", 8],
        ["", "", 6, 7, "", 8, 2, "", ""],
        ["", "", 2, 6, "", 9, 5, "", ""],
        [8, "", "", 2, "", 3, "", "", 9],
        ["", "", 5, "", 1, "", 3, "", ""],
    ],
    [
        [2, "", "", 6, "", "", "", "", 3],
        ["", "", 9, "", "", "", "", 4, ""],
        ["", "", "", "", "", 1, "", "", ""],
        ["", "", "", "", 5, "", 8, "", ""],
        ["", "", "", "", "", "", "", "", ""],
        ["", "", 8, "", 9, "", "", "", ""],
        ["", "", "", 2, "", "", "", "", ""],
        ["", 4, "", "", "", "", 1, "", ""],
        [9, "", "", "", "", 4, "", "", 6],
    ],
    [
        ["", 2, "", 8, "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", 9],
        ["", "", "", "", "", 6, "", 5, ""],
        ["", "", 3, "", "", "", "", "", ""],
        ["", "", "", "", 7, "", "", "", ""],
        ["", "", "", "", "", "", "", 6, ""],
        ["", 5, "", 3, "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", 7, "", 2, ""],
    ],
    [
        [8, "", "", "", "", "", "", "", 9],
        ["", "", "", "", 6, "", "", "", ""],
        ["", "", 9, "", "", "", "", "", ""],
        ["", "", "", "", "", 7, "", "", ""],
        ["", "", "", 5, "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", ""],
        ["", "", "", "", 3, "", "", "", ""],
        ["", "", "", "", "", "", "", "", 1],
        ["", "", "", "", "", "", 6, "", ""],
    ],
    [
        [6, "", "", "", 5, "", "", "", ""],
        ["", "", 1, "", "", "", 8, "", ""],
        ["", "", "", "", "", 9, "", "", ""],
        ["", "", "", "", "", "", "", 3, ""],
        ["", "", "", "", "", "", "", "", ""],
        ["", 2, "", "", "", "", "", "", ""],
        ["", "", "", 1, "", "", "", "", ""],
        ["", "", 5, "", "", "", "", "", ""],
        ["", "", "", "", 6, "", "", "", 7],
    ],
    [
        [3, "", "", "", "", 7, "", "", ""],
        ["", "", "", "", "", "", 4, "", ""],
        ["", "", "", "", "", "", "", "", 2],
        ["", "", "", "", "", "", "", "", ""],
        ["", "", "", 5, "", "", "", "", ""],
        ["", "", 6, "", "", "", "", "", ""],
        ["", 4, "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", ""],
        ["", "", "", "", 9, "", "", "", 6],
    ],
    [
        ["", "", "", 3, "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", 6, ""],
        ["", "", "", "", "", "", "", "", ""],
        ["", "", 8, "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", ""],
    ],
    [
        ["", "", "", "", "", "", "", "", ""],
        ["", "", 4, "", "", "", "", "", ""],
        ["", "", "", "", "", "", 7, "", ""],
        ["", "", "", "", "", "", "", "", ""],
        ["", "", 3, "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", ""],
        ["", "", "", 5, "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", ""],
    ],
];
let boardIndex = 0;
let currentBoard = [];
let moveHistory = [];
let redoStack = [];
let movesMade = 0;
let errorsMade = 0;
let score = 0;
let timerInterval;
let seconds = 0;

function pad(num) {
    return num < 10 ? "0" + num : num;
}

function startTimer() {
    clearInterval(timerInterval);
    seconds = 0;
    document.getElementById("timer").innerText = "00:00";
    timerInterval = setInterval(() => {
        seconds++;
        let mins = Math.floor(seconds / 60);
        let secs = seconds % 60;
        document.getElementById("timer").innerText = `${pad(mins)}:${pad(secs)}`;
    }, 1000);
}

function generateSudoku() {
    boardIndex = Math.floor(Math.random() * board.length);
    currentBoard = JSON.parse(JSON.stringify(board[boardIndex]));
    moveHistory = [];
    redoStack = [];
    movesMade = 0;
    errorsMade = 0;
    score = 0;
    updateStats();
    createBoard();
    startTimer();
}

function createBoard() {
    const gameBoard = document.getElementById("game-board");
    if (!gameBoard) return;
    gameBoard.innerHTML = "";

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            let cell = document.createElement("input");
            cell.type = "text";
            cell.classList.add("cell");
            cell.id = `cell-${row}-${col}`;
            cell.value = currentBoard[row][col] || "";
            cell.readOnly = currentBoard[row][col] !== "";
            if (!cell.readOnly) {
                cell.addEventListener("input", () => validateCell(cell, row, col));
            }
            gameBoard.appendChild(cell);
        }
    }
}

function validateCell(cell, row, col) {
    let value = cell.value;
    if (!/^[1-9]$/.test(value)) {
        cell.value = "";
        return;
    }

    moveHistory.push({ row, col, value });
    currentBoard[row][col] = value;
    movesMade++;

    const totalErrors = isValidSudokuBoard();
    errorsMade = totalErrors;
    updateStats();

    const message = document.getElementById("message");
    if (totalErrors > 0) {
        if (message) message.innerText = "❌ Invalid Sudoku: Rule violation found!";
    } else {
        if (message) message.innerText = "";
    }
}

function isValidSudokuBoard() {
    let errorCells = new Set();

    function markDuplicates(cells) {
        let seen = {};
        for (let i = 0; i < cells.length; i++) {
            let { value, id } = cells[i];
            if (value !== "") {
                if (seen[value]) {
                    errorCells.add(id);
                    errorCells.add(seen[value]);
                } else {
                    seen[value] = id;
                }
            }
        }
    }

    for (let i = 0; i < 9; i++) {
        let row = [];
        for (let j = 0; j < 9; j++) {
            let cell = document.getElementById(`cell-${i}-${j}`);
            if (cell) row.push({ value: cell.value, id: cell.id });
        }
        markDuplicates(row);
    }

    for (let j = 0; j < 9; j++) {
        let col = [];
        for (let i = 0; i < 9; i++) {
            let cell = document.getElementById(`cell-${i}-${j}`);
            if (cell) col.push({ value: cell.value, id: cell.id });
        }
        markDuplicates(col);
    }

    for (let boxRow = 0; boxRow < 3; boxRow++) {
        for (let boxCol = 0; boxCol < 3; boxCol++) {
            let grid = [];
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    let r = boxRow * 3 + i;
                    let c = boxCol * 3 + j;
                    let cell = document.getElementById(`cell-${r}-${c}`);
                    if (cell) grid.push({ value: cell.value, id: cell.id });
                }
            }
            markDuplicates(grid);
        }
    }

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            let cell = document.getElementById(`cell-${row}-${col}`);
            if (cell) cell.classList.remove("error");
        }
    }

    errorCells.forEach(id => {
        const cell = document.getElementById(id);
        if (cell) cell.classList.add("error");
    });

    return errorCells.size;
}

function updateStats() {
    document.getElementById("movesCount").textContent = movesMade;
    document.getElementById("errorsCount").textContent = errorsMade;
    document.getElementById("score").innerText = score;
    let best = Math.max(score, parseInt(localStorage.getItem("bestScore") || 0));
    localStorage.setItem("bestScore", best);
    document.getElementById("best-score").innerText = best;
}

function undoMove() {
    if (moveHistory.length > 0) {
        let last = moveHistory.pop();
        let cell = document.getElementById(`cell-${last.row}-${last.col}`);
        if (!cell) return;

        redoStack.push({
            row: last.row,
            col: last.col,
            value: cell.value,
        });

        currentBoard[last.row][last.col] = "";
        cell.value = "";
        movesMade--;
        errorsMade = isValidSudokuBoard();
        updateStats();
    }
}

function redoMove() {
    if (redoStack.length > 0) {
        let redo = redoStack.pop();
        let cell = document.getElementById(`cell-${redo.row}-${redo.col}`);
        if (!cell) return;

        moveHistory.push({ row: redo.row, col: redo.col, value: redo.value });
        currentBoard[redo.row][redo.col] = redo.value;
        cell.value = redo.value;
        movesMade++;
        errorsMade = isValidSudokuBoard();
        updateStats();
    }
}

function showPopup(message) {
    const popup = document.getElementById("popup");
    const popupMessage = document.getElementById("popup-message");
    if (popup && popupMessage) {
        popupMessage.innerText = message;
        popup.style.display = "flex";
    }
}

function closePopup() {
    const popup = document.getElementById("popup");
    if (popup) {
        popup.style.display = "none";
    }
}

function solveSudoku() {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            let cell = document.getElementById(`cell-${row}-${col}`);
            if (!cell || cell.value === "") {
                alert("⚠️ Please fill all cells before submitting!");
                return;
            }
            currentBoard[row][col] = cell.value;
        }
    }

    if (isValidSudokuBoard() > 0) {
        alert("❌ Invalid Sudoku: Rule violation found!");
    } else {
        clearInterval(timerInterval);
        alert("✅ Correct Sudoku!");
        generateSudoku();
    }
}

function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
}

document.addEventListener("DOMContentLoaded", generateSudoku);