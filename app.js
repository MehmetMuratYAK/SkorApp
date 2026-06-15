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
document.getElementById("status-message").style.color = "#1c7b64";

let players = []; 
let rounds = []; 
let pastParties = []; 
let currentParty = 1;

const homeScreen = document.getElementById("home-screen");
const setupScreen = document.getElementById("setup-screen");
const gameScreen = document.getElementById("game-screen");
const endScreen = document.getElementById("end-screen");
const summaryScreen = document.getElementById("summary-screen"); // YENİ EKRAN
const podium = document.getElementById("podium");

const startBtn = document.getElementById("start-btn");
const playerNameInput = document.getElementById("player-name");
const addPlayerBtn = document.getElementById("add-player-btn");
const playerList = document.getElementById("player-list");
const startMatchBtn = document.getElementById("start-match-btn");
const gameSettingsArea = document.getElementById("game-settings-area");

const winConditionSelect = document.getElementById("win-condition");
const targetScoreInput = document.getElementById("target-score");
const statTypeSelect = document.getElementById("stat-type"); // YENİ SELECTION
const partyTitle = document.getElementById("party-title");
const liveSeriesScore = document.getElementById("live-series-score");
const manualEndBtn = document.getElementById("manual-end-btn");
const nextPartyBtn = document.getElementById("next-party-btn");
const endCompletelyBtn = document.getElementById("end-completely-btn");
const seriesScoreList = document.getElementById("series-score-list");
const gameCountInfo = document.getElementById("game-count-info");
const summaryList = document.getElementById("summary-list");
const finalRestartBtn = document.getElementById("final-restart-btn");

startBtn.addEventListener("click", () => {
    homeScreen.style.display = "none";
    setupScreen.style.display = "block";
});

addPlayerBtn.addEventListener("click", () => {
    const name = playerNameInput.value.trim();
    if(name !== "") {
        // YENİ: placements nesnesi ile kim kaçıncı oldu tek tek sayacağız
        players.push({ name: name, wins: 0, placements: {} }); 
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
    
    if(players.length >= 2) {
        startMatchBtn.style.display = "block";
        gameSettingsArea.style.display = "block";
    } else {
        startMatchBtn.style.display = "none";
        gameSettingsArea.style.display = "none";
    }
}

window.removePlayer = function(index) {
    players.splice(index, 1);
    updateList();
}

startMatchBtn.addEventListener("click", () => {
    setupScreen.style.display = "none";
    startParty();
});

function startParty() {
    gameScreen.style.display = "block";
    endScreen.style.display = "none";
    summaryScreen.style.display = "none";
    partyTitle.innerText = `${currentParty}. Parti Oynanıyor`;
    nextPartyBtn.innerText = `${currentParty + 1}. Parti'ye Geç`;
    
    let winCondition = winConditionSelect.value;
    let panelHTML = `<div style="font-weight: bold; text-align: center; margin-bottom: 8px; border-bottom: 1px solid #dee2e6; padding-bottom: 5px; color:#2c4d61;">🏆 GENEL SERİ: ${players.map(p => `${p.name}: ${p.wins}`).join(' - ')}</div>`;
    
    if (pastParties.length > 0) {
        panelHTML += `<div style="font-size: 13px; display: flex; flex-direction: column; gap: 4px;">`;
        pastParties.forEach((partyTotals, index) => {
            let maxScore = Math.max(...partyTotals);
            let minScore = Math.min(...partyTotals);
            let winnerValue = winCondition === "high" ? maxScore : minScore;
            let loserValue = winCondition === "high" ? minScore : maxScore;
            
            let partyRow = `<strong>${index + 1}. Parti:</strong> `;
            let playerStrings = players.map((p, pIndex) => {
                let score = partyTotals[pIndex];
                let colorStyle = "color: #333;";
                if (score === winnerValue) colorStyle = "color: #1c7b64; font-weight: bold;";
                else if (score === loserValue) colorStyle = "color: #e74c3c; font-weight: bold;";
                return `${p.name}: <span style="${colorStyle}">${score}</span>`;
            });
            partyRow += playerStrings.join(', ');
            panelHTML += `<div>${partyRow}</div>`;
        });
        panelHTML += `</div>`;
    } else {
        panelHTML += `<div style="text-align: center; color: #7f8c8d; font-size: 12px; font-style: italic;">İlk parti oynanıyor, henüz geçmiş kütüğü yok.</div>`;
    }
    
    liveSeriesScore.innerHTML = panelHTML;
    rounds = [ players.map(() => []) ];
    renderTable();
}

function renderTable() {
    const thead = document.getElementById("score-thead");
    const tbody = document.getElementById("score-tbody");
    const tfoot = document.getElementById("score-tfoot");

    thead.innerHTML = `<tr><th>Turlar</th>${players.map(p => `<th>${p.name}</th>`).join('')}</tr>`;

    tbody.innerHTML = "";
    rounds.forEach((round, rIndex) => {
        let tr = document.createElement("tr");
        let roundNameTd = document.createElement("td");
        roundNameTd.innerHTML = `<strong>${rIndex + 1}. El</strong>`;
        tr.appendChild(roundNameTd);

        round.forEach((playerScores, pIndex) => {
            let td = document.createElement("td");
            td.className = "cell-score";
            td.onclick = () => addScoreToCell(rIndex, pIndex); 

            let html = playerScores.map(score => {
                let sign = score > 0 ? "+" : "";
                let colorClass = score >= 0 ? "positive" : "negative";
                return `<div class="score-val ${colorClass}">${sign}${score}</div>`;
            }).join('');

            if (html === "") html = `<div class="add-score-hint">Puan Gir</div>`;
            td.innerHTML = html;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    let totals = players.map(() => 0); 
    rounds.forEach(round => {
        round.forEach((playerScores, pIndex) => {
            playerScores.forEach(score => totals[pIndex] += score); 
        });
    });

    tfoot.innerHTML = `<tr><th>TOPLAM</th>${totals.map(t => `<th>${t}</th>`).join('')}</tr>`;
    return totals; 
}

window.addScoreToCell = function(rIndex, pIndex) {
    let points = prompt(`${rIndex + 1}. El - ${players[pIndex].name} için puan girin:`); 
    if (points !== null && points.trim() !== "") {
        let parsed = parseInt(points);
        if (!isNaN(parsed)) {
            rounds[rIndex][pIndex].push(parsed);
            let currentTotals = renderTable(); 
            checkAutoEnd(currentTotals); 
        } else {
            alert("Lütfen sadece rakam girin!");
        }
    }
}

document.getElementById("new-round-btn").addEventListener("click", () => {
    rounds.push(players.map(() => [])); 
    renderTable();
});

function checkAutoEnd(totals) {
    let target = parseInt(targetScoreInput.value);
    if (!isNaN(target)) {
        let winCondition = winConditionSelect.value;
        let isGameOver = false;

        if (winCondition === "high") {
            isGameOver = totals.some(t => t >= target);
        } else {
            isGameOver = totals.some(t => t <= target); 
        }

        if (isGameOver) {
            setTimeout(() => {
                alert(`Hedef puana (${target}) ulaşıldı! ${currentParty}. Parti Sona Erdi.`);
                endParty();
            }, 300); 
        }
    }
}

manualEndBtn.addEventListener("click", () => {
    if(confirm("Bu partiyi bitirip sonuçları görmek istediğinize emin misiniz?")) {
        endParty();
    }
});

function endParty() {
    gameScreen.style.display = "none";
    endScreen.style.display = "block";
    
    let partyTotalsOrdered = players.map((p, i) => {
        let totalScore = 0;
        rounds.forEach(round => {
            if(round[i]) {
                round[i].forEach(score => totalScore += score);
            }
        });
        return totalScore;
    });
    pastParties.push(partyTotalsOrdered); 

    let totals = players.map((p, i) => {
        return { originalIndex: i, name: p.name, score: partyTotalsOrdered[i] };
    });
    
    let winCondition = winConditionSelect.value;
    if (winCondition === "high") {
        totals.sort((a, b) => b.score - a.score); 
    } else {
        totals.sort((a, b) => a.score - b.score); 
    }
    
    // YENİ: KIM KAÇINCI OLDU HAFIZAYA KAYDET
    totals.forEach((player, index) => {
        let rank = index + 1;
        let playerObj = players[player.originalIndex];
        playerObj.placements[rank] = (playerObj.placements[rank] || 0) + 1;
    });

    let winnerIndex = totals[0].originalIndex;
    players[winnerIndex].wins += 1;
    
    podium.innerHTML = "";
    totals.forEach((player, index) => {
        let rankClass = index === 0 ? "rank-1" : index === 1 ? "rank-2" : index === 2 ? "rank-3" : "";
        let medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
        let colorClass = player.score < 0 ? "negative" : "positive";
        
        podium.innerHTML += `
            <div class="podium-item ${rankClass}">
                <span><span class="rank-badge">${medal}</span> ${player.name}</span>
                <span class="score-val ${colorClass}">${player.score}</span>
            </div>
        `;
    });

    seriesScoreList.innerHTML = "";
    players.forEach(p => {
        seriesScoreList.innerHTML += `
            <div style="background: #ffffff; padding: 5px 15px; border-radius: 8px; font-weight: bold; border: 1px solid #bdc3c7;">
                ${p.name}: <span style="color: #2980b9; font-size: 18px;">${p.wins}</span>
            </div>
        `;
    });
    
    if(typeof confetti === "function") {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
}

nextPartyBtn.addEventListener("click", () => {
    currentParty += 1;
    startParty(); 
});

// YENİ: GENEL ÖZETİ HESAPLAMA VE EKRANA BASMA (OYUNU BİTİR BUTONU)
endCompletelyBtn.addEventListener("click", () => {
    if(confirm("Tüm turnuvayı bitirip genel oyuncu istatistik özetini görmek istiyor musunuz?")) {
        endScreen.style.display = "none";
        summaryScreen.style.display = "block";
        
        // 1. Oyun sayma mantığına göre toplam oyun sayısını hesapla
        const statType = statTypeSelect.value;
        let totalGamesCount = 0;
        if (statType === "per-party") {
            totalGamesCount = pastParties.length; // Oynanan parti sayısı kadar oyun
        } else {
            totalGamesCount = pastParties.length > 0 ? 1 : 0; // Tüm turnuva tek bir oyun
        }
        
        gameCountInfo.innerText = `🎮 Toplam Değerlendirilen Oyun Sayısı: ${totalGamesCount}`;
        
        // 2. Oyuncu özet kartlarını oluştur
        summaryList.innerHTML = "";
        players.forEach(p => {
            let placementBadges = [];
            
            // Masadaki oyuncu sayısı kadar sıralama ihtimali vardır
            for (let i = 1; i <= players.length; i++) {
                let count = p.placements[i] || 0;
                if (count > 0) {
                    placementBadges.push(`<span style="background: #eaf2f8; color: #2980b9; padding: 4px 10px; border-radius: 6px; border: 1px solid #d4e6f1; font-size: 13px; font-weight: bold;">${i}.lik: ${count} Kez</span>`);
                }
            }
            
            if(placementBadges.length === 0) {
                placementBadges.push(`<span style="color:#7f8c8d; font-style:italic; font-size:13px;">Hiçbir veri kaydedilmedi</span>`);
            }
            
            summaryList.innerHTML += `
                <div style="background: #ffffff; border: 1px solid #dee2e6; padding: 15px; border-radius: 12px; text-align: left; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">
                    <strong style="color: #1c7b64; font-size: 16px; display: block; margin-bottom: 8px;">👤 ${p.name}</strong>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px;">
                        ${placementBadges.join('')}
                    </div>
                    <div style="font-size: 13px; color: #7f8c8d; font-weight: 500;">🏆 Toplam Parti Galibiyeti: ${p.wins}</div>
                </div>
            `;
        });
    }
});

finalRestartBtn.addEventListener("click", () => {
    location.reload(); 
});