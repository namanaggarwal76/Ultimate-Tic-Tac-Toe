const bigBox = document.querySelector('.bigbox');
const colors = ['player1', 'player2'];
const turnIndicator = document.getElementById('turnIndicator');
const playerForm = document.getElementById('playerForm');
const newGameButton = document.getElementById('newGameButton');
const overlay = document.getElementById('overlay');

let currentPlayer = 0;
let activeBox = null;
let playerNames = ['Player 1', 'Player 2'];
const board = Array(9).fill(null).map(() => Array(9).fill(null));
const bigBoard = Array(9).fill(null);

function loadGameState() {
  const savedPlayerNames = localStorage.getItem('playerNames');
  const savedCurrentPlayer = localStorage.getItem('currentPlayer');
  const savedBoard = localStorage.getItem('board');
  const savedBigBoard = localStorage.getItem('bigBoard');
  const savedActiveBox = localStorage.getItem('activeBox');

  if (savedPlayerNames) playerNames = JSON.parse(savedPlayerNames);
  if (savedCurrentPlayer) currentPlayer = parseInt(savedCurrentPlayer);
  if (savedBoard) {
    const parsedBoard = JSON.parse(savedBoard);
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        board[i][j] = parsedBoard[i][j];
        if (board[i][j] !== null) {
          const button = document.getElementById(`button${i}${j}`);
          button.classList.add(colors[board[i][j]], 'inactive');
          button.disabled = true;
        }
      }
    }
  }
  if (savedBigBoard) {
    const parsedBigBoard = JSON.parse(savedBigBoard);
    for (let i = 0; i < 9; i++) {
      bigBoard[i] = parsedBigBoard[i];
      if (bigBoard[i] !== null) {
        const boxElem = document.getElementById(i.toString());
        boxElem.classList.add(bigBoard[i] === 0 ? 'winner1' : 'winner2');
      }
    }
  }
  if (savedActiveBox) activeBox = parseInt(savedActiveBox);

  turnIndicator.textContent = playerNames[currentPlayer] + "'s turn";
  updateActiveBox();
}

function saveGameState() {
  localStorage.setItem('playerNames', JSON.stringify(playerNames));
  localStorage.setItem('currentPlayer', currentPlayer.toString());
  localStorage.setItem('board', JSON.stringify(board));
  localStorage.setItem('bigBoard', JSON.stringify(bigBoard));
  localStorage.setItem('activeBox', activeBox !== null ? activeBox.toString() : '');
}

function clearGameState() {
  localStorage.removeItem('playerNames');
  localStorage.removeItem('currentPlayer');
  localStorage.removeItem('board');
  localStorage.removeItem('bigBoard');
  localStorage.removeItem('activeBox');
}

function resetButtons() {
  document.querySelectorAll('.box').forEach(box => {
    box.classList.add('active');
    box.querySelectorAll('button').forEach(button => {
      button.className = '';
      button.disabled = false;
    });
  });
}

function resetGame() {
  currentPlayer = 0;
  activeBox = null;
  playerNames = ['Player 1', 'Player 2'];
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      board[i][j] = null;
    }
    bigBoard[i] = null;
  }
  resetButtons();
  turnIndicator.textContent = playerNames[currentPlayer] + "'s turn";
  overlay.style.display = 'none';
  saveGameState();
}

playerForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const player1Name = document.getElementById('player1Input').value.trim() || 'Player 1';
  const player2Name = document.getElementById('player2Input').value.trim() || 'Player 2';
  playerNames = [player1Name, player2Name];
  turnIndicator.textContent = playerNames[currentPlayer] + "'s turn";
  overlay.style.display = 'none';
  saveGameState();
});

newGameButton.addEventListener('click', () => {
  clearGameState();
  resetGame();
  location.reload();
});

bigBox.addEventListener('click', (event) => {
  if (event.target.tagName === 'BUTTON') {
    const boxElem = event.target.closest('.box');
    const boxIndex = parseInt(boxElem.id);
    const buttonIndex = parseInt(event.target.id.replace('button', '').slice(1));

    if (activeBox !== null && activeBox !== boxIndex) return;
    if (bigBoard[boxIndex] !== null) return;

    if (board[boxIndex][buttonIndex] === null) {
      board[boxIndex][buttonIndex] = currentPlayer;
      event.target.classList.add(colors[currentPlayer], 'inactive');

      if (checkWin(board[boxIndex], currentPlayer)) {
        bigBoard[boxIndex] = currentPlayer;
        const boxButtons = boxElem.querySelectorAll('button');
        boxButtons.forEach(btn => {
          btn.classList.add(colors[currentPlayer]);
          btn.disabled = true;
        });
        checkBigBoardWinner();
      } 
      else{
        event.target.disabled = true;
      }

      if (bigBoard[buttonIndex] !== null || board[buttonIndex].every(cell => cell !== null)) {
        activeBox = null;
      } else {
        activeBox = buttonIndex;
      }

      updateActiveBox();
      currentPlayer = currentPlayer === 0 ? 1 : 0;
      turnIndicator.textContent = playerNames[currentPlayer] + "'s turn";
      saveGameState();
    }
  }
});

function checkWin(cells, player) {
  const winningCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  return winningCombos.some(combo => combo.every(index => cells[index] === player));
}

function checkBigBoardWinner() {
  if (checkWin(bigBoard, currentPlayer)) {
    showWinnerOverlay(currentPlayer);
  }
}

function showWinnerOverlay(player) {
  const winnerMessage = document.getElementById('winnerMessage');
  winnerMessage.textContent = playerNames[player] + ' wins!!';
  document.getElementById('winnerOverlay').style.display = 'flex';
  resetGame();
}

function updateActiveBox() {
  if (activeBox === null) {
    document.querySelectorAll('.box').forEach((box, idx) => {
      if (bigBoard[idx] === null) {
        box.classList.add('active');
      } else {
        box.classList.remove('active');
      }
    });
  } else {
    document.querySelectorAll('.box').forEach((box, idx) => {
      if (idx === activeBox && bigBoard[idx] === null) {
        box.classList.add('active');
      } else {
        box.classList.remove('active');
      }
    });
  }
}

loadGameState();
updateActiveBox();