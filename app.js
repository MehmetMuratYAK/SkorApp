import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

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

// OYUNCU DEPOSU (Artık isim ve skor tutuyor)
let players = []; 

// EKRAN SEÇİMLERİ
const homeScreen = document.getElementById("home-screen");
const setupScreen = document.getElementById("setup-screen");
const gameScreen = document.getElementById("game-screen");

const startBtn = document.getElementById("start-btn");
const playerNameInput = document.getElementById("player-name");
const addPlayerBtn = document.getElementById("add-player-btn");
const playerList = document.getElementById("player-list");
const startMatchBtn = document.getElementById("start-match-btn");
const scoreBoard = document.getElementById("score-board");
const endGameBtn = document.getElementById("end-game-btn");

// EKRAN 1 -> EKRAN 2
startBtn.addEventListener("click", () => {
    homeScreen.style.display = "none";
    setupScreen.style.display = "block";
});

// OYUNCU EKLEME
addPlayerBtn.addEventListener("click", () => {
    const name = playerNameInput.value.trim();
    if(name !== "") {
        // Yeni oyuncuyu sıfır puanla listeye ekliyoruz
        players.push({ name: name, score: 0 }); 
        playerNameInput.value = ""; 
        updateList(); 
    }
});

// KURULUM LİSTESİNİ GÜNCELLE
function updateList() {
    playerList.innerHTML = ""; 
    players.forEach((player, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>👤 ${player.name}</span>
            <button class="remove-btn" onclick="removePlayer(${index})">X</button>
        `;
        playerList.appendChild(li);
    });

    if(players.length >= 2) startMatchBtn.style.display = "block";
    else startMatchBtn.style.display = "none";
}

window.removePlayer = function(index) {
    players.splice(index, 1);
    updateList();
}

// EKRAN 2 -> EKRAN 3 (OYUN BAŞLIYOR)
startMatchBtn.addEventListener("click", () => {
    setupScreen.style.display = "none";
    gameScreen.style.display = "block";
    renderScoreBoard(); // Skor tablosunu çiz
});

// SKOR TABLOSUNU ÇİZME FONKSİYONU
function renderScoreBoard() {
    scoreBoard.innerHTML = ""; // Önce ekranı temizle
    
    // Her oyuncu için bir kart oluştur
    players.forEach((player, index) => {
        const card = document.createElement("div");
        card.className = "score-card";
        card.innerHTML = `
            <div class="player-info">
                <div class="player-name">${player.name}</div>
                <div class="player-score">${player.score}</div>
            </div>
            <div class="score-controls">
                <button class="btn-score btn-minus" onclick="changeScore(${index}, 'minus')">-</button>
                <button class="btn-score btn-plus" onclick="changeScore(${index}, 'plus')">+</button>
            </div>
        `;
        scoreBoard.appendChild(card);
    });
}

// PUAN DEĞİŞTİRME MANTIĞI
window.changeScore = function(index, type) {
    // Kullanıcıya kaç puan ekleneceğini/çıkacağını soruyoruz
    let points = prompt("Kaç puan?", "10"); 
    
    if (points !== null && points !== "") {
        let parsedPoints = parseInt(points);
        
        if (!isNaN(parsedPoints)) {
            // Artı mı eksi mi basıldı kontrol et
            if (type === 'plus') {
                players[index].score += parsedPoints;
            } else {
                players[index].score -= parsedPoints;
            }
            renderScoreBoard(); // Ekranı yeni puanlarla güncelle
        } else {
            alert("Lütfen sadece rakam girin!");
        }
    }
}

// OYUNU BİTİR
endGameBtn.addEventListener("click", () => {
    alert("Oyun bitti! Sonuç ekranı yapım aşamasında...");
});