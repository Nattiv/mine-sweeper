'use strict'

console.log('mines swaeeping 2')
var MINE = 'M';
var gBoard
var gEmptyCellsCount;
var gFlagCount;
var gMinePositions
var gMineCount
var gStatusTimer
var gTime
var gIntervalTimeOut
var gGameEnd

function init(rootBoard, mineCount) {
    hideMsg()
    gGameEnd = 0
    gTime = 0
    gStatusTimer = 0;
    gMineCount = mineCount;
    gMinePositions = getPosMines(rootBoard, mineCount);
    gEmptyCellsCount = 0;
    gFlagCount = 0
    gBoard = createBoard(rootBoard);
    renderBoard(gBoard)
}

function selectLevel(button) {
    if (button.innerText === 'Easy') init(4, 2)
    if (button.innerText === 'Medium') init(8, 12)
    if (button.innerText === 'Hard') init(12, 30)
}

function createBoard(rootBoard) {
    var board = [];
    for (var i = 0; i < rootBoard; i++) {
        board.push([])
        for (var j = 0; j < rootBoard; j++) {
            for (var k = 0; k < gMinePositions.length; k++) {
                if (board[i][j] === MINE) break;
                board[i][j] = (gMinePositions[k].i === i && gMinePositions[k].j === j) ? MINE : ''
            }
        }
    }
    return board;
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            var className = (board[i][j]) ? 'mine' : 'clear'
            var strData = `data-i="${i}" data-j="${j}"`;
            strHTML += `<td class="${className} " ${strData}
                        onmousedown="cellClicked(this, event,  ${i}, ${j})">
                        <span class="hidden">`;
            strHTML += board[i][j];
            strHTML += '</span></td>';
        }
        strHTML += '</tr>'
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}


function cellClicked(cell, event) {
    if (cell.classList.contains('cellShown')) return;    //REMOVE COMMENT WHEN WRITING
    if (gGameEnd) return;
    clearInterval(gIntervalTimeOut);
    gStatusTimer++
    timer()

    var isMouseRight = event.button;
    if (isMouseRight) {
        cell.innerText = 'f';
        gFlagCount++
    } else {
        if (cell.innerText === 'f') return;
        var elCellContent = cell.querySelector(' span');
        elCellContent.style.display = "block";
        if (cell.classList.contains("mine")) {
            elCellContent.classList.add("mineBoom")
            gameOver();
        }
        else {
            var pos = getPos(cell);
            console.log(pos)
            var negsCount = checkNegs(pos.i, pos.j)
            gEmptyCellsCount++;
            if (negsCount === 0) negsCount = ''
            cell.classList.add("cellShown");
            cell.innerHTML = negsCount
        }
    }
    checkWin()
}


function checkNegs(celli, cellj) {
    celli = parseInt(celli)
    cellj = parseInt(cellj)
    var emptyCells = []
    var negsCount = 0
    for (var i = celli - 1; i <= celli + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellj - 1; j <= cellj + 1; j++) {
            if (j < 0 || j > gBoard[i].length - 1) continue;
            if (i === celli && j === cellj) continue;
            if (gBoard[i][j] === 'M') negsCount++;
            else {
                var pos = {
                    i: i,
                    j: j
                }
                emptyCells.push(pos)
            }
        }
    }

    if (negsCount === 0) openNonMine1(emptyCells);
    return negsCount
}
function openNonMine1(emptyCells) {
    for (var k = 0; k < emptyCells.length; k++) {
        var i = emptyCells[k].i;
        var j = emptyCells[k].j;
        var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
        var negsCount = checkNegs1Degree(i, j)
        elCell.classList.add("cellShown");
        if (negsCount === 0) negsCount = '';
        elCell.innerText = negsCount
    }

}

function checkNegs1Degree(celli, cellj) {
    var negsCount = 0
    for (var i = celli - 1; i <= celli + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellj - 1; j <= cellj + 1; j++) {
            if (j < 0 || j > gBoard[i].length - 1) continue;
            if (i === celli && j === cellj) continue;
            if (gBoard[i][j] === 'M') negsCount++;
        }
    }
    return negsCount
}

function getPos(cell) {
    var pos = {
        i: cell.getAttribute("data-i"),
        j: cell.getAttribute("data-j")
    }
    return pos;
}

function checkWin() {
    var sumEmptyCells = gBoard.length * gBoard[0].length - gMinePositions.length
    if (gEmptyCellsCount === sumEmptyCells && gFlagCount === gMinePositions.length) {
        var elWinMsg = document.querySelector('.msg');
        elWinMsg.innerText = 'YOU WIN!'
        displayRestart()
        resetTimer()
    }
}

function gameOver() {
    resetTimer()

    gGameEnd = 1;
    console.log(gGameEnd)
    var elLoseMsg = document.querySelector('.msg');
    elLoseMsg.innerText = 'GAME OVER';
    displayRestart();
    displayMines();

}

function displayRestart() { // need more work
    var elRestart = document.querySelector('.restart');
    elRestart.style.display = "block";

}

function getPosMines(rootBoard, mineCount) {
    var count = 0
    var positions = [];
    for (var i = 0; i < mineCount && count < 100; i++) {
        var pos = {
            i: getRandomInt(0, rootBoard - 1),
            j: getRandomInt(0, rootBoard - 1)
        }
        count++;
        for (var j = 0; j < positions.length; j++) {
            if (positions[j].i === pos.i && positions[j].j === pos.j) i--;

        }
        positions.push(pos);
    }
    return positions;
}

function displayMines() {
    var elMines = document.querySelectorAll('.mine');
    for (var i = 0; i < elMines.length; i++) {
        var elSpan = elMines[i].querySelector('span');
        elSpan.classList.remove('hidden');
    }
}


function resetTimer() {
    gStatusTimer = 0;
}

function timer() {
    var elTimeCounter = document.querySelector('.time')
    if (gStatusTimer > 0) {
        gIntervalTimeOut = setTimeout(function () {
            gTime++;
            var min = Math.floor(gTime / 100 / 60);
            var sec = Math.floor(gTime / 100);
            var mSec = gTime % 100;
            if (sec >= 60) {
                sec = sec % 60;
            }
            if (sec < 10) {
                sec = "0" + sec;
            }
            elTimeCounter.innerHTML = min + ':' + sec + ":" + mSec;
            timer();
        }, 10)
    }
}

function getRandomInt(min, max) {       //inclusive
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function hideMsg() {
    var elMsg = document.querySelector('.msg');
    elMsg.innerText = ''
    var elTimeCounter = document.querySelector('.time');
    elTimeCounter.innerText = '0:00:00'
}
