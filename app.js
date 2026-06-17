import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, getDoc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
// GÜNCELLEME: Şifre güncellemek için updatePassword modülü dahil edildi
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup, updatePassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// FIREBASE YAPILANDIRMASI (GERÇEK ÇALIŞAN API ANAHTARINI BURAYA YAZ)
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
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// UYGULAMA DURUMU (STATE)
let currentUserData = null; 
let isLoginMode = true; 
let isQuickStart = false; 
let currentSelectedGroupId = null; 
let currentGroupData = null; 

let players = []; 
let rounds = []; 
let pastParties = []; 
let currentParty = 1;
let selectedGameName = "";

// ELEMAN SEÇİCİLER (DOM)
const authScreen = document.getElementById("auth-screen");
const registerExtraFields = document.getElementById("register-extra-fields");
const authTitle = document.getElementById("auth-title");
const authUsernameInput = document.getElementById("auth-username");
const authEmailInput = document.getElementById("auth-email");
const authPasswordInput = document.getElementById("auth-password");
const authAvatarInput = document.getElementById("auth-avatar");
const authFavGamesInput = document.getElementById("auth-fav-games");
const authPrimaryBtn = document.getElementById("auth-primary-btn");
const googleAuthBtn = document.getElementById("google-auth-btn");
const forgotPasswordBtn = document.getElementById("forgot-password-btn");
const toggleAuthBtn = document.getElementById("toggle-auth-btn");
const quickStartBtn = document.getElementById("quick-start-btn");

const dashboardScreen = document.getElementById("dashboard-screen");
const userAvatar = document.getElementById("user-avatar");
const userWelcome = document.getElementById("user-welcome");
const userBadge = document.getElementById("user-badge");
const logoutBtn = document.getElementById("logout-btn");
const groupList = document.getElementById("group-list");
const newGroupNameInput = document.getElementById("new-group-name");
const createGroupBtn = document.getElementById("create-group-btn");
const dashboardQuickBtn = document.getElementById("dashboard-quick-btn");

const groupDetailScreen = document.getElementById("group-detail-screen");
const detailGroupName = document.getElementById("detail-group-name");
const detailLeaderboard = document.getElementById("detail-leaderboard");
const detailRecentGames = document.getElementById("detail-recent-games");
const detailBackBtn = document.getElementById("detail-back-btn");
const detailStartMatchBtn = document.getElementById("detail-start-match-btn");

const setupScreen = document.getElementById("setup-screen");
const setupTitle = document.getElementById("setup-title");
const setupAddArea = document.getElementById("setup-add-area");
const setupBackBtn = document.getElementById("setup-back-btn");
const playerList = document.getElementById("player-list");
const playerNameInput = document.getElementById("player-name");
const addPlayerBtn = document.getElementById("add-player-btn");
const gameSettingsArea = document.getElementById("game-settings-area");
const startMatchBtn = document.getElementById("start-match-btn");

const gameScreen = document.getElementById("game-screen");
const partyTitle = document.getElementById("party-title");
const liveSeriesScore = document.getElementById("live-series-score");
const winConditionSelect = document.getElementById("win-condition");
const targetScoreInput = document.getElementById("target-score");
const statTypeSelect = document.getElementById("stat-type");
const gameTypeSelect = document.getElementById("game-type");
const manualEndBtn = document.getElementById("manual-end-btn");

const endScreen = document.getElementById("end-screen");
const podium = document.getElementById("podium");
const seriesScoreList = document.getElementById("series-score-list");
const nextPartyBtn = document.getElementById("next-party-btn");
const endCompletelyBtn = document.getElementById("end-completely-btn");

const summaryScreen = document.getElementById("summary-screen");
const gameCountInfo = document.getElementById("game-count-info");
const summaryList = document.getElementById("summary-list");
const finalRestartBtn = document.getElementById("final-restart-btn");

const statusMsg = document.getElementById("status-message");

statusMsg.innerText = "✅ Sistem Hazır";
statusMsg.style.color = "#1c7b64";

// --- GİRİŞ / KAYIT EKRANI İŞLEMLERİ ---

toggleAuthBtn.addEventListener("click", () => {
    isLoginMode = !isLoginMode;
    if (isLoginMode) {
        authTitle.innerText = "Giriş Yap";
        authPrimaryBtn.innerText = "Giriş Yap";
        toggleAuthBtn.innerText = "Hesabın yok mu? Kayıt Ol";
        authUsernameInput.style.display = "none";
        registerExtraFields.style.display = "none";
    } else {
        authTitle.innerText = "Kayıt Ol";
        authPrimaryBtn.innerText = "Hesap Oluştur";
        toggleAuthBtn.innerText = "Zaten üye misin? Giriş Yap";
        authUsernameInput.style.display = "block";
        registerExtraFields.style.display = "block";
    }
});

authPrimaryBtn.addEventListener("click", async () => {
    const email = authEmailInput.value.trim();
    const password = authPasswordInput.value.trim();
    
    if (!email || !password) {
        alert("Lütfen gerekli alanları doldurun!");
        return;
    }
    
    try {
        if (isLoginMode) {
            statusMsg.innerText = "⏳ Oturum açılıyor...";
            await signInWithEmailAndPassword(auth, email, password);
        } else {
            const username = authUsernameInput.value.trim();
            if (!username) {
                alert("Kullanıcı adı şarttır!");
                return;
            }
            statusMsg.innerText = "⏳ Hesap oluşturuluyor...";
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(db, "users", userCredential.user.uid), {
                username: username,
                email: email,
                avatar: authAvatarInput.value.trim() || "👤",
                favGames: authFavGamesInput.value.trim() || "",
                isAdmin: false
            });
            alert("Hesabınız oluşturuldu!");
        }
    } catch (error) {
        alert("Hata: " + error.message);
        statusMsg.innerText = "❌ İşlem başarısız.";
    }
});

googleAuthBtn.addEventListener("click", async () => {
    statusMsg.innerText = "⏳ Google penceresi bekleniyor...";
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const userDocRef = doc(db, "users", result.user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
            await setDoc(userDocRef, {
                username: result.user.displayName || "Google Kullanıcısı",
                email: result.user.email,
                avatar: "😎",
                favGames: "",
                isAdmin: false
            });
        }
    } catch (error) {
        alert("Google Giriş Hatası: " + error.message);
        statusMsg.innerText = "❌ Google girişi başarısız.";
    }
});

forgotPasswordBtn.addEventListener("click", async () => {
    const email = authEmailInput.value.trim();
    if (!email) {
        alert("Lütfen önce e-posta adresinizi yazın!");
        return;
    }
    try {
        await sendPasswordResetEmail(auth, email);
        alert("Şifre sıfırlama bağlantısı e-postanıza gönderildi!");
    } catch (error) {
        alert("Hata: " + error.message);
    }
});

quickStartBtn.addEventListener("click", () => {
    isQuickStart = true;
    currentSelectedGroupId = null;
    authScreen.style.display = "none";
    setupScreen.style.display = "block";
    setupTitle.innerText = "Hızlı Oyun Kurulumu";
    setupAddArea.style.display = "flex";
    setupBackBtn.style.display = "block";
    players = [];
    updateList();
});

logoutBtn.addEventListener("click", () => {
    signOut(auth);
});

onAuthStateChanged(auth, async (user) => {
    if (user) {
        isQuickStart = false;
        authScreen.style.display = "none";
        dashboardScreen.style.display = "block";
        groupDetailScreen.style.display = "none";
        
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            currentUserData = userDoc.data();
            userAvatar.innerText = currentUserData.avatar || "👤";
            userWelcome.innerText = `Merhaba, ${currentUserData.username}!`;
            
            if (currentUserData.isAdmin) {
                userBadge.innerText = "⭐ Premium Üye";
                userBadge.style.background = "#f1c40f";
                // AKILLI ÖZELLİK: Zaten premium ise yükseltme butonunu gizle
                document.getElementById("upgrade-premium-btn").style.display = "none";
            } else {
                userBadge.innerText = "👤 Standart Üye";
                userBadge.style.background = "#7f8c8d";
                document.getElementById("upgrade-premium-btn").style.display = "block";
            }
        }
        statusMsg.innerText = "✅ Oturum Açık";
        await fetchGroups(); 
    } else {
        dashboardScreen.style.display = "none";
        groupDetailScreen.style.display = "none";
        setupScreen.style.display = "none";
        gameScreen.style.display = "none";
        endScreen.style.display = "none";
        summaryScreen.style.display = "none";
        authScreen.style.display = "block";
    }
});

// --- EKİP PANELİ VE LOBİ İŞLEMLERİ ---

createGroupBtn.addEventListener("click", async () => {
    if (!currentUserData || !currentUserData.isAdmin) {
        alert("🚨 Yetersiz Yetki! Premium üye olmalısınız.");
        return;
    }
    const groupName = newGroupNameInput.value.trim();
    if (!groupName) {
        alert("Lütfen ekibinize bir isim verin!");
        return;
    }
    try {
        await addDoc(collection(db, "groups"), {
            name: groupName,
            createdBy: auth.currentUser.uid,
            members: [],
            recentGames: []
        });
        newGroupNameInput.value = "";
        await fetchGroups();
    } catch (error) {
        alert("Grup kurulamadı: " + error.message);
    }
});

async function fetchGroups() {
    groupList.innerHTML = "";
    const querySnapshot = await getDocs(collection(db, "groups"));
    let count = 0;
    
    querySnapshot.forEach((docSnap) => {
        const group = docSnap.data();
        count++;
        const li = document.createElement("li");
        li.className = "group-item-box";
        li.innerHTML = `
            <div class="group-info-text">
                <strong>🏠 ${group.name}</strong>
                <div style="font-size:11px; color:#7f8c8d; margin-top:3px;">Toplam Oyuncu: ${group.members ? group.members.length : 0}</div>
            </div>
            <button class="group-play-btn" data-id="${docSnap.id}">Gruba Gir</button>
        `;
        groupList.appendChild(li);
    });
    
    document.querySelectorAll(".group-play-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            currentSelectedGroupId = e.target.getAttribute("data-id");
            showGroupDetails(currentSelectedGroupId);
        });
    });
    
    if (count === 0) {
        groupList.innerHTML = `<li style="font-style:italic; font-size:13px; color:#7f8c8d; background:none; border:none; text-align:center;">Henüz hiç grup kurulmamış.</li>`;
    }
}

async function showGroupDetails(groupId) {
    dashboardScreen.style.display = "none";
    groupDetailScreen.style.display = "block";
    statusMsg.innerText = "⏳ Grup kütüğü buluttan indiriliyor...";

    const groupDoc = await getDoc(doc(db, "groups", groupId));
    if (groupDoc.exists()) {
        currentGroupData = groupDoc.data();
        detailGroupName.innerText = `🏠 ${currentGroupData.name}`;

        // 1. Genel Puan Tablosu Çizimi
        detailLeaderboard.innerHTML = "";
        let members = currentGroupData.members || [];
        if (members.length === 0) {
            detailLeaderboard.innerHTML = `<div style="color:#7f8c8d; font-style:italic; font-size:13px; text-align:center; padding:5px;">Henüz bu grupta maç kaydı yok.</div>`;
        } else {
            let sortedMembers = [...members].sort((a, b) => (b.wins || 0) - (a.wins || 0));
            sortedMembers.forEach((m, idx) => {
                detailLeaderboard.innerHTML += `
                    <div class="leaderboard-row">
                        <span><strong>${idx + 1}.</strong> 👤 ${m.name}</span>
                        <span style="color:#1c7b64; font-weight:bold;">${m.wins || 0} Galibiyet</span>
                    </div>`;
            });
        }

        // 2. Son Oynanan 5 Oyun Çizimi
        detailRecentGames.innerHTML = "";
        let recentGames = currentGroupData.recentGames || [];
        if (recentGames.length === 0) {
            detailRecentGames.innerHTML = `<div style="color:#7f8c8d; font-style:italic; font-size:13px; text-align:center; padding:5px;">Yakın zamanda oynanmış oyun bulunmuyor.</div>`;
        } else {
            recentGames.forEach(game => {
                let scoresHTML = game.scores.map(s => `<span>${s.name}: <strong>${s.wins}</strong></span>`).join(' | ');
                detailRecentGames.innerHTML += `
                    <div class="recent-game-card">
                        <div class="recent-game-header">
                            <span>🎮 ${game.gameName}</span>
                            <span style="font-size:11px; font-weight:normal;">📅 ${game.date}</span>
                        </div>
                        <div class="recent-game-scores">${scoresHTML}</div>
                    </div>`;
            });
        }
        statusMsg.innerText = "✅ Grup verileri yüklendi.";
    }
}

detailBackBtn.addEventListener("click", () => {
    groupDetailScreen.style.display = "none";
    dashboardScreen.style.display = "block";
    fetchGroups();
});

detailStartMatchBtn.addEventListener("click", () => {
    groupDetailScreen.style.display = "none";
    setupScreen.style.display = "block";
    setupTitle.innerText = "Ekip Maç Kurulumu";
    setupAddArea.style.display = "flex";
    setupBackBtn.style.display = "block";
    
    players = [];
    if (currentGroupData && currentGroupData.members) {
        currentGroupData.members.forEach(m => {
            players.push({ name: m.name, wins: m.wins || 0, placements: m.placements || {} });
        });
    }
    updateList();
});

setupBackBtn.addEventListener("click", () => {
    setupScreen.style.display = "none";
    if (isQuickStart) {
        authScreen.style.display = "block";
    } else if (currentSelectedGroupId) {
        groupDetailScreen.style.display = "block";
    } else {
        dashboardScreen.style.display = "block";
    }
});

dashboardQuickBtn.addEventListener("click", () => {
    currentSelectedGroupId = null;
    currentGroupData = null;
    dashboardScreen.style.display = "none";
    setupScreen.style.display = "block";
    setupTitle.innerText = "Hızlı Oyun Kurulumu";
    setupAddArea.style.display = "flex";
    setupBackBtn.style.display = "block";
    players = [];
    updateList();
});

// --- ÇETELE MATEMATİK MOTORU ---

function autoConfigureGameSettings() {
    const game = gameTypeSelect.value;
    if (game === "pisti") {
        winConditionSelect.value = "high";
        targetScoreInput.value = "101";
    } else if (game === "okey") {
        winConditionSelect.value = "low";
        targetScoreInput.value = "";
    } else if (game === "101") {
        winConditionSelect.value = "high";
        targetScoreInput.value = "101";
    } else if (game === "batak") {
        winConditionSelect.value = "low";
        targetScoreInput.value = "11";
    } else if (game === "king") {
        winConditionSelect.value = "low";
        targetScoreInput.value = "";
    }
}

addPlayerBtn.addEventListener("click", () => {
    const name = playerNameInput.value.trim();
    if (name !== "") {
        players.push({ name: name, wins: 0, placements: {} });
        playerNameInput.value = "";
        updateList();
    }
});

function updateList() {
    playerList.innerHTML = ""; 
    players.forEach((player, index) => {
        const li = document.createElement("li");
        li.innerHTML = `<span>👤 <strong>${player.name}</strong></span> <button class="remove-btn" onclick="removePlayer(${index})">X</button>`;
        playerList.appendChild(li);
    });
    
    if (players.length >= 2) {
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
};

startMatchBtn.addEventListener("click", () => {
    setupScreen.style.display = "none";
    selectedGameName = gameTypeSelect.options[gameTypeSelect.selectedIndex].text;
    startParty();
});

function startParty() {
    gameScreen.style.display = "block";
    endScreen.style.display = "none";
    summaryScreen.style.display = "none";
    
    partyTitle.innerText = `${currentParty}. Parti Oynanıyor (${selectedGameName})`;
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
                if (score === winnerValue) {
                    colorStyle = "color: #1c7b64; font-weight: bold;";
                } else if (score === loserValue) {
                    colorStyle = "color: #e74c3c; font-weight: bold;";
                }
                return `${p.name}: <span style="${colorStyle}">${score}</span>`;
            });
            partyRow += playerStrings.join(', ');
            panelHTML += `<div>${partyRow}</div>`;
        });
        panelHTML += `</div>`;
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
            td.onclick = () => { addScoreToCell(rIndex, pIndex); };
            
            let html = playerScores.map(score => {
                let sign = score > 0 ? "+" : "";
                let colorClass = score >= 0 ? "positive" : "negative";
                return `<div class="score-val ${colorClass}">${sign}${score}</div>`;
            }).join('');
            
            if (html === "") {
                html = `<div class="add-score-hint">Puan Gir</div>`;
            }
            td.innerHTML = html;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    
    let totals = players.map(() => 0); 
    rounds.forEach(round => {
        round.forEach((playerScores, pIndex) => {
            playerScores.forEach(score => { totals[pIndex] += score; });
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
            let isRoundComplete = rounds[rIndex].every(playerScores => playerScores.length > 0);
            if (isRoundComplete) {
                checkAutoEnd(currentTotals);
            }
        } else {
            alert("Lütfen sadece rakam girin!");
        }
    }
};

document.getElementById("new-round-btn").addEventListener("click", () => {
    let totals = players.map(() => 0); 
    rounds.forEach(round => {
        round.forEach((playerScores, pIndex) => {
            playerScores.forEach(score => { totals[pIndex] += score; });
        });
    });
    if (checkAutoEnd(totals)) {
        return;
    }
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
                alert(`Hedef puana (${target}) ulaşıldı!`);
                endParty();
            }, 300);
            return true;
        }
    }
    return false;
}

manualEndBtn.addEventListener("click", () => {
    if (confirm("Bu partiyi bitirip sonuçları görmek istediğinize emin misiniz?")) {
        endParty();
    }
});

function endParty() {
    gameScreen.style.display = "none";
    endScreen.style.display = "block";
    
    let partyTotalsOrdered = players.map((p, i) => {
        let totalScore = 0;
        rounds.forEach(round => {
            if (round[i]) {
                round[i].forEach(score => { totalScore += score; });
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
    
    totals.forEach((player, index) => {
        let rank = index + 1;
        let playerObj = players[player.originalIndex];
        playerObj.placements[rank] = (playerObj.placements[rank] || 0) + 1;
    });
    players[totals[0].originalIndex].wins += 1;
    
    podium.innerHTML = "";
    totals.forEach((player, index) => {
        let rankClass = index === 0 ? "rank-1" : index === 1 ? "rank-2" : index === 2 ? "rank-3" : "";
        let medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
        let colorClass = player.score < 0 ? "negative" : "positive";
        podium.innerHTML += `<div class="podium-item ${rankClass}"><span><span class="rank-badge">${medal}</span> ${player.name}</span><span class="score-val ${colorClass}">${player.score}</span></div>`;
    });
    
    seriesScoreList.innerHTML = "";
    players.forEach(p => {
        seriesScoreList.innerHTML += `<div style="background: #ffffff; padding: 5px 15px; border-radius: 8px; font-weight: bold; border: 1px solid #bdc3c7;">${p.name}: <span style="color: #2980b9; font-size: 18px;">${p.wins}</span></div>`;
    });
    
    if (typeof confetti === "function") {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
}

nextPartyBtn.addEventListener("click", () => {
    currentParty += 1;
    startParty();
});

endCompletelyBtn.addEventListener("click", async () => {
    if (confirm("Turnuvayı bitirip istatistikleri rapora işlemek istiyor musunuz?")) {
        endScreen.style.display = "none";
        summaryScreen.style.display = "block";
        
        const statType = statTypeSelect.value;
        let playedPartyCount = pastParties.length;
        let totalGamesCount = statType === "per-party" ? playedPartyCount : (playedPartyCount > 0 ? 1 : 0);
        gameCountInfo.innerText = `🎮 Toplam Değerlendirilen ${selectedGameName} Oyunu Sayısı: ${totalGamesCount}`;
        
        if (currentSelectedGroupId && currentGroupData) {
            statusMsg.innerText = "⏳ Maç özeti ve son oynanan oyunlar buluta yazılıyor...";
            try {
                const groupRef = doc(db, "groups", currentSelectedGroupId);
                
                let matchSummary = {
                    gameName: selectedGameName,
                    date: new Date().toLocaleDateString('tr-TR'),
                    scores: players.map(p => ({ name: p.name, wins: p.wins }))
                };

                let updatedRecentGames = currentGroupData.recentGames || [];
                updatedRecentGames.unshift(matchSummary);
                if (updatedRecentGames.length > 5) {
                    updatedRecentGames = updatedRecentGames.slice(0, 5);
                }

                await updateDoc(groupRef, {
                    members: players,
                    recentGames: updatedRecentGames
                });
                statusMsg.innerText = "✅ İstatistikler ve Son 5 Oyun buluta işlendi!";
            } catch (err) {
                console.log("Bulut kayıt hatası: ", err);
            }
        }

        summaryList.innerHTML = "";
        players.forEach(p => {
            let placementBadges = [];
            for (let i = 1; i <= players.length; i++) {
                let count = p.placements[i] || 0;
                if (count > 0) {
                    placementBadges.push(`<span style="background: #eaf2f8; color: #2980b9; padding: 4px 10px; border-radius: 6px; border: 1px solid #d4e6f1; font-size: 13px; font-weight: bold;">${i}.lik: ${count} Kez</span>`);
                }
            }
            summaryList.innerHTML += `<div style="background: #ffffff; border: 1px solid #dee2e6; padding: 15px; border-radius: 12px; text-align: left; box-shadow: 0 2px 5px rgba(0,0,0,0.02);"><strong style="color: #1c7b64; font-size: 16px; display: block; margin-bottom: 8px;">👤 ${p.name}</strong><div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px;">${placementBadges.join('')}</div><div style="font-size: 13px; color: #7f8c8d; font-weight: 500;">🏆 Bu Turnuvadaki Toplam Parti Galibiyeti: ${p.wins}</div></div>`;
        });
    }
});

// --- YENİ EKLENEN: PROFİL YÖNETİMİ, ŞİFRE DEĞİŞTİRME VE PREMIUM LİSANS MOTORU ---

const updateProfileBtn = document.getElementById("update-profile-btn");
const updatePasswordBtn = document.getElementById("update-password-btn");
const upgradePremiumBtn = document.getElementById("upgrade-premium-btn");
const deleteAccountBtn = document.getElementById("delete-account-btn");

// 1. Profil Bilgilerini Güncelleme (İsim ve Seçmeli Avatar)
updateProfileBtn.addEventListener("click", async () => {
    const newUsername = document.getElementById("edit-username").value.trim();
    const newAvatar = document.getElementById("edit-avatar").value; // Select elementinden gelen değer
    
    if (!auth.currentUser) return;

    try {
        statusMsg.innerText = "⏳ Profil kütüğü güncelleniyor...";
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
            username: newUsername || currentUserData.username,
            avatar: newAvatar || currentUserData.avatar
        });
        alert("Profiliniz başarıyla güncellendi! Değişiklikleri görmek için sayfa yenilenecektir.");
        location.reload(); 
    } catch (error) {
        alert("Güncelleme hatası: " + error.message);
    }
});

// 2. Canlı Şifre Güncelleme Motoru (Firebase Auth tabanlı)
updatePasswordBtn.addEventListener("click", async () => {
    const newPassword = document.getElementById("edit-password").value.trim();
    
    if (!newPassword) {
        alert("Lütfen yeni bir şifre yazın!");
        return;
    }
    if (newPassword.length < 6) {
        alert("Güvenliğiniz için şifre en az 6 karakter olmalıdır!");
        return;
    }
    if (!auth.currentUser) return;

    try {
        statusMsg.innerText = "⏳ Şifre güvenliği senkronize ediliyor...";
        await updatePassword(auth.currentUser, newPassword);
        alert("Şifreniz başarıyla değiştirildi! Bir sonraki girişinizde yeni şifrenizi kullanabilirsiniz.");
        document.getElementById("edit-password").value = "";
        statusMsg.innerText = "✅ Şifre güncellendi.";
    } catch (error) {
        // Güvenlik notu: Firebase, uzun süredir açık olan oturumlarda şifre değişimine izin vermez, re-auth ister.
        if (error.code === "auth/requires-recent-login") {
            alert("Güvenlik nedeniyle bu işlemi yapmadan önce oturumu kapatıp tekrar giriş yapmanız gerekmektedir.");
        } else {
            alert("Şifre değiştirme hatası: " + error.message);
        }
        statusMsg.innerText = "❌ Şifre güncellenemedi.";
    }
});

// 3. Tek Tıkla Premium Lisansa Yükselme Sistemi
upgradePremiumBtn.addEventListener("click", async () => {
    if (!auth.currentUser) return;
    if (confirm("Kendi ekiplerinizi / gruplarınızı kurma yetkisini açmak ve Premium Üye statüsüne yükselmek istiyor musunuz?")) {
        try {
            statusMsg.innerText = "⏳ Premium abonelik tanımlanıyor...";
            await updateDoc(doc(db, "users", auth.currentUser.uid), {
                isAdmin: true // Veritabanında isAdmin alanı true yapılarak Premium kilitleri açılır
            });
            alert("🎉 Tebrikler! Başarıyla Premium Üye statüsüne yükseldiniz. Tüm kilitler açıldı!");
            location.reload();
        } catch (error) {
            alert("Abonelik hatası: " + error.message);
        }
    }
});

// 4. Hesap Kalıcı Olarak Kökten Silme
deleteAccountBtn.addEventListener("click", async () => {
    if (!confirm("⚠️ TEHLİKELİ ALAN!\nHesabınızı sildiğinizde ömür boyu turnuva geçmişiniz ve profil kaydınız kalıcı olarak silinecektir. Bu işlemi geri alamazsınız. Emin misiniz?")) return;

    try {
        statusMsg.innerText = "⏳ Hesap verileri imha ediliyor...";
        const user = auth.currentUser;
        await deleteDoc(doc(db, "users", user.uid)); 
        await user.delete(); 
        alert("Hesabınız ve tüm verileriniz başarıyla sistemden silindi. Güle güle!");
        location.reload(); 
    } catch (error) {
        alert("Hesap silme hatası: " + error.message);
        statusMsg.innerText = "❌ İmha başarısız.";
    }
});

finalRestartBtn.addEventListener("click", () => {
    currentParty = 1;
    pastParties = [];
    rounds = [];
    players = [];
    if (auth.currentUser) {
        summaryScreen.style.display = "none";
        dashboardScreen.style.display = "block";
        fetchGroups();
    } else {
        location.reload();
    }
});