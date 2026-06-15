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

// VERİ YAPISI
let players = []; 
let rounds = []; // Her elin (turun) bilgilerini tutar

const homeScreen = document.getElementById("home-screen");
const setupScreen = document.getElementById("setup-screen");
const gameScreen = document.getElementById("game-screen");

const startBtn = document.getElementById("start-btn");
const playerNameInput = document.getElementById("player-name");
const addPlayerBtn = document.getElementById("add-player-btn");
const playerList = document.getElementById("player-list");
const startMatchBtn = document.getElementById("start-match-btn");

startBtn.addEventListener("click", () => {
    homeScreen.style.display = "none";
    setupScreen.style.display = "block";
});

addPlayerBtn.addEventListener("click", () => {
    const name = playerNameInput.value.trim();
    if(name !== "") {
        players.push({ name: name }); 
        playerNameInput.value = ""; 
        updateList(); 
    }
});

function updateList() {
    playerList.innerHTML = ""; 
    players.forEach((player, index) => {
        const li = document.createElement("li");
        li.innerHTML = `<span>👤 ${player.name}</span> <button class="remove-btn" onclick="removePlayer(${index})">X</button>`;
        playerList.appendChild(li);
    });
    startMatchBtn.style.display = players.length >= 2 ? "block" : "none";
}

window.removePlayer = function(index) {
    players.splice(index, 1);
    updateList();
}

// OYUNU BAŞLAT
startMatchBtn.addEventListener("click", () => {
    setupScreen.style.display = "none";
    gameScreen.style.display = "block";
    
    // İlk eli oluştur (Her oyuncu için boş bir dizi açıyoruz)
    rounds = [ players.map(() => []) ];
    renderTable(); 
});

// TABLOYU ÇİZME FONKSİYONU
function renderTable() {
    const thead = document.getElementById("score-thead");
    const tbody = document.getElementById("score-tbody");
    const tfoot = document.getElementById("score-tfoot");

    // 1. BAŞLIKLAR (Oyuncu İsimleri)
    thead.innerHTML = `<tr><th>Turlar</th>${players.map(p => `<th>${p.name}</th>`).join('')}</tr>`;

    // 2. SATIRLAR (Eller ve Puanlar)
    tbody.innerHTML = "";
    rounds.forEach((round, rIndex) => {
        let tr = document.createElement("tr");
        
        // Tur Numarası
        let roundNameTd = document.createElement("td");
        roundNameTd.innerHTML = `<strong>${rIndex + 1}. El</strong>`;
        tr.appendChild(roundNameTd);

        // Oyuncuların o turdaki hücreleri
        round.forEach((playerScores, pIndex) => {
            let td = document.createElement("td");
            td.className = "cell-score";
            td.onclick = () => addScoreToCell(rIndex, pIndex); // Hücreye tıklama özelliği

            // Hücrenin içindeki puanları alt alta yazdır
            let html = playerScores.map(score => {
                let sign = score > 0 ? "+" : "";
                let colorClass = score >= 0 ? "positive" : "negative";
                return `<div class="score-val ${colorClass}">${sign}${score}</div>`;
            }).join('');

            // Eğer hücre boşsa ipucu göster
            if (html === "") html = `<div class="add-score-hint">Puan Gir</div>`;

            td.innerHTML = html;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    // 3. TOPLAMLAR (Matematik Hesaplaması)
    let totals = players.map(() => 0); // Herkesin toplamını 0'dan başlat
    rounds.forEach(round => {
        round.forEach((playerScores, pIndex) => {
            playerScores.forEach(score => totals[pIndex] += score); // Tüm hücrelerdeki sayıları topla
        });
    });

    // Toplam satırını yazdır
    tfoot.innerHTML = `<tr><th>TOPLAM</th>${totals.map(t => `<th>${t}</th>`).join('')}</tr>`;
}

// HÜCREYE PUAN EKLEME MANTIĞI
window.addScoreToCell = function(rIndex, pIndex) {
    let points = prompt(`${rIndex + 1}. El - ${players[pIndex].name} için puan girin.\n(Eksi puan için başına - koyun, örn: -30):`); 
    
    if (points !== null && points.trim() !== "") {
        let parsed = parseInt(points);
        if (!isNaN(parsed)) {
            // İlgili turun ilgili oyuncusunun hücresine puanı ekle
            rounds[rIndex][pIndex].push(parsed);
            renderTable(); // Tabloyu güncelle
        } else {
            alert("Lütfen sadece rakam girin!");
        }
    }
}

// YENİ EL EKLE BUTONU
document.getElementById("new-round-btn").addEventListener("click", () => {
    rounds.push(players.map(() => [])); // Yeni bir boş satır ekle
    renderTable();
});

document.getElementById("end-game-btn").addEventListener("click", () => {
    alert("Oyun bitti! Sonuç ekranı yapım aşamasında...");
});