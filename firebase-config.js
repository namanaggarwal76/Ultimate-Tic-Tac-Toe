// Firebase Configuration
// Replace these with your Firebase project credentials
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase (only if credentials are provided)
let db = null;

function initializeFirebase() {
  if (firebaseConfig.apiKey === "YOUR_API_KEY") {
    console.warn("Firebase credentials not configured. Online mode will be disabled.");
    return false;
  }
  
  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    return true;
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    return false;
  }
}

// Get database reference
function getDB() {
  return db;
}

// Check if Firebase is initialized
function isFirebaseInitialized() {
  return db !== null;
}
