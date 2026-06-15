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

// OYUNCU DEPOSU (Artık isim, toplam puan ve geçmiş listesi tutuyor)
let players = []; 

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

startBtn.addEventListener("click", () => {
    homeScreen.style.display = "none";
    setupScreen.style.display = "block";
});

addPlayerBtn.addEventListener("click", () => {
    const name = playerNameInput.value.trim();
    if(name !== "") {
        // YENİ: history adında boş bir liste ekledik
        players.push({ name: name, total: 0, history: [] }); 
        playerNameInput.value = ""; 
        updateList(); 
    }
});

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

startMatchBtn.addEventListener("click", () => {
    setupScreen.style.display = "none";
    gameScreen.style.display = "block";
    renderScoreBoard(); 
});

// SKOR TABLOSUNU ÇİZ
function renderScoreBoard() {
    scoreBoard.innerHTML = ""; 
    
    players.forEach((player, index) => {
        // YENİ: Oyuncunun geçmişini satır satır HTML'e çeviriyoruz
        let historyHTML = "";
        player.history.forEach((point, roundIndex) => {
            let typeClass = point >= 0 ? "positive" : "negative";
            let sign = point > 0 ? "+" : ""; // Sadece pozitifse + koy
            historyHTML += `
                <div class="history-item ${typeClass}">
                    <span>Tur ${roundIndex + 1}</span>
                    <span>${sign}${point}</span>
                </div>
            `;
        });

        // Geçmiş boşsa bilgi yazısı koy
        if(historyHTML === "") {
            historyHTML = `<div class="empty-history">Henüz puan girilmedi</div>`;
        }

        const card = document.createElement("div");
        card.className = "score-card";
        card.innerHTML = `
            <div class="card-header">
                <div class="player-info">
                    <div class="player-name">${player.name}</div>
                    <div class="player-score">${player.total}</div>
                </div>
                <div class="score-controls">
                    <button class="btn-score btn-minus" onclick="changeScore(${index}, 'minus')">-</button>
                    <button class="btn-score btn-plus" onclick="changeScore(${index}, 'plus')">+</button>
                </div>
            </div>
            <div class="score-history">
                ${historyHTML}
            </div>
        `;
        scoreBoard.appendChild(card);
    });
}

// PUAN DEĞİŞTİRME VE GEÇMİŞE YAZMA
window.changeScore = function(index, type) {
    let points = prompt("Kaç puan?", "10"); 
    
    if (points !== null && points !== "") {
        let parsedPoints = parseInt(points);
        
        if (!isNaN(parsedPoints)) {
            // YENİ: Puanı eksi veya artı olarak ayarla
            let finalPoint = type === 'plus' ? parsedPoints : -Math.abs(parsedPoints);
            
            // 1. Puanı geçmişe (log) ekle
            players[index].history.push(finalPoint);
            
            // 2. Geçmişteki tüm puanları toplayarak GÜNCEL TOTALİ bul
            players[index].total = players[index].history.reduce((a, b) => a + b, 0);

            renderScoreBoard(); // Ekranı güncelle
        } else {
            alert("Lütfen sadece rakam girin!");
        }
    }
}

endGameBtn.addEventListener("click", () => {
    alert("Oyun bitti! Sonuç ekranı yapım aşamasında...");
});