// COMPLETE - 
// cells size
// design

const MINE = '💣';
const FLAG = '📌'


var gBoard;
var gBoardSize;
var firstClickPos;
var gHintInterval;
var gKills;
var gStatus = '';
var gLevel = {
    size: 4,
    mines: 2
}
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    difficulty: 'Easy'
}

window.addEventListener('contextmenu', function(e) {
    e.preventDefault();
}, false);


function initGame() {
    gBoard = createMat(gLevel.size, gLevel.size);
    renderBoard();
    gTimerInterval = 0;
    gStatus = '';
    gKills = 0;
    gGame.isOn = false;
    gGame.secsPassed = 0;
    var elTimer = document.querySelector('.time-box');
    elTimer.innerText = "00:00:00"

}

function renderBoard() {
    var strHTML = '<table style="margin:auto"><tbody>';
    for (var i = 0; i < gBoard.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j];
            var className = `cell-${i}-${j} `;

            strHTML += `<td onclick="cellClicked(this, ${i}, ${j})" 
            oncontextmenu="cellMarked(this, ${i}, ${j})" 
            class="hidden ${className}"> ${currCell.minesAroundCount} </td>`;
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector('.game-table');
    elContainer.innerHTML = strHTML;
}

function renderMines() {
    if (!gTimerInterval) setSecTimer();
    var emptyCells = getEmptyCells();
    var minesPositions = [];

    for (var i = 0; i < gLevel.mines; i++) {
        var randomIdx = getRandomInt(0, emptyCells.length);
        var randomPos = emptyCells.splice(randomIdx, 1)[0];
        minesPositions.push(randomPos);

        if (firstClickPos.i === minesPositions[i].i &&
            firstClickPos.j === minesPositions[i].j) {
            i--;
            continue
        }
    }

    for (var j = 0; j < minesPositions.length; j++) {
        var currMinePos = minesPositions[j];

        gBoard[currMinePos.i][currMinePos.j].isMine = true;
        renderCell(currMinePos, MINE);
    }
}

function cellClicked(elbtn, i, j) {
    if (gBoard[i][j].isShown) return
    if (gStatus === 'lose' || gStatus === 'winner') return
    if (elbtn.innerText === FLAG) return

    gGame.shownCount++;
    gBoard[i][j].isShown = true;
    elbtn.classList.add('cell');

    if (gGame.isOn === false) {
        firstCellClicked(elbtn, i, j);
        return
    }

    if (elbtn.innerText === '0') {
        expandShown(gBoard, i, j)
    }

    if (elbtn.innerText === MINE) {
        gKills++;
        gGame.shownCount--;
        var elLive = document.querySelector(`.life${gKills}`);
        elLive.innerText = '🤍'
        elLive.style.backgroundColor = "Black";
    }
    checkGameOver();
}

function firstCellClicked(elbtn, i, j) {
    firstClickPos = { i: i, j: j }
    gGame.isOn = true;
    gGame.shownCount = 1;
    renderMines();
    setMinesNegsAround();
    renderStatus()
    if (elbtn.innerText === FLAG) {
        var elFlag = document.querySelector(`.cell-${i}-${j}`);
        elFlag.innerText = gBoard[i][j].minesAroundCount;
    }
    if (elbtn.innerText === '0') {
        expandShown(gBoard, i, j)
    }
}

function setMinesNegsAround() {
    var cellsNegs = [];

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            cellsNegs = findNegs(gBoard, i, j);
            for (var k = 0; k < cellsNegs.length; k++) {
                if (cellsNegs[k].isMine === true) {
                    if (gBoard[i][j].isMine === true) continue
                    gBoard[i][j].minesAroundCount++;

                    elCell = document.querySelector(`.cell-${i}-${j}`);
                    elCell.innerText = gBoard[i][j].minesAroundCount;
                }
            }
        }
    }
}

function expandShown(board, i, j) {

    var negCells = findNegs(board, i, j);

    for (var i = 0; i < negCells.length; i++) {
        if (!negCells[i].isMine && !negCells[i].isShown) {
            var negPos = negCells[i].position;
            negCells[i].isShown = true;
            gGame.shownCount++;

            var elNeg = document.querySelector(`.cell-${negPos.i}-${negPos.j}`);
            elNeg.classList.toggle('cell');

            for (var j = 0; j < negCells.length; j++) {
                if (negCells[j].minesAroundCount === 0) {
                    var negZero = negCells[j].position;
                    expandShown(gBoard, negZero.i, negZero.j);
                }

            }

        }
    }
}

function cellMarked(elbtn, i, j) {
    if (gBoard[i][j].isShown === true) return
    if (!gTimerInterval) setSecTimer();
    var currMark = gBoard[i][j];

    if (currMark.isMarked === false) {
        currMark.isMarked = true;
        elbtn.classList.remove('hidden');
        elbtn.classList.toggle('cell');
        elbtn.innerText = FLAG;
    } else {
        currMark.isMarked = false;
        elbtn.classList.remove('cell');
        elbtn.classList.toggle('hidden');
        elbtn.innerText = gBoard[i][j].minesAroundCount;
    }
}

function renderStatus() {
    var elStatus = document.querySelector('.status');
    if (gGame.isOn === false) elStatus.innerText = '😴'
    else {
        if (!gStatus) elStatus.innerText = '😁';
        else elStatus.innerText = (gStatus === 'lose') ? '🤯' : '😎';
    }
}

function showHint(elbtn) {
    elbtn.style.backgroundColor = "Gray";
    elbtn.disabled = true;
    elbtn.style.cursor = "not-allowed";

    var safeCells = getEmptyCells();
    var safeIdx = getRandomInt(0, safeCells.length);
    var present = safeCells[safeIdx];

    var elPresent = document.querySelector(`.cell-${present.i}-${present.j}`);
    gHintInterval = setInterval(function() {
        elPresent.classList.remove('hidden');
        elPresent.style.border = "2px solid black";
        elPresent.classList.toggle('blinking');
    }, 500);

    setTimeout(function() {
        clearInterval(gHintInterval);
        elPresent.classList.add('hidden');
    }, 2000);
}

function setDifficulty(elbtn) {
    if (elbtn === document.getElementById('Easy')) {
        gGame.difficulty = 'Easy';
        gLevel = {
            size: 4,
            mines: 2
        };
    } else if (elbtn === document.getElementById('Medium')) {
        gGame.difficulty = 'Medium';
        gLevel = {
            size: 8,
            mines: 12
        };
    } else if (elbtn === document.getElementById('Pro')) {
        gGame.difficulty = 'Pro';
        gLevel = {
            size: 12,
            mines: 30
        };
    }
    restartGame();
}

function convertScore(score) {
    var stringScore = score.split(':');
    var hour = +stringScore[0] * 3600;
    var min = +stringScore[1] * 60;
    var sec = +stringScore[2];
    var finalScore = hour + min + sec;

    return finalScore
}

function checkHighScore() {
    var elScore = document.querySelector('.time-box');
    var currScore = elScore.innerText;
    gGame.secsPassed = convertScore(currScore);

    var elPrevScore = document.getElementById(`${gGame.difficulty}`)
    var elHighScore = elPrevScore.querySelector('span').innerHTML;
    var convertHighScore = convertScore(elHighScore)

    if (gGame.secsPassed < convertHighScore ||
        convertHighScore === 0) {
        elPrevScore.querySelector('span').innerHTML = currScore + '';
        elPrevScore.querySelector('span').style.display = "block";
    }
}

function checkGameOver() {
    if (gKills === 3) {
        gStatus = 'lose';
        return gameOver();
    }

    if (gGame.shownCount === (Math.pow(gLevel.size, 2) - gLevel.mines)) {
        clearInterval(gTimerInterval);
        gStatus = 'winner';
        renderStatus();
        gGame.isOn = false;
        checkHighScore();
    }
    return;
}

function restartGame() {
    clearInterval(gTimerInterval);
    gGame.isOn = false;
    renderStatus()
    renderHints();
    renderLives();
    initGame()
}

function gameOver() {
    renderStatus()
    clearInterval(gTimerInterval);
    var minesReveal = getMineCells();
    for (var i = 0; i < gLevel.mines; i++) {
        var currMine = minesReveal[i];
        console.log("currMine: ", currMine);
        /* var elMine = document.querySelector(`.cell-${currMine.i}-${currMine.j}`); */
        var elMine = document.querySelector('.cell-' + currMine.i + '-' + currMine.j);
        elMine.classList.toggle('cell');
    }
}

function renderHints() {
    var elHints = document.querySelectorAll('.hints');
    for (var i = 0; i < 3; i++) {
        elHints[i].style.backgroundColor = "#e9e3e3";
        elHints[i].style.cursor = "pointer";
        elHints[i].disabled = false;
    }
}

function renderLives() {
    for (var i = 1; i < 4; i++) {
        var elLives = document.querySelector('.life' + i);
        console.log("elLives: ", elLives);
        elLives.innerText = "❤️";
        elLives.style.backgroundColor = "#e9e3e3";
    }
}