# Ultimate Tic-Tac-Toe - Full Multiplayer Game

A complete implementation of Ultimate Tic-Tac-Toe with both offline local multiplayer and online multiplayer modes using Firebase Realtime Database.

## Project Structure

```
Ultimate-Tic-Tac-Toe/
├── index.html              # Main menu
├── offline_index.html      # Offline game page
├── online-index.html       # Online game page
├── script.js               # Offline game logic
├── online-game.js          # Online game logic
├── firebase-config.js      # Firebase configuration
├── game-room-manager.js    # Game room and Firebase management
├── style.css               # Main styles
├── online-style.css        # Online mode styles
└── README.md              # This file
```

## How to Play

### Offline Mode
1. Click "Offline" from the main menu
2. Enter player names
3. Click "Start Game"
4. Players take turns clicking cells
5. The next player must play in the box indicated by the previous player's move
6. Win a small board by getting 3 in a row within it
7. Win the game by winning 3 small boards in a row
8. Game ends when someone wins or all boards are filled

### Online Mode
1. Click "Online" from the main menu
2. Choose to "Create Room" or "Join Room"

**Creating a Room:**
- Enter your name
- Click "Create Room"
- Share the Room ID with your opponent
- Wait for them to join

**Joining a Room:**
- Enter your name
- Enter the Room ID provided by your opponent
- Click "Join Room"
- Game starts immediately

## Game Rules

### Ultimate Tic-Tac-Toe Rules
- The board consists of 9 smaller 3x3 grids arranged in a 3x3 pattern
- Players alternate turns placing their symbol (X or O) in any empty cell of the active small board
- When a player places a symbol that completes 3 in a row (horizontally, vertically, or diagonally) within a small board, that board is won by that player
- The next player must play in the small board indicated by the row and column of the opponent's previous move
- If the indicated board is already won or completely filled, the next player may play in any board
- The game is won when a player wins 3 small boards in a line (horizontally, vertically, or diagonally)
- If all 9 boards are filled without a winner, the game is a draw

## Technologies Used
- HTML5
- CSS3
- JavaScript (ES6+)
- Firebase Realtime Database
- LocalStorage API

## Future Enhancements
- User authentication and accounts
- Game statistics and leaderboards
- AI opponent for single-player mode
- Mobile app version
- Voice chat integration
- Game replay functionality
- Timeout management for abandoned games

Enjoy playing Ultimate Tic-Tac-Toe! 🎮