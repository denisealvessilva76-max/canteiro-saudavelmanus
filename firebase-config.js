// Firebase Configuration - Compartilhado entre app.html, admin.html e health-check.html
// Importar em qualquer arquivo HTML com: <script src="firebase-config.js"></script>

const firebaseConfig = {
  apiKey: "AIzaSyB32S5Eac0guxy1herefub70AIAGkgF1Rw",
  authDomain: "canteiro-saudavel.firebaseapp.com",
  databaseURL: "https://canteiro-saudavel-default-rtdb.firebaseio.com",
  projectId: "canteiro-saudavel",
  storageBucket: "canteiro-saudavel.firebasestorage.app",
  messagingSenderId: "37768857073",
  appId: "1:37768857073:web:3e62666713391869813050"
};

// Inicializar Firebase (se ainda não estiver inicializado)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Exportar para uso em outros scripts
const db = firebase.database();
const auth = firebase.auth();
