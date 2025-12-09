// Online Game Logic
let currentPlayer = 0;
let activeBox = null;
let playerId = null;
let roomId = null;
let playerNames = ['Player 1', 'Player 2'];
let isMyTurn = false;
let unsubscribeGameState = null;

const board = Array(9).fill(null).map(() => Array(9).fill(null));
const bigBoard = Array(9).fill(null);

const colors = ['player1', 'player2'];
const lightShade = {
  player1: '#FF7DA3',
  player2: '#7BB5FF'
};

// DOM Elements
const onlineModeOverlay = document.getElementById('onlineModeOverlay');
const createRoomOverlay = document.getElementById('createRoomOverlay');
const joinRoomOverlay = document.getElementById('joinRoomOverlay');
const waitingOverlay = document.getElementById('waitingOverlay');
const winnerOverlay = document.getElementById('winnerOverlay');
const connectionStatus = document.getElementById('connectionStatus');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const bigBox = document.querySelector('.bigbox');
const turnIndicator = document.getElementById('turnIndicator');
const winnerMessage = document.getElementById('winnerMessage');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initializeFirebase();
  setupEventListeners();
  showOnlineModeOverlay();
});

function setupEventListeners() {
  // Online Mode Options
  document.getElementById('createRoomBtn').addEventListener('click', showCreateRoomForm);
  document.getElementById('joinRoomBtn').addEventListener('click', showJoinRoomForm);
  document.getElementById('backBtn').addEventListener('click', goBackToMainMenu);

  // Create Room
  document.getElementById('createRoomForm').addEventListener('submit', handleCreateRoom);
  document.getElementById('cancelCreateBtn').addEventListener('click', showOnlineModeOverlay);

  // Join Room
  document.getElementById('joinRoomForm').addEventListener('submit', handleJoinRoom);
  document.getElementById('cancelJoinBtn').addEventListener('click', showOnlineModeOverlay);

  // Waiting for player
  document.getElementById('cancelWaitBtn').addEventListener('click', cancelWaiting);

  // Game Board
  bigBox.addEventListener('click', handleBoardClick);

  // Winner overlay
  document.getElementById('returnToMenuBtn').addEventListener('click', goBackToMainMenu);

  // Connection status
  updateConnectionStatus('connected');
}

function showOnlineModeOverlay() {
  onlineModeOverlay.style.display = 'flex';
  createRoomOverlay.style.display = 'none';
  joinRoomOverlay.style.display = 'none';
  waitingOverlay.style.display = 'none';
  winnerOverlay.style.display = 'none';
  document.querySelector('.bigbox').style.display = 'none';
  turnIndicator.style.display = 'none';
}

function showCreateRoomForm() {
  onlineModeOverlay.style.display = 'none';
  createRoomOverlay.style.display = 'flex';
}

function showJoinRoomForm() {
  onlineModeOverlay.style.display = 'none';
  joinRoomOverlay.style.display = 'flex';
}

async function handleCreateRoom(e) {
  e.preventDefault();
  const playerName = document.getElementById('createPlayerName').value.trim() || 'Player 1';
  
  updateConnectionStatus('connecting');
  const result = await gameRoomManager.createRoom(playerName);

  if (result.success) {
    roomId = result.roomId;
    playerId = result.playerId;
    playerNames[0] = playerName;
    isMyTurn = true; // Creator is player 1 (goes first)
    
    createRoomOverlay.style.display = 'none';
    waitingOverlay.style.display = 'flex';
    document.getElementById('displayRoomId').textContent = roomId;

    // Subscribe to game state changes
    subscribeToGameUpdates();
  } else {
    alert('Error creating room: ' + result.error);
    updateConnectionStatus('disconnected');
  }
}

async function handleJoinRoom(e) {
  e.preventDefault();
  const playerName = document.getElementById('joinPlayerName').value.trim() || 'Player 2';
  const inputRoomId = document.getElementById('roomIdInput').value.trim();

  updateConnectionStatus('connecting');
  const result = await gameRoomManager.joinRoom(inputRoomId, playerName);

  if (result.success) {
    roomId = result.roomId;
    playerId = result.playerId;
    playerNames[0] = result.room.player1.name;
    playerNames[1] = playerName;
    isMyTurn = false; // Joiner is player 2 (goes second)
    
    joinRoomOverlay.style.display = 'none';
    
    // Initialize board from room data
    if (result.room.gameState) {
      currentPlayer = result.room.gameState.currentPlayer;
      activeBox = result.room.gameState.activeBox;
      initializeGameBoard(result.room.gameState);
    }
    
    startGameDisplay();
    subscribeToGameUpdates();
  } else {
    alert('Error joining room: ' + result.error);
    updateConnectionStatus('disconnected');
  }
}

function subscribeToGameUpdates() {
  if (unsubscribeGameState) {
    unsubscribeGameState();
  }

  unsubscribeGameState = gameRoomManager.onGameStateChange((gameState) => {
    updateGameStateUI(gameState);
  });
}

function updateGameStateUI(gameState) {
  // Update current player
  currentPlayer = gameState.currentPlayer;
  activeBox = gameState.activeBox;

  // Update board state
  board.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (gameState.board[i] && gameState.board[i][j] !== null) {
        board[i][j] = gameState.board[i][j];
      }
    });
  });

  // Update big board
  gameState.bigBoard.forEach((cell, i) => {
    bigBoard[i] = cell;
  });

  // Update UI
  renderBoardState();
  updateTurnIndicator();
  
  // Check if game is finished
  if (gameState.status === 'finished') {
    showGameOverlay();
  }
}

function initializeGameBoard(gameState) {
  // Load board state
  gameState.board.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (cell !== null) {
        board[i][j] = cell;
      }
    });
  });

  // Load big board state
  gameState.bigBoard.forEach((cell, i) => {
    bigBoard[i] = cell;
  });
}

function renderBoardState() {
  // Clear and render all buttons based on current board state
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const button = document.getElementById(`button${i}${j}`);
      button.className = '';
      button.disabled = false;
      
      if (board[i][j] !== null) {
        button.classList.add(colors[board[i][j]], 'inactive');
        button.disabled = true;
      }
    }

    // Update big box styling
    const boxElem = document.getElementById(i.toString());
    boxElem.className = 'box';
    
    if (bigBoard[i] !== null) {
      if (bigBoard[i] === 'draw') {
        boxElem.style.backgroundColor = '#eee';
      } else {
        boxElem.classList.add(bigBoard[i] === 0 ? 'winner1' : 'winner2');
      }
    }
  }

  updateActiveBox();
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

function updateTurnIndicator() {
  turnIndicator.textContent = playerNames[currentPlayer] + "'s turn";
  
  // Highlight whose turn it is
  document.getElementById('player1Info').style.opacity = currentPlayer === 0 ? '1' : '0.5';
  document.getElementById('player2Info').style.opacity = currentPlayer === 1 ? '1' : '0.5';
}

function handleBoardClick(event) {
  if (event.target.tagName !== 'BUTTON') return;
  if (!isMyTurn || currentPlayer !== (playerId === gameRoomManager.playerId ? 0 : (playerId === gameRoomManager.playerId ? 0 : 1))) {
    alert('Not your turn!');
    return;
  }

  const boxElem = event.target.closest('.box');
  const boxIndex = parseInt(boxElem.id);
  const buttonIndex = parseInt(event.target.id.replace('button', '').slice(1));

  if (activeBox !== null && activeBox !== boxIndex) {
    alert('You must play in box ' + activeBox);
    return;
  }

  if (bigBoard[boxIndex] !== null) {
    alert('This box is already won!');
    return;
  }

  if (board[boxIndex][buttonIndex] === null) {
    // Make the move
    board[boxIndex][buttonIndex] = currentPlayer;
    event.target.classList.add(colors[currentPlayer], 'inactive');
    event.target.disabled = true;

    // Check for small board win
    if (checkWin(board[boxIndex], currentPlayer)) {
      bigBoard[boxIndex] = currentPlayer;
      const boxButtons = boxElem.querySelectorAll('button');
      boxButtons.forEach(btn => {
        btn.classList.add(colors[currentPlayer]);
        btn.disabled = true;
      });
      boxElem.style.backgroundColor = lightShade[colors[currentPlayer]];
      
      checkBigBoardWinner();
    } else if (board[boxIndex].every(cell => cell !== null)) {
      // It's a draw in this box
      bigBoard[boxIndex] = 'draw';
      const boxButtons = boxElem.querySelectorAll('button');
      boxButtons.forEach(btn => {
        btn.style.backgroundColor = '#ccc';
        btn.disabled = true;
      });
      boxElem.style.backgroundColor = '#eee';
      
      checkBigBoardWinner();
    }

    // Update active box for next move
    if (bigBoard[buttonIndex] !== null || board[buttonIndex].every(cell => cell !== null)) {
      activeBox = null;
    } else {
      activeBox = buttonIndex;
    }

    // Switch turn
    currentPlayer = currentPlayer === 0 ? 1 : 0;
    isMyTurn = false;

    // Send update to server
    const gameState = {
      board: board,
      bigBoard: bigBoard,
      currentPlayer: currentPlayer,
      activeBox: activeBox,
      status: 'playing'
    };

    gameRoomManager.updateGameState(gameState);
  }
}

function checkBigBoardWinner() {
  if (checkWin(bigBoard, currentPlayer)) {
    gameFinished(currentPlayer);
    return;
  }
  
  if (checkForGameDraw()) {
    let count0 = 0, count1 = 0;
    for (let i = 0; i < 9; i++) {
      if (bigBoard[i] === 0) count0++;
      else if (bigBoard[i] === 1) count1++;
    }
    
    if (count0 > count1) gameFinished(0);
    else if (count1 > count0) gameFinished(1);
    else gameFinished(null);
  }
}

function checkWin(cells, player) {
  const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  return winningCombos.some(combo => combo.every(index => cells[index] === player));
}

function checkForGameDraw() {
  return bigBoard.every(val => val !== null);
}

function gameFinished(winner) {
  const gameState = {
    board: board,
    bigBoard: bigBoard,
    currentPlayer: currentPlayer,
    activeBox: activeBox,
    status: 'finished'
  };

  gameRoomManager.updateGameState(gameState);
  showGameOverlay(winner);
}

function showGameOverlay(winner) {
  let message;
  if (winner !== null && winner !== undefined) {
    message = `${playerNames[winner]} wins!!`;
  } else {
    message = "It's a draw!";
  }
  winnerMessage.textContent = message;
  winnerOverlay.style.display = 'flex';
}

function startGameDisplay() {
  document.querySelector('.bigbox').style.display = 'grid';
  turnIndicator.style.display = 'block';
  waitingOverlay.style.display = 'none';
  onlineModeOverlay.style.display = 'none';

  // Update player info
  document.getElementById('player1Name').textContent = playerNames[0];
  document.getElementById('player2Name').textContent = playerNames[1];

  updateTurnIndicator();
  renderBoardState();
}

function updateConnectionStatus(status) {
  const statusIndicatorEl = document.getElementById('statusIndicator');
  const statusTextEl = document.getElementById('statusText');

  switch (status) {
    case 'connected':
      statusIndicatorEl.style.backgroundColor = '#4CAF50';
      statusTextEl.textContent = 'Connected';
      break;
    case 'connecting':
      statusIndicatorEl.style.backgroundColor = '#FFC107';
      statusTextEl.textContent = 'Connecting...';
      break;
    case 'disconnected':
      statusIndicatorEl.style.backgroundColor = '#f44336';
      statusTextEl.textContent = 'Disconnected';
      break;
  }
}

function cancelWaiting() {
  if (roomId && playerId) {
    gameRoomManager.deleteRoom();
  }
  if (unsubscribeGameState) {
    unsubscribeGameState();
  }
  goBackToMainMenu();
}

function goBackToMainMenu() {
  if (unsubscribeGameState) {
    unsubscribeGameState();
  }
  window.location.href = 'index.html';
}
