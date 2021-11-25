var gTimerInterval;

function createMat(rows, cols) {
    var mat = [];
    for (var i = 0; i < rows; i++) {
        mat.push([]);
        for (var j = 0; j < cols; j++) {
            mat[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                position: { i, j }
            }
        }
    }

    return mat;
}

function findNegs(mat, rowIdx, colIdx) {

    var cellNegs = [];
    var additionalZero;
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > mat.length - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > mat[0].length - 1) continue
            if (i === rowIdx && j === colIdx) continue
            var cell = mat[i][j];
            cellNegs.push(cell);
        }
    }
    return cellNegs;
}

function getEmptyCells() {
    var emptyCells = [];

    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            var currCell = gBoard[i][j];
            if (!currCell.isMine && !currCell.isShown) {
                var emptyCellPos = { i: i, j: j };
                emptyCells.push(emptyCellPos);
            }
        }
    }
    return emptyCells;
}

function getMineCells() {
    var minesCells = [];

    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            var currCell = gBoard[i][j];
            if (currCell.isMine && !currCell.isShown) {
                var mineCell = { i: i, j: j };
                minesCells.push(mineCell);
            }
        }
    }
    return minesCells;
}

function changeColor(element) {
    if (flag == true) {
        element.style.background = "#eef12f";
        flag = false;
    } else if (flag == false) {
        element.style.background = "#eef12fe0";
        flag = true;
    }
}

function renderCell(location, value) {
    var elCell = document.querySelector('.cell-' + location.i + '-' + location.j);
    elCell.innerHTML = value;
}

function setSecTimer() {
    var elTimer = document.querySelector('.time-box');
    var totalSeconds = 0;
    gTimerInterval = setInterval(countTimer, 1000);

    function countTimer() {
        ++totalSeconds;
        var hour = Math.floor(totalSeconds / 3600);
        var minute = Math.floor((totalSeconds - hour * 3600) / 60);
        var second = totalSeconds - (hour * 3600 + minute * 60);

        if (hour < 10) hour = '0' + hour;
        if (minute < 10) minute = '0' + minute;
        if (second < 10) second = '0' + second;
        elTimer.innerText = `${hour}:${minute}:${second}`;
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}