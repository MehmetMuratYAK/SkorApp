import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

// BURAYA KENDİ FIREBASE CONFIG BİLGİLERİNİ YAPIŞTIR
const firebaseConfig = {
  apiKey: "AIzaSyA963gL6nAee0JZ11W5Utbfz4UL9n8VFdg",
  authDomain: "skorapp-cc771.firebaseapp.com",
  projectId: "skorapp-cc771",
  storageBucket: "skorapp-cc771.firebasestorage.app",
  messagingSenderId: "336176556053",
  appId: "1:336176556053:web:47663b2ef090e9554e461c",
  measurementId: "G-4JBJSCYTJP"
};

const app = initializeApp(firebaseConfig);
document.getElementById("status-message").innerText = "✅ Sistem Hazır";
document.getElementById("status-message").style.color = "#4CAF50";

// --- OYUN MANTIĞI ---
let players = []; // Oyuncuları tutacağımız depo

// Ekrandaki elemanları seçiyoruz
const homeScreen = document.getElementById("home-screen");
const setupScreen = document.getElementById("setup-screen");
const startBtn = document.getElementById("start-btn");
const playerNameInput = document.getElementById("player-name");
const addPlayerBtn = document.getElementById("add-player-btn");
const playerList = document.getElementById("player-list");
const startMatchBtn = document.getElementById("start-match-btn");

// 1. EKRAN GEÇİŞİ
startBtn.addEventListener("click", () => {
    homeScreen.style.display = "none";
    setupScreen.style.display = "block";
});

// 2. OYUNCU EKLEME
addPlayerBtn.addEventListener("click", () => {
    const name = playerNameInput.value.trim();
    if(name !== "") {
        players.push(name); // Listeye ekle
        playerNameInput.value = ""; // Kutuyu temizle
        updateList(); // Ekranı güncelle
    }
});

// 3. EKRANI GÜNCELLEME VE SİLME BUTONLARI OLUŞTURMA
function updateList() {
    playerList.innerHTML = ""; 
    players.forEach((player, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>👤 ${player}</span>
            <button class="remove-btn" onclick="removePlayer(${index})">X</button>
        `;
        playerList.appendChild(li);
    });

    // En az 2 oyuncu varsa BAŞLA butonunu göster
    if(players.length >= 2) {
        startMatchBtn.style.display = "block";
    } else {
        startMatchBtn.style.display = "none";
    }
}

// Silme fonksiyonunu HTML içinden çağırabilmek için global yapıyoruz
window.removePlayer = function(index) {
    players.splice(index, 1);
    updateList();
}

// 4. MAÇI BAŞLAT
startMatchBtn.addEventListener("click", () => {
    alert("Harika! Maç Başlıyor. Masadaki Oyuncular:\n" + players.join(", "));
});