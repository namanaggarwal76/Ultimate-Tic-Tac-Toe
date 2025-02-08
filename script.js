const bigBox = document.querySelector('.bigbox');
const colors = ['player1', 'player2'];

const lightShade = {
  player1: '#FF7DA3',
  player2: '#7BB5FF'  
};

const turnIndicator = document.getElementById('turnIndicator');
const playerForm = document.getElementById('playerForm');
const newGameButton = document.getElementById('newGameButton');
const overlay = document.getElementById('overlay');
const confirmOverlay = document.getElementById('confirmOverlay');
const confirmYes = document.getElementById('confirmYes');
const confirmNo = document.getElementById('confirmNo');
const offlineButton = document.getElementById('offlineButton');

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
  
  playerNames = JSON.parse(savedPlayerNames);
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
  // Removed persistState saving logic
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
  // Removed persistState removal
}

function resetButtons() {
  document.querySelectorAll('.box').forEach(box => {
    box.classList.add('active');
    box.querySelectorAll('button').forEach(button => {
      button.className = '';
      button.disabled = false;
      button.style.backgroundColor = '';
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
  document.querySelectorAll('.box').forEach(box => {
    box.className = 'box';
    box.style.backgroundColor = '';
  });
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
  // Removed setting persistState here
  saveGameState();
});

newGameButton.addEventListener('click', () => {
  confirmOverlay.style.display = 'flex';
});

confirmYes.addEventListener('click', () => {
  clearGameState();
  resetGame();
  // After new game confirmation, show overlay for new names
  overlay.style.display = 'flex';
  confirmOverlay.style.display = 'none';
});

confirmNo.addEventListener('click', () => {
  confirmOverlay.style.display = 'none';
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
        // Mark small board as won and update UI
        bigBoard[boxIndex] = currentPlayer;
        const boxButtons = boxElem.querySelectorAll('button');
        boxButtons.forEach(btn => {
          btn.classList.add(colors[currentPlayer]);
          btn.disabled = true;
        });
        boxElem.style.backgroundColor = lightShade[colors[currentPlayer]];
        checkBigBoardWinner();
      } else {
        // Mark draw if board is full with no win
        if (board[boxIndex].every(cell => cell !== null)) {
          bigBoard[boxIndex] = 'draw';
          const boxButtons = boxElem.querySelectorAll('button');
          boxButtons.forEach(btn => {
            btn.style.backgroundColor = '#ccc';
            btn.disabled = true;
          });
          boxElem.style.backgroundColor = '#eee';
          checkBigBoardWinner();
        } else {
          event.target.disabled = true;
        }
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
    return;
  }
  const filled = bigBoard.every(val => val !== null);
  if (filled) {
    let count0 = 0, count1 = 0;
    for (let i = 0; i < 9; i++) {
      if (bigBoard[i] === 0) count0++;
      else if (bigBoard[i] === 1) count1++;
    }
    if (count0 > count1) showWinnerOverlay(0);
    else if (count1 > count0) showWinnerOverlay(1);
    else {
      const winnerMessage = document.getElementById('winnerMessage');
      winnerMessage.textContent = "It's a tie!";
      document.getElementById('winnerOverlay').style.display = 'flex';
    }
  }
}

function showWinnerOverlay(player) {
  const winnerOverlay = document.getElementById('winnerOverlay');
  const winnerMessage = document.getElementById('winnerMessage');
  winnerMessage.textContent = playerNames[player] + ' wins!!';
  let newGameBtn = document.getElementById('winnerNewGameButton');
  if (!newGameBtn) {
    newGameBtn = document.createElement('button');
    newGameBtn.id = 'winnerNewGameButton';
    newGameBtn.textContent = "New Game";
    newGameBtn.addEventListener('click', () => {
      clearGameState();
      resetGame();
      overlay.style.display = 'flex';
    });
    winnerOverlay.appendChild(newGameBtn);
  }
  winnerOverlay.style.display = 'flex';
}

function updateActiveBox() {
  if (activeBox === null) {
    document.querySelectorAll('.box').forEach((box, idx) => {
      if (bigBoard[idx] === null) box.classList.add('active');
      else box.classList.remove('active');
    });
  } else {
    document.querySelectorAll('.box').forEach((box, idx) => {
      if (idx === activeBox && bigBoard[idx] === null) box.classList.add('active');
      else box.classList.remove('active');
    });
  }
}

if (offlineButton) {
	offlineButton.addEventListener('click', () => {
		clearGameState();
		resetGame();
		overlay.style.display = 'flex';
		window.location.href = "offline_index.html";
	});
}

loadGameState();
updateActiveBox();
