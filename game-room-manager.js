// Game Room Management System
class GameRoomManager {
  constructor() {
    this.roomId = null;
    this.playerId = null;
    this.gameData = null;
    this.listeners = [];
  }

  // Generate unique player ID
  generatePlayerId() {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate unique room ID
  generateRoomId() {
    return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`.substr(0, 20);
  }

  // Create a new game room
  async createRoom(player1Name) {
    if (!isFirebaseInitialized()) return { success: false, error: "Firebase not initialized" };

    this.playerId = this.generatePlayerId();
    this.roomId = this.generateRoomId();

    const roomData = {
      roomId: this.roomId,
      player1: {
        id: this.playerId,
        name: player1Name,
        symbol: 0
      },
      player2: null,
      gameState: {
        board: Array(9).fill(null).map(() => Array(9).fill(null)),
        bigBoard: Array(9).fill(null),
        currentPlayer: 0,
        activeBox: null,
        status: 'waiting' // waiting, playing, finished
      },
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    try {
      const db = getDB();
      await db.ref(`rooms/${this.roomId}`).set(roomData);
      return { success: true, roomId: this.roomId, playerId: this.playerId };
    } catch (error) {
      console.error("Error creating room:", error);
      return { success: false, error: error.message };
    }
  }

  // Join an existing game room
  async joinRoom(roomId, player2Name) {
    if (!isFirebaseInitialized()) return { success: false, error: "Firebase not initialized" };

    this.playerId = this.generatePlayerId();
    this.roomId = roomId;

    try {
      const db = getDB();
      const roomRef = db.ref(`rooms/${roomId}`);
      const snapshot = await roomRef.once('value');
      const room = snapshot.val();

      if (!room) {
        return { success: false, error: "Room not found" };
      }

      if (room.player2 !== null) {
        return { success: false, error: "Room is full" };
      }

      // Update room with player 2
      await roomRef.update({
        'player2': {
          id: this.playerId,
          name: player2Name,
          symbol: 1
        },
        'gameState.status': 'playing',
        'lastUpdated': new Date().toISOString()
      });

      return { success: true, roomId: this.roomId, playerId: this.playerId, room: room };
    } catch (error) {
      console.error("Error joining room:", error);
      return { success: false, error: error.message };
    }
  }

  // Subscribe to real-time game updates
  onGameStateChange(callback) {
    if (!isFirebaseInitialized() || !this.roomId) return;

    const db = getDB();
    const unsubscribe = db.ref(`rooms/${this.roomId}/gameState`).on('value', (snapshot) => {
      const gameState = snapshot.val();
      if (gameState) {
        callback(gameState);
      }
    });

    return unsubscribe;
  }

  // Update game state
  async updateGameState(gameState) {
    if (!isFirebaseInitialized() || !this.roomId) return false;

    try {
      const db = getDB();
      await db.ref(`rooms/${this.roomId}`).update({
        'gameState': gameState,
        'lastUpdated': new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error("Error updating game state:", error);
      return false;
    }
  }

  // Delete room
  async deleteRoom() {
    if (!isFirebaseInitialized() || !this.roomId) return false;

    try {
      const db = getDB();
      await db.ref(`rooms/${this.roomId}`).remove();
      return true;
    } catch (error) {
      console.error("Error deleting room:", error);
      return false;
    }
  }

  // Get active rooms
  async getActiveRooms() {
    if (!isFirebaseInitialized()) return [];

    try {
      const db = getDB();
      const snapshot = await db.ref('rooms').orderByChild('gameState/status').equalTo('waiting').limitToLast(10).once('value');
      const rooms = [];
      snapshot.forEach((child) => {
        rooms.push({
          roomId: child.key,
          ...child.val()
        });
      });
      return rooms;
    } catch (error) {
      console.error("Error fetching rooms:", error);
      return [];
    }
  }
}

const gameRoomManager = new GameRoomManager();
