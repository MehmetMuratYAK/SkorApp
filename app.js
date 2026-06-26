import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, getDoc, setDoc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup, updatePassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// FIREBASE YAPILANDIRMASI
const firebaseConfig = {
  apiKey: "AIzaSyA963gL6nAee0JZ1lW5Utbfz4UL9n8VFdg", 
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
let allSystemUsers = []; 

let players = []; 
let rounds = []; 
let pastParties = []; 
let currentParty = 1;
let selectedGameName = "";
let historyPartyRounds = []; 
let activeGroupListener = null; 

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
const leaveGroupBtn = document.getElementById("leave-group-btn");
const liveMatchJoinBtn = document.getElementById("live-match-join-btn");

const invitePlayerSearch = document.getElementById("invite-player-search");
const inviteSearchResults = document.getElementById("invite-search-results");

const setupScreen = document.getElementById("setup-screen");
const setupTitle = document.getElementById("setup-title");
const setupAddArea = document.getElementById("setup-add-area");
const setupBackBtn = document.getElementById("setup-back-btn");
const playerList = document.getElementById("player-list");
const addPlayerBtn = document.getElementById("add-player-btn");
const gameSettingsArea = document.getElementById("game-settings-area");
const startMatchBtn = document.getElementById("start-match-btn");

const playerInputWrapper = document.getElementById("player-input-wrapper");
const gameModeSelect = document.getElementById("game-mode");

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

const leaderboardGameSelect = document.getElementById("leaderboard-game-select");
const leaderboardModeSelect = document.getElementById("leaderboard-mode-select");
const archiveFilterGame = document.getElementById("archive-filter-game");
const archiveFilterMode = document.getElementById("archive-filter-mode");

const archiveFilterStartDate = document.getElementById("archive-filter-start-date");
const archiveFilterEndDate = document.getElementById("archive-filter-end-date");

const matchDetailsModal = document.getElementById("match-details-modal");
const modalMatchTitle = document.getElementById("modal-match-title");
const modalMatchContent = document.getElementById("modal-match-content");
const modalCloseBtn = document.getElementById("modal-close-btn");

const hamburgerBtn = document.getElementById("hamburger-btn");
const closeMenuBtn = document.getElementById("close-menu-btn");
const sideMenuPanel = document.getElementById("side-menu-panel");

const exitGameBtn = document.getElementById("exit-game-btn");
const scoreInputModal = document.getElementById("score-input-modal");
const scoreModalTitle = document.getElementById("score-modal-title");
const modalScoreInput = document.getElementById("modal-score-input");

const modalScoreConfirm = document.getElementById("modal-score-confirm");
const modalScoreToggleSign = document.getElementById("modal-score-toggle-sign");

const startScoreInput = document.getElementById("start-score");
const nextPartyModal = document.getElementById("next-party-modal");
const modalNextTarget = document.getElementById("modal-next-target");
const modalNextStart = document.getElementById("modal-next-start");
const modalNextConfirm = document.getElementById("modal-next-confirm");

hamburgerBtn.addEventListener("click", () => { sideMenuPanel.classList.add("open"); });
closeMenuBtn.addEventListener("click", () => { sideMenuPanel.classList.remove("open"); });
modalCloseBtn.addEventListener("click", () => { matchDetailsModal.style.display = "none"; });
gameModeSelect.addEventListener("change", updatePlayerInputComponent);

// --- GİRİŞ / KAYIT EKRANI İŞLEMLERİ ---

toggleAuthBtn.addEventListener("click", () => {
    isLoginMode = !isLoginMode;
    if (isLoginMode) {
        authTitle.innerText = "Giriş Yap"; authPrimaryBtn.innerText = "Giriş Yap"; toggleAuthBtn.innerText = "Hesabın yok mu? Kayıt Ol"; authUsernameInput.style.display = "none"; registerExtraFields.style.display = "none";
    } else {
        authTitle.innerText = "Kayıt Ol"; authPrimaryBtn.innerText = "Hesap Oluştur"; toggleAuthBtn.innerText = "Zaten üye misin? Giriş Yap"; authUsernameInput.style.display = "block"; registerExtraFields.style.display = "block";
    }
});

authPrimaryBtn.addEventListener("click", async () => {
    const email = authEmailInput.value.trim();
    const password = authPasswordInput.value.trim();
    if (!email || !password) { alert("Lütfen gerekli alanları doldurun!"); return; }
    try {
        if (isLoginMode) {
            statusMsg.innerText = "⏳ Oturum açılıyor..."; await signInWithEmailAndPassword(auth, email, password);
        } else {
            const username = authUsernameInput.value.trim();
            if (!username) { alert("Kullanıcı adı şarttır!"); return; }
            statusMsg.innerText = "⏳ Hesap oluşturuluyor...";
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(db, "users", userCredential.user.uid), {
                username: username, email: email, avatar: authAvatarInput.value.trim() || "👤", favGames: authFavGamesInput.value.trim() || "", isAdmin: false
            });
            alert("Hesabınız oluşturuldu!");
        }
    } catch (error) { alert("Hata: " + error.message); statusMsg.innerText = "❌ İşlem başarısız."; }
});

googleAuthBtn.addEventListener("click", async () => {
    statusMsg.innerText = "⏳ Google penceresi bekleniyor...";
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const userDocRef = doc(db, "users", result.user.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
            await setDoc(userDocRef, {
                username: result.user.displayName || "Google Kullanıcısı", email: result.user.email, avatar: "😎", favGames: "", isAdmin: false
            });
        }
    } catch (error) { alert("Google Giriş Hatası: " + error.message); statusMsg.innerText = "❌ Google girişi başarısız."; }
});

dashboardQuickBtn.addEventListener("click", () => {
    isQuickStart = true; 
    currentSelectedGroupId = null; 
    dashboardScreen.style.display = "none"; 
    setupScreen.style.display = "block"; 
    setupTitle.innerText = "Hızlı Oyun Kurulumu"; 
    setupAddArea.style.display = "flex"; 
    setupBackBtn.style.display = "block"; 
    players = []; 
    gameModeSelect.value = "tekli"; 
    updatePlayerInputComponent(); 
    updateList();
});

setupBackBtn.addEventListener("click", () => {
    setupScreen.style.display = "none";
    if (isQuickStart) {
        if (auth.currentUser) {
            dashboardScreen.style.display = "block";
        } else {
            authScreen.style.display = "block";
        }
    } else if (currentSelectedGroupId) {
        groupDetailScreen.style.display = "block";
    } else {
        dashboardScreen.style.display = "block";
    }
});

exitGameBtn.addEventListener("click", () => {
    if (confirm("Oyundan kaydetmeden çıkmak istediğinize emin misiniz? Tüm mevcut el skorları silinecektir!")) {
        if (currentSelectedGroupId) { const groupRef = doc(db, "groups", currentSelectedGroupId); updateDoc(groupRef, { activeMatchRaw: null }); }
        gameScreen.style.display = "none";
        currentParty = 1;
        pastParties = [];
        rounds = [];
        players = [];
        historyPartyRounds = [];
        
        if (currentSelectedGroupId) {
            showGroupDetails(currentSelectedGroupId);
        } else {
            dashboardScreen.style.display = "block";
            fetchGroups();
        }
    }
});

forgotPasswordBtn.addEventListener("click", async () => {
    const email = authEmailInput.value.trim(); if (!email) { alert("Lütfen önce e-posta adresinizi yazın!"); return; }
    try { await sendPasswordResetEmail(auth, email); alert("Şifre sıfırlama bağlantısı e-postanıza gönderildi!"); } catch (error) { alert("Hata: " + error.message); }
});

quickStartBtn.addEventListener("click", () => {
    isQuickStart = true; currentSelectedGroupId = null; authScreen.style.display = "none"; setupScreen.style.display = "block"; setupTitle.innerText = "Hızlı Oyun Kurulumu"; setupAddArea.style.display = "flex"; setupBackBtn.style.display = "block"; players = []; 
    gameModeSelect.value = "tekli"; updatePlayerInputComponent(); updateList();
});

logoutBtn.addEventListener("click", () => { sideMenuPanel.classList.remove("open"); signOut(auth); });

onAuthStateChanged(auth, async (user) => {
    if (user) {
        isQuickStart = false; authScreen.style.display = "none"; dashboardScreen.style.display = "block"; groupDetailScreen.style.display = "none"; sideMenuPanel.classList.remove("open");
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            currentUserData = userDoc.data(); userAvatar.innerText = currentUserData.avatar || "👤"; userWelcome.innerText = `Merhaba, ${currentUserData.username}!`;
            if (currentUserData.isAdmin) {
                userBadge.innerText = "⭐ Premium Üye"; userBadge.style.background = "#f1c40f"; document.getElementById("upgrade-premium-btn").style.display = "none";
            } else {
                userBadge.innerText = "👤 Standart Üye"; userBadge.style.background = "#7f8c8d"; document.getElementById("upgrade-premium-btn").style.display = "block";
            }
        }
        statusMsg.innerText = "✅ Sistem Hazır"; 
        await loadAllSystemUsers(); 
        await fetchGroups(); 
    } else {
        dashboardScreen.style.display = "none"; groupDetailScreen.style.display = "none"; setupScreen.style.display = "none"; gameScreen.style.display = "none"; endScreen.style.display = "none"; summaryScreen.style.display = "none"; authScreen.style.display = "block";
    }
});

async function loadAllSystemUsers() {
    try {
        allSystemUsers = [];
        const snapshot = await getDocs(collection(db, "users"));
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            if (data.username && data.email) { allSystemUsers.push({ username: data.username, email: data.email }); }
        });
        allSystemUsers.sort((a, b) => a.username.localeCompare(b.username, 'tr'));
    } catch (e) { console.log(e); }
}

invitePlayerSearch.addEventListener("input", () => {
    const query = invitePlayerSearch.value.trim().toLowerCase(); inviteSearchResults.innerHTML = "";
    if (!query) { inviteSearchResults.style.display = "none"; return; }
    const filtered = allSystemUsers.filter(u => u.username.toLowerCase().includes(query));
    if (filtered.length > 0) {
        filtered.forEach(u => {
            const li = document.createElement("li"); li.style.padding = "10px 15px"; li.style.cursor = "pointer"; li.style.borderBottom = "1px solid #f1f3f5"; li.style.fontWeight = "500"; li.innerHTML = `👤 ${u.username}`;
            li.onmouseover = () => li.style.background = "#f8f9fa"; li.onmouseout = () => li.style.background = "white";
            li.addEventListener("click", async () => { invitePlayerSearch.value = ""; inviteSearchResults.style.display = "none"; await addPlayerToGroup(u.username, u.email); });
            inviteSearchResults.appendChild(li);
        });
        inviteSearchResults.style.display = "block";
    } else {
        const li = document.createElement("li"); li.style.padding = "10px 15px"; li.style.color = "#7f8c8d"; li.style.fontStyle = "italic"; li.innerText = "Eşleşen oyuncu bulunamadı..."; inviteSearchResults.appendChild(li); inviteSearchResults.style.display = "block";
    }
});

async function addPlayerToGroup(username, email) {
    if (!currentSelectedGroupId || !currentGroupData) return;
    let currentEmails = currentGroupData.memberEmails || [];
    
    if (currentEmails.includes(email)) { alert(`🚨 ${username} zaten bu gruba aktif olarak ekli!`); return; }
    
    statusMsg.innerText = "⏳ Oyuncu ekibe dahil ediliyor..."; 
    currentEmails.push(email);
    
    let currentMembers = currentGroupData.members || []; 
    let isUserAlreadyExists = currentMembers.some(m => m.name === username);
    
    if (!isUserAlreadyExists) {
        currentMembers.push({ name: username, wins: 0, placements: {} });
    }
    
    try {
        const groupRef = doc(db, "groups", currentSelectedGroupId);
        await updateDoc(groupRef, { memberEmails: currentEmails, members: currentMembers });
        alert(`🎉 ${username} başarıyla ekibe dahil edildi!`); 
        await showGroupDetails(currentSelectedGroupId);
    } catch (error) { alert("Oyuncu ekleme hatası: " + error.message); }
}

// --- EKİP PANELİ VE LOBİ İŞLEMLERİ ---

createGroupBtn.addEventListener("click", async () => {
    if (!currentUserData || !currentUserData.isAdmin) { alert("🚨 Yetersiz Yetki! Premium üye olmalısınız."); return; }
    const groupName = newGroupNameInput.value.trim(); if (!groupName) { alert("Lütfen ekibinize bir isim verin!"); return; }
    try {
        statusMsg.innerText = "⏳ Ekip oluşturuluyor...";
        await addDoc(collection(db, "groups"), {
            name: groupName, createdBy: auth.currentUser.uid, memberEmails: [auth.currentUser.email], members: [{ name: currentUserData.username, wins: 0, placements: {} }], recentGames: []
        });
        newGroupNameInput.value = ""; await fetchGroups();
    } catch (error) { alert("Grup kurulamadı: " + error.message); }
});

async function fetchGroups() {
    groupList.innerHTML = ""; 
    const querySnapshot = await getDocs(collection(db, "groups")); 
    let count = 0;
    
    querySnapshot.forEach((docSnap) => {
        const group = docSnap.data(); 
        const emails = group.memberEmails || [];
        
        if (emails.includes(auth.currentUser.email)) {
            count++; 
            const li = document.createElement("li"); 
            li.className = "group-item-box";
            li.setAttribute("data-id", docSnap.id);
            li.style.cursor = "pointer"; 
            li.innerHTML = `
                <div class="group-info-text" style="width: 100%;">
                    <strong>🏠 ${group.name}</strong>
                    <div style="font-size:11px; color:#7f8c8d; margin-top:3px;">Toplam Oyuncu: ${group.members ? group.members.length : 0}</div>
                </div>`;
            groupList.appendChild(li);
        }
    });
    
    document.querySelectorAll(".group-item-box").forEach(item => {
        item.addEventListener("click", () => { 
            currentSelectedGroupId = item.getAttribute("data-id"); 
            showGroupDetails(currentSelectedGroupId); 
        });
    });
    
    if (count === 0) { 
        groupList.innerHTML = `<li style="font-style:italic; font-size:13px; color:#7f8c8d; background:none; border:none; text-align:center;">Henüz üye olduğunuz bir grup bulunmuyor.</li>`; 
    }
}

async function showGroupDetails(groupId) {
    dashboardScreen.style.display = "none"; 
    groupDetailScreen.style.display = "block";
    invitePlayerSearch.value = ""; 
    inviteSearchResults.style.display = "none";
    
    archiveFilterStartDate.value = "";
    archiveFilterEndDate.value = "";

    if (activeGroupListener) activeGroupListener();

    statusMsg.innerText = "⏳ Canlı grup verileri eşitleniyor...";

    activeGroupListener = onSnapshot(doc(db, "groups", groupId), (groupDoc) => {
        if (groupDoc.exists()) {
            currentGroupData = groupDoc.data(); 
            detailGroupName.innerText = `🏠 ${currentGroupData.name}`;

            if (currentUserData && currentUserData.isAdmin) {
                detailStartMatchBtn.style.display = "block"; 
                document.getElementById("premium-match-notice").style.display = "none"; 
                document.getElementById("group-invite-area").style.display = "block"; 
            } else {
                detailStartMatchBtn.style.display = "none"; 
                document.getElementById("premium-match-notice").style.display = "block"; 
                document.getElementById("group-invite-area").style.display = "none"; 
            }

            // 🔒 EMNİYET KİLİDİ: Canlı maç düz metin yedeği var mı kontrol et
            const liveBtn = document.getElementById("live-match-join-btn");
            if (liveBtn) {
                if (currentGroupData.activeMatchRaw) { // activeMatch yerine activeMatchRaw bakıyoruz
                    liveBtn.style.display = "block";
                } else {
                    liveBtn.style.display = "none";
                }
            }

            calculateAndRenderLeaderboard();
            renderFilteredArchive();
            
            statusMsg.innerText = "✅ Veriler anlık olarak güncel.";
        }
    });
}

function calculateAndRenderLeaderboard() {
    const targetGame = leaderboardGameSelect.value;
    const targetMode = leaderboardModeSelect.value;
    const thead = document.getElementById("leaderboard-thead");
    const tbody = document.getElementById("detail-leaderboard");

    tbody.innerHTML = "";
    
    let statsMap = {};
    currentGroupData.members.forEach(m => {
        statsMap[m.name] = { name: m.name, p1: 0, p2: 0, p3: 0, p4: 0, wins: 0, losses: 0, hasPlayed: false };
    });

    const matchHistory = currentGroupData.recentGames || [];
    matchHistory.forEach(game => {
        if (game.gameType === targetGame && game.gameMode === targetMode) {
            if (targetMode === "esli") {
                if (game.partyScores && game.partyScores.length > 0) {
                    let sortedParty = [...game.partyScores].sort((a,b) => b.wins - a.wins);
                    let maxWins = sortedParty[0].wins;
                    game.partyScores.forEach(pScore => {
                        let individualNames = pScore.name.includes(" & ") ? pScore.name.split(" & ") : [pScore.name];
                        individualNames.forEach(singleName => {
                            if (!statsMap[singleName]) statsMap[singleName] = { name: singleName, p1: 0, p2: 0, p3: 0, p4: 0, wins: 0, losses: 0, hasPlayed: true };
                            statsMap[singleName].hasPlayed = true;
                            if (pScore.wins === maxWins) { statsMap[singleName].wins += 1; } 
                            else { statsMap[singleName].losses += 1; }
                        });
                    });
                }
            } 
            else {
                if (game.partyScores && game.partyScores.length > 0) {
                    let matchPlayers = [];
                    
                    if (game.partyRoundDetails && game.partyRoundDetails.length > 0) {
                        let summary = {};
                        game.partyRoundDetails.forEach(party => {
                            party.playerNames.forEach((name, pIdx) => {
                                if (!summary[name]) summary[name] = { name: name, score: 0, wins: 0 };
                                summary[name].score += party.finalTotals[pIdx];
                            });
                        });
                        game.partyScores.forEach(ps => {
                            if (summary[ps.name]) summary[ps.name].wins = ps.wins || 0;
                            else summary[ps.name] = { name: ps.name, score: 0, wins: ps.wins || 0 };
                        });
                        matchPlayers = Object.values(summary);
                    } else {
                        matchPlayers = game.partyScores.map(ps => ({ name: ps.name, score: 0, wins: ps.wins || 0 }));
                    }

                    let isLowWins = (game.gameType === "okey" || game.gameType === "batak" || game.isCountdown === true);
                    
                    if (!game.hasOwnProperty('isCountdown') && matchPlayers.length > 0) {
                        const scores = matchPlayers.map(p => p.score);
                        if (Math.min(...scores) < 0) isLowWins = true;
                    }

                    matchPlayers.sort((a, b) => {
                        if (b.wins !== a.wins) return b.wins - a.wins;
                        return isLowWins ? (a.score - b.score) : (b.score - a.score);
                    });

                    matchPlayers.forEach((pScore, index) => {
                        let singleName = pScore.name;
                        if (!statsMap[singleName]) statsMap[singleName] = { name: singleName, p1: 0, p2: 0, p3: 0, p4: 0, wins: 0, losses: 0, hasPlayed: true };
                        statsMap[singleName].hasPlayed = true;
                        
                        let rank = index + 1;
                        if (rank === 1) statsMap[singleName].p1 += 1;
                        if (rank === 2) statsMap[singleName].p2 += 1;
                        if (rank === 3) statsMap[singleName].p3 += 1;
                        if (rank === 4) statsMap[singleName].p4 += 1;
                    });
                }
            }
        }
    });

    let statsArray = Object.values(statsMap);

    if (targetMode === "tekli") {
        thead.innerHTML = `<tr><th style="padding:12px; text-align:left;">Oyuncu</th><th style="width:60px; text-align:center;">1</th><th style="width:60px; text-align:center;">2</th><th style="width:60px; text-align:center;">3</th><th style="width:60px; text-align:center;">4</th></tr>`;
        statsArray.sort((a, b) => b.p1 - a.p1 || b.p2 - a.p2 || b.p3 - a.p3 || b.p4 - a.p4);
        
        statsArray.forEach(row => {
            tbody.innerHTML += `
                <tr style="border-bottom: 1px solid #dee2e6; background: ${row.hasPlayed ? '#ffffff' : '#fdfefe'}; opacity: ${row.hasPlayed ? '1' : '0.6'}">
                    <td style="padding:12px; text-align:left; font-weight:bold;">👤 ${row.name}</td>
                    <td style="width:60px; text-align:center; color:#1c7b64; font-weight:bold;">${row.p1}</td>
                    <td style="width:60px; text-align:center;">${row.p2}</td>
                    <td style="text-align:center;">${row.p3}</td>
                    <td style="width:60px; text-align:center; color:#e74c3c;">${row.p4}</td>
                </tr>`;
        });
    } 
    else {
        thead.innerHTML = `<tr><th style="padding:12px; text-align:left;">Oyuncu</th><th style="width:100px; text-align:center; color:#1c7b64;">Galibiyet</th><th style="width:100px; text-align:center; color:#e74c3c;">Mağlubiyet</th></tr>`;
        statsArray.sort((a, b) => b.wins - a.wins || a.losses - b.losses);

        statsArray.forEach(row => {
            tbody.innerHTML += `
                <tr style="border-bottom: 1px solid #dee2e6; background: ${row.hasPlayed ? '#ffffff' : '#fdfefe'}; opacity: ${row.hasPlayed ? '1' : '0.6'}">
                    <td style="padding:12px; text-align:left; font-weight:bold;">👤 ${row.name}</td>
                    <td style="width:100px; text-align:center; color:#1c7b64; font-weight:bold;">${row.wins} Maç</td>
                    <td style="width:100px; text-align:center; color:#e74c3c; font-weight:bold;">${row.losses} Maç</td>
                </tr>`;
        });
    }
}

function renderFilteredArchive() {
    const gameFilter = archiveFilterGame.value;
    const modeFilter = archiveFilterMode.value;
    const startDateVal = archiveFilterStartDate.value; 
    const endDateVal = archiveFilterEndDate.value; 

    const container = document.getElementById("detail-recent-games");
    container.innerHTML = "";

    const matchHistory = currentGroupData.recentGames || [];
    let count = 0;

    matchHistory.forEach((game) => {
        const matchGameType = game.gameType || "okey";
        const matchGameMode = game.gameMode || "tekli";

        if (gameFilter !== "all" && matchGameType !== gameFilter) return;
        if (modeFilter !== "all" && matchGameMode !== modeFilter) return;

        if (game.date) {
            const dateParts = game.date.split('.');
            if (dateParts.length === 3) {
                const gameDateObj = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
                gameDateObj.setHours(0,0,0,0);

                if (startDateVal) {
                    const startObj = new Date(startDateVal);
                    startObj.setHours(0,0,0,0);
                    if (gameDateObj < startObj) return;
                }
                if (endDateVal) {
                    const endObj = new Date(endDateVal);
                    endObj.setHours(0,0,0,0);
                    if (gameDateObj > endObj) return;
                }
            }
        }

        count++;
        
        let playerNames = [];
        if (game.partyRoundDetails && game.partyRoundDetails.length > 0) {
            playerNames = game.partyRoundDetails[0].playerNames;
        } else if (game.partyScores) {
            playerNames = game.partyScores.map(s => s.name);
        }

        let tableHTML = `<div class="table-responsive" style="margin-top: 10px; margin-bottom: 0; border-radius: 8px;"><table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: center; background: white;">`;
        tableHTML += `<thead style="background: #32546d; color: white;"><tr><th style="padding: 6px; text-align: left; font-size:11px;">Parti / Mod</th>`;
        playerNames.forEach(name => {
            tableHTML += `<th style="padding: 6px;">${name}</th>`;
        });
        tableHTML += `</tr></thead><tbody>`;

        if (game.partyRoundDetails && game.partyRoundDetails.length > 0) {
            if (game.partyRoundDetails.length === 1) {
                tableHTML += `<tr><td style="padding: 6px; border: 1px solid #dee2e6; text-align: left; font-weight: bold; color:#2c4d61;">Toplam Puan</td>`;
                game.partyRoundDetails[0].finalTotals.forEach(pts => {
                    let sign = pts > 0 ? "+" : "";
                    let color = pts >= 0 ? "#1c7b64" : "#e74c3c";
                    tableHTML += `<td style="padding: 6px; border: 1px solid #dee2e6; font-weight: bold; color: ${color};">${sign}${pts}</td>`;
                });
                tableHTML += `</tr>`;
            } else {
                game.partyRoundDetails.forEach((party, pIdx) => {
                    tableHTML += `<tr><td style="padding: 6px; border: 1px solid #dee2e6; text-align: left; font-weight: 500; color:#555;">${pIdx + 1}. Parti</td>`;
                    party.finalTotals.forEach((pts) => {
                        let sign = pts > 0 ? "+" : "";
                        let color = pts >= 0 ? "#333" : "#e74c3c";
                        tableHTML += `<td style="padding: 6px; border: 1px solid #dee2e6; color: ${color};">${sign}${pts}</td>`;
                    });
                    tableHTML += `</tr>`;
                });
            }
        }

        if (game.partyScores && game.partyScores.length > 0) {
            tableHTML += `<tr style="background: #f8f9fa; font-weight: 500;"><td style="padding: 6px; border: 1px solid #dee2e6; text-align: left; color: #7f8c8d;">Parti Galibiyet</td>`;
            playerNames.forEach(name => {
                let pScore = game.partyScores.find(s => s.name === name);
                let wins = pScore ? pScore.wins : 0;
                tableHTML += `<td style="padding: 6px; border: 1px solid #dee2e6; color: #32546d;">${wins}</td>`;
            });
            tableHTML += `</tr>`;
        }

        tableHTML += `</tbody></table></div>`;
        
        const card = document.createElement("div");
        card.className = "recent-game-card";
        card.style.cursor = "pointer";
        card.style.transition = "0.2s";
        card.title = "Tüm el puan detaylarını görmek için tıkla!";
        card.innerHTML = `
            <div class="recent-game-header">
                <span>🎮 ${game.gameName} (${matchGameMode === 'esli' ? 'Eşli' : 'Tekli'})</span>
                <span style="font-size:11px; font-weight:normal; color:#1c7b64;">📅 ${game.date || '-'} 🔍 İncele</span>
            </div>
            <div class="recent-game-scores" style="display:block; color:#333; padding:0;">${tableHTML}</div>
        `;

        card.addEventListener("click", () => { showExactHandDetailsModal(game); });
        container.appendChild(card);
    });

    if (count === 0) {
        container.innerHTML = `<div style="color:#7f8c8d; font-style:italic; font-size:13px; text-align:center; padding:10px;">Geçmiş oyun kaydı bulunamadı.</div>`;
    }
}

function showExactHandDetailsModal(gameData) {
    modalMatchTitle.innerText = `📊 ${gameData.gameName} - El Skor Geçmişi`;
    let modalHTML = `<div style="font-size:13px; color:#7f8c8d; margin-bottom:10px;"><strong>Tarih:</strong> ${gameData.date || '-'} | <strong>Mod:</strong> ${gameData.gameMode === 'esli' ? 'Eşli (2 Takım)' : 'Tekli'}</div>`;
    
    const gameParties = gameData.partyRoundDetails || [];
    
    if (!gameParties || gameParties.length === 0) {
        modalHTML += `<div style="text-align:center; font-style:italic; color:#7f8c8d; padding:15px;">Bu maça ait el detay puan verisi bulunmuyor.</div>`;
    } else {
        gameParties.forEach((partyObj, pIdx) => {
            modalHTML += `<div style="margin-top:15px; border-top:2px solid #32546d; padding-top:10px;">
                            <strong style="color:#32546d; display:block; margin-bottom:5px;">📌 ${pIdx + 1}. Parti Puan Çetelesi</strong>`;
            
            modalHTML += `<div class="table-responsive"><table style="width:100%; border-collapse:collapse; text-align:center; font-size:13px;">
                            <thead style="background:#f1f3f5; font-weight:bold;">
                                <tr><th style="padding:6px; border:1px solid #dee2e6;">Eller</th>`;
            
            partyObj.playerNames.forEach(name => {
                modalHTML += `<th style="padding:6px; border:1px solid #dee2e6;">${name}</th>`;
            });
            modalHTML += `</tr></thead><tbody>`;

            if (partyObj.handRounds && partyObj.handRounds.length > 0) {
                partyObj.handRounds.forEach((roundObj, hIdx) => {
                    modalHTML += `<tr><td style="padding:6px; border:1px solid #dee2e6; font-weight:bold;">${hIdx + 1}. El</td>`;
                    partyObj.playerNames.forEach(name => {
                        let scoresArray = roundObj[name] || [];
                        let cellText = "-";
                        let color = "#333";
                        
                        if (scoresArray.length > 0) {
                            cellText = scoresArray.map(score => {
                                let sign = score > 0 ? "+" : "";
                                return `${sign}${score}`;
                            }).join(" / ");
                            
                            let total = scoresArray.reduce((sum, s) => sum + s, 0);
                            if (total < 0) color = "#e74c3c";
                            else if (total > 0) color = "#1c7b64";
                        }
                        
                        modalHTML += `<td style="padding:6px; border:1px solid #dee2e6; color:${color}; font-weight:bold;">${cellText}</td>`;
                    });
                    modalHTML += `</tr>`;
                });
            }

            modalHTML += `<tr style="background:#fffdf5; font-weight:bold; border-top:2px solid #ced4da;">
                            <td style="padding:6px; border:1px solid #dee2e6; color:#2c3e50;">TOPLAM</td>`;
            partyObj.finalTotals.forEach(tScore => {
                modalHTML += `<td style="padding:6px; border:1px solid #dee2e6; color:${tScore >= 0 ? '#1c7b64':'#e74c3c'}">${tScore > 0 ? '+' : ''}${tScore}</td>`;
            });

            modalHTML += `</tr></tbody></table></div></div>`;
        });
    }

    modalMatchContent.innerHTML = modalHTML;
    matchDetailsModal.style.display = "flex";
}

leaderboardGameSelect.addEventListener("change", calculateAndRenderLeaderboard);
leaderboardModeSelect.addEventListener("change", calculateAndRenderLeaderboard);
archiveFilterGame.addEventListener("change", renderFilteredArchive);
archiveFilterMode.addEventListener("change", renderFilteredArchive);

archiveFilterStartDate.addEventListener("change", renderFilteredArchive);
archiveFilterEndDate.addEventListener("change", renderFilteredArchive);

detailBackBtn.addEventListener("click", () => { 
    if (activeGroupListener) { activeGroupListener(); activeGroupListener = null; } 
    groupDetailScreen.style.display = "none"; 
    dashboardScreen.style.display = "block"; 
    fetchGroups(); 
});

detailStartMatchBtn.addEventListener("click", () => {
    if (activeGroupListener) { activeGroupListener(); activeGroupListener = null; } 
    groupDetailScreen.style.display = "none"; 
    setupScreen.style.display = "block";
    setupTitle.innerText = "Ekip Maç Kurulumu"; setupAddArea.style.display = "flex"; setupBackBtn.style.display = "block";
    
    gameModeSelect.value = "tekli";
    players = []; 
    historyPartyRounds = []; 
    
    updatePlayerInputComponent();
    updateList();
});

function updatePlayerInputComponent() {
    const mode = gameModeSelect.value;
    const esliTeamsArea = document.getElementById("esli-teams-area");
    
    if (mode === "tekli") {
        document.getElementById("setup-add-area").style.display = "flex";
        document.getElementById("player-list").style.display = "block";
        esliTeamsArea.style.display = "none";
        
        if (currentSelectedGroupId && currentGroupData) {
            let optionsHTML = currentGroupData.members.map(m => `<option value="${m.name}">👤 ${m.name}</option>`).join('');
            if (optionsHTML === "") { optionsHTML = `<option value="">Grupta oyuncu yok</option>`; }
            playerInputWrapper.innerHTML = `<select id="player-name-select" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #ced4da; font-size: 16px; background: white;">${optionsHTML}</select>`;
        } else {
            playerInputWrapper.innerHTML = `<input type="text" id="player-name" placeholder="Oyuncu Adı">`;
        }
    } else {
        document.getElementById("setup-add-area").style.display = "none";
        document.getElementById("player-list").style.display = "none";
        esliTeamsArea.style.display = "block";
        
        if (currentSelectedGroupId && currentGroupData) {
            let optionsHTML = currentGroupData.members.map(m => `<option value="${m.name}">${m.name}</option>`).join('');
            esliTeamsArea.innerHTML = `
                <div style="width: 100%; text-align: left; display: flex; flex-direction: column; gap: 15px; background: #fffdf5; padding: 15px; border-radius: 12px; border: 1px solid #f1c40f;">
                    <div>
                        <strong style="color: #b7950b; font-size: 14px; display: block; margin-bottom: 5px;">👥 1. Takım (Ortaklar)</strong>
                        <div style="display: flex; gap: 10px;">
                            <select id="esli-t1-p1" style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid #ced4da; background:white;">${optionsHTML}</select>
                            <select id="esli-t1-p2" style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid #ced4da; background:white;">${optionsHTML}</select>
                        </div>
                    </div>
                    <div>
                        <strong style="color: #b7950b; font-size: 14px; display: block; margin-bottom: 5px;">👥 2. Takım (Ortaklar)</strong>
                        <div style="display: flex; gap: 10px;">
                            <select id="esli-t2-p1" style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid #ced4da; background:white;">${optionsHTML}</select>
                            <select id="esli-t2-p2" style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid #ced4da; background:white;">${optionsHTML}</select>
                        </div>
                    </div>
                    <button id="confirm-esli-teams-btn" class="btn-secondary" style="width: 100%; border-color: #f1c40f; color: #b7950b; padding: 10px; font-weight:bold;">Takımları Onayla ve Kilitle</button>
                </div>
            `;
        } else {
            esliTeamsArea.innerHTML = `
                <div style="width: 100%; text-align: left; display: flex; flex-direction: column; gap: 15px; background: #f8f9fa; padding: 15px; border-radius: 12px; border: 1px solid #dee2e6;">
                    <div>
                        <strong style="color: #2c4d61; font-size: 14px; display: block; margin-bottom: 5px;">👥 1. Takım (Ortaklar)</strong>
                        <div style="display: flex; gap: 10px;">
                            <input type="text" id="esli-t1-p1-raw" placeholder="1. Oyuncu" style="flex: 1; padding: 10px;">
                            <input type="text" id="esli-t1-p2-raw" placeholder="2. Oyuncu" style="flex: 1; padding: 10px;">
                        </div>
                    </div>
                    <div>
                        <strong style="color: #2c4d61; font-size: 14px; display: block; margin-bottom: 5px;">👥 2. Takım (Ortaklar)</strong>
                        <div style="display: flex; gap: 10px;">
                            <input type="text" id="esli-t2-p1-raw" placeholder="1. Oyuncu" style="flex: 1; padding: 10px;">
                            <input type="text" id="esli-t2-p2-raw" placeholder="2. Oyuncu" style="flex: 1; padding: 10px;">
                        </div>
                    </div>
                    <button id="confirm-esli-teams-btn" class="btn-primary" style="width: 100%; padding: 10px;">Takımları Onayla ve Kilitle</button>
                </div>
            `;
        }
        
        document.getElementById("confirm-esli-teams-btn").addEventListener("click", () => {
            let p1, p2, p3, p4;
            if (currentSelectedGroupId && currentGroupData) {
                p1 = document.getElementById("esli-t1-p1").value; p2 = document.getElementById("esli-t1-p2").value;
                p3 = document.getElementById("esli-t2-p1").value; p4 = document.getElementById("esli-t2-p2").value;
            } else {
                p1 = document.getElementById("esli-t1-p1-raw").value.trim(); p2 = document.getElementById("esli-t1-p2-raw").value.trim();
                p3 = document.getElementById("esli-t2-p1-raw").value.trim(); p4 = document.getElementById("esli-t2-p2-raw").value.trim();
            }

            if (!p1 || !p2 || !p3 || !p4) { alert("Lütfen tüm takım oyuncu seçimlerini eksiksiz doldurun!"); return; }
            if (p1 === p2 || p1 === p3 || p1 === p4 || p2 === p3 || p2 === p4 || p3 === p4) { alert("Aynı oyuncuyu birden fazla kez seçemezsiniz!"); return; }

            players = [
                { name: `${p1} & ${p2}`, wins: 0, placements: {} },
                { name: `${p3} & ${p4}`, wins: 0, placements: {} }
            ];
            alert("Eşli takımlar başarıyla kilitlendi! Maç ayarlarını kontrol edip başlayabilirsiniz.");
            startMatchBtn.style.display = "block";
            gameSettingsArea.style.display = "block";
        });
    }
}

// --- ÇETELE MATEMATİK MOTORU ---

function autoConfigureGameSettings() {
    const game = gameTypeSelect.value;
    if (game === "pisti") { winConditionSelect.value = "high"; targetScoreInput.value = "101"; }
    else if (game === "okey") { winConditionSelect.value = "low"; targetScoreInput.value = ""; }
    else if (game === "101") { winConditionSelect.value = "high"; targetScoreInput.value = "101"; }
    else if (game === "batak") { winConditionSelect.value = "low"; targetScoreInput.value = "11"; }
    else if (game === "king") { winConditionSelect.value = "low"; targetScoreInput.value = ""; }
}

addPlayerBtn.addEventListener("click", () => {
    if (gameModeSelect.value === "esli") return; 
    let name = "";
    if (currentSelectedGroupId && currentGroupData) {
        const selectEl = document.getElementById("player-name-select"); name = selectEl ? selectEl.value : "";
    } else {
        const inputEl = document.getElementById("player-name"); name = inputEl ? inputEl.value.trim() : "";
    }

    if (name !== "") {
        if (players.some(p => p.name === name)) { alert("Bu oyuncu zaten listeye eklendi!"); return; }
        players.push({ name: name, wins: 0, placements: {} });
        const inputEl = document.getElementById("player-name"); if (inputEl) inputEl.value = "";
        updateList(); 
    }
});

function updateList() {
    if (gameModeSelect.value === "esli") return; 
    playerList.innerHTML = ""; 
    players.forEach((player, index) => {
        const li = document.createElement("li"); li.innerHTML = `<span>👤 <strong>${player.name}</strong></span> <button class="remove-btn" onclick="removePlayer(${index})">X</button>`; playerList.appendChild(li);
    });
    
    let canStart = (players.length >= 2);
    if (canStart) { startMatchBtn.style.display = "block"; gameSettingsArea.style.display = "block"; } 
    else { startMatchBtn.style.display = "none"; gameSettingsArea.style.display = "none"; }
}

window.removePlayer = function(index) { players.splice(index, 1); updateList(); };
startMatchBtn.addEventListener("click", () => { setupScreen.style.display = "none"; selectedGameName = gameTypeSelect.options[gameTypeSelect.selectedIndex].text; startParty(); });

function startParty() {
    gameScreen.style.display = "block"; endScreen.style.display = "none"; summaryScreen.style.display = "none";
    partyTitle.innerText = `${currentParty}. Parti Oynanıyor (${selectedGameName})`; nextPartyBtn.innerText = `${currentParty + 1}. Parti'ye Geç`;
    let winCondition = winConditionSelect.value;
    let panelHTML = `<div style="font-weight: bold; text-align: center; margin-bottom: 8px; border-bottom: 1px solid #dee2e6; padding-bottom: 5px; color:#2c4d61;">🏆 GENEL SERİ: ${players.map(p => `${p.name}: ${p.wins}`).join(' - ')}</div>`;
    
    if (pastParties.length > 0) {
        panelHTML += `<div style="font-size: 13px; display: flex; flex-direction: column; gap: 4px;">`;
        pastParties.forEach((partyTotals, index) => {
            let maxScore = Math.max(...partyTotals); let minScore = Math.min(...partyTotals);
            let winnerValue = winCondition === "high" ? maxScore : minScore; let loserValue = winCondition === "high" ? minScore : maxScore;
            let partyRow = `<strong>${index + 1}. Parti:</strong> `;
            let playerStrings = players.map((p, pIndex) => {
                let score = partyTotals[pIndex]; let colorStyle = "color: #333;";
                if (score === winnerValue) { colorStyle = "color: #1c7b64; font-weight: bold;"; } 
                else if (score === loserValue) { colorStyle = "color: #e74c3c; font-weight: bold;"; }
                return `${p.name}: <span style="${colorStyle}">${score}</span>`;
            });
            partyRow += playerStrings.join(', '); panelHTML += `<div>${partyRow}</div>`;
        });
        panelHTML += `</div>`;
    }
    liveSeriesScore.innerHTML = panelHTML; rounds = [ players.map(() => []) ]; renderTable();
    syncLiveMatchToCloud(); 
}

function renderTable() {
    const thead = document.getElementById("score-thead"); const tbody = document.getElementById("score-tbody"); const tfoot = document.getElementById("score-tfoot");
    thead.innerHTML = `<tr><th>Turlar</th>${players.map(p => `<th>${p.name}</th>`).join('')}</tr>`; tbody.innerHTML = "";
    
    let baseScore = parseInt(startScoreInput.value) || 0;
    let totals = players.map(() => baseScore); 
    
    rounds.forEach((round, rIndex) => {
        let tr = document.createElement("tr"); let roundNameTd = document.createElement("td"); roundNameTd.innerHTML = `<strong>${rIndex + 1}. El</strong>`; tr.appendChild(roundNameTd);
        round.forEach((playerScores, pIndex) => {
            let td = document.createElement("td"); td.className = "cell-score"; td.onclick = () => { addScoreToCell(rIndex, pIndex); };
            let html = playerScores.map(score => {
                let sign = score > 0 ? "+" : ""; let colorClass = score >= 0 ? "positive" : "negative"; return `<div class="score-val ${colorClass}">${sign}${score}</div>`;
            }).join('');
            if (html === "") { html = `<div class="add-score-hint">Puan Gir</div>`; }
            td.innerHTML = html; tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    
    rounds.forEach(round => { 
        round.forEach((playerScores, pIndex) => { 
            playerScores.forEach(score => { 
                if (baseScore > 0) {
                    totals[pIndex] -= score; 
                } else {
                    totals[pIndex] += score; 
                }
            }); 
        }); 
    });
    
    tfoot.innerHTML = `<tr><th>TOPLAM</th>${totals.map(t => `<th>${t}</th>`).join('')}</tr>`; return totals; 
}

let currentEditRoundIndex = null;
let currentEditPlayerIndex = null;

window.addScoreToCell = function(rIndex, pIndex) {
    currentEditRoundIndex = rIndex;
    currentEditPlayerIndex = pIndex;
    
    scoreModalTitle.innerText = `${rIndex + 1}. El - ${players[pIndex].name} için puan girin:`;
    modalScoreInput.value = ""; 
    
    renderModalScores();
    scoreInputModal.style.display = "flex"; 
    
    setTimeout(() => { modalScoreInput.focus(); }, 100);
};

function renderModalScores() {
    const scoresListDiv = document.getElementById("modal-scores-list");
    const container = document.getElementById("modal-current-scores-container");
    if (!scoresListDiv || !container) return;
    
    const currentScores = rounds[currentEditRoundIndex][currentEditPlayerIndex] || [];
    scoresListDiv.innerHTML = "";
    
    if (currentScores.length > 0) {
        container.style.display = "block";
        currentScores.forEach((score, sIdx) => {
            const badge = document.createElement("span");
            badge.style.cssText = "background: #ffebe9; color: #e74c3c; padding: 6px 10px; border-radius: 8px; font-weight: bold; font-size: 14px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; border: 1px solid #f5c6cb; margin: 2px;";
            badge.innerHTML = `${score > 0 ? '+' : ''}${score} <span style="color:#721c24; font-weight:bold; font-size:11px;">✕</span>`;
            badge.title = "Bu skoru silmek için dokunun";
            
            badge.addEventListener("click", () => {
                rounds[currentEditRoundIndex][currentEditPlayerIndex].splice(sIdx, 1);
                renderTable();        
                renderModalScores();  
                syncLiveMatchToCloud(); 
            });
            scoresListDiv.appendChild(badge);
        });
    } else {
        container.style.display = "none";
    }
}

modalScoreConfirm.addEventListener("click", () => {
    let points = modalScoreInput.value.trim();
    
    if (points === "") {
        let currentTotals = renderTable(); 
        scoreInputModal.style.display = "none"; 
        
        let isRoundComplete = rounds[currentEditRoundIndex].every(playerScores => playerScores.length > 0);
        if (isRoundComplete) { checkAutoEnd(currentTotals); }
        syncLiveMatchToCloud(); 
        return; 
    }
    
    let parsed = parseInt(points);
    if (!isNaN(parsed)) {
        rounds[currentEditRoundIndex][currentEditPlayerIndex].push(parsed); 
        let currentTotals = renderTable(); 
        scoreInputModal.style.display = "none"; 
        
        let isRoundComplete = rounds[currentEditRoundIndex].every(playerScores => playerScores.length > 0);
        if (isRoundComplete) { checkAutoEnd(currentTotals); }
        syncLiveMatchToCloud(); 
    } else { 
        alert("Lütfen geçerli bir sayı yazın!"); 
    }
});

modalScoreInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        modalScoreConfirm.click();
    }
});

document.getElementById("new-round-btn").addEventListener("click", () => {
    let totals = players.map(() => 0); 
    rounds.forEach(round => { round.forEach((playerScores, pIndex) => { playerScores.forEach(score => { totals[pIndex] += score; }); }); });
    if (checkAutoEnd(totals)) { return; }
    rounds.push(players.map(() => [])); renderTable();
    syncLiveMatchToCloud(); 
});

function checkAutoEnd(totals) {
    let baseScore = parseInt(startScoreInput.value) || 0;
    let target = parseInt(targetScoreInput.value);
    
    if (baseScore > 0) {
        let finalTarget = !isNaN(target) ? target : 0; 
        let isGameOver = totals.some(t => t <= finalTarget);
        if (isGameOver) { setTimeout(() => { alert(`Hedef puana (${finalTarget}) ulaşıldı!`); endParty(); }, 300); return true; }
    } else if (!isNaN(target)) {
        let winCondition = winConditionSelect.value; let isGameOver = false;
        if (winCondition === "high") { isGameOver = totals.some(t => t >= target); } else { isGameOver = totals.some(t => t <= target); }
        if (isGameOver) { setTimeout(() => { alert(`Hedef puana (${target}) ulaşıldı!`); endParty(); }, 300); return true; }
    }
    return false;
}

manualEndBtn.addEventListener("click", () => { if (confirm("Bu partiyi bitirip sonuçları görmek istediğinize emin misiniz?")) { endParty(); } });

function endParty() {
    gameScreen.style.display = "none"; 
    endScreen.style.display = "block";
    
    let baseScore = parseInt(startScoreInput.value) || 0;
    
    let partyTotalsOrdered = players.map((p, i) => {
        let totalScore = baseScore; 
        rounds.forEach(round => { 
            if (round[i]) { 
                round[i].forEach(score => { 
                    if (baseScore > 0) {
                        totalScore -= score; 
                    } else {
                        totalScore += score; 
                    }
                }); 
            } 
        }); 
        return totalScore;
    });

    historyPartyRounds.push({
        playerNames: players.map(p => p.name),
        handRounds: rounds.map(round => {
            let roundObj = {};
            players.forEach((p, pIdx) => { roundObj[p.name] = round[pIdx] || []; });
            return roundObj;
        }), 
        finalTotals: partyTotalsOrdered
    });

    pastParties.push(partyTotalsOrdered);
    
    let totals = players.map((p, i) => { return { originalIndex: i, name: p.name, score: partyTotalsOrdered[i] }; });
    let winCondition = winConditionSelect.value;
    
    if (baseScore > 0) {
        totals.sort((a, b) => a.score - b.score); 
    } else {
        if (winCondition === "high") { 
            totals.sort((a, b) => b.score - a.score); 
        } else { 
            totals.sort((a, b) => a.score - b.score); 
        }
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
    players.forEach(p => { seriesScoreList.innerHTML += `<div style="background: #ffffff; padding: 5px 15px; border-radius: 8px; font-weight: bold; border: 1px solid #bdc3c7;">${p.name}: <span style="color: #2980b9; font-size: 18px;">${p.wins}</span></div>`; });
    if (typeof confetti === "function") { confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } }); }
}

nextPartyBtn.addEventListener("click", () => {
    modalNextTarget.value = targetScoreInput.value;
    modalNextStart.value = startScoreInput.value;
    nextPartyModal.style.display = "flex"; 
});

modalNextConfirm.addEventListener("click", () => {
    targetScoreInput.value = modalNextTarget.value;
    startScoreInput.value = modalNextStart.value;
    nextPartyModal.style.display = "none"; 
    
    currentParty += 1; 
    startParty(); 
});

endCompletelyBtn.addEventListener("click", async () => {
    if (confirm("Turnuvayı bitirip istatistikleri rapora işlemek istiyor musunuz?")) {
        if (currentSelectedGroupId) {
            statusMsg.innerText = "⏳ En taze grup verileri doğrulanıyor...";
            try {
                const groupRef = doc(db, "groups", currentSelectedGroupId);
                
                const freshSnap = await getDoc(groupRef);
                if (freshSnap.exists()) {
                    const freshGroupData = freshSnap.data();
                    
                    let baseScore = parseInt(startScoreInput.value) || 0;

                    let matchSummary = { 
                        gameName: selectedGameName, 
                        gameType: gameTypeSelect.value,
                        gameMode: gameModeSelect.value,
                        date: new Date().toLocaleDateString('tr-TR'), 
                        isCountdown: baseScore > 0, 
                        partyScores: players.map(p => ({ name: p.name, wins: p.wins })),
                        partyRoundDetails: historyPartyRounds 
                    };
                    
                    let updatedRecentGames = freshGroupData.recentGames || [];
                    updatedRecentGames.unshift(matchSummary);
                    
                    await updateDoc(groupRef, { recentGames: updatedRecentGames, activeMatchRaw: null }); // Canlı yedeği başarıyla sıfırla
                    statusMsg.innerText = "✅ İstatistikler ortak rapora başarıyla işlendi!";
                }
            } catch (err) { 
                console.log("Bulut kayıt hatası: ", err); 
                alert("Veritabanı senkronizasyon hatası: " + err.message);
            }
        }

        currentParty = 1;
        pastParties = [];
        rounds = [];
        players = [];
        historyPartyRounds = [];

        endScreen.style.display = "none";
        if (currentSelectedGroupId) {
            showGroupDetails(currentSelectedGroupId);
        } else {
            dashboardScreen.style.display = "block";
            fetchGroups();
        }
    }
});

// --- PROFİL İŞLEMLERİ ---
const updateProfileBtn = document.getElementById("update-profile-btn");
const updatePasswordBtn = document.getElementById("update-password-btn");
const upgradePremiumBtn = document.getElementById("upgrade-premium-btn");
const deleteAccountBtn = document.getElementById("delete-account-btn");

updateProfileBtn.addEventListener("click", async () => {
    const newUsername = document.getElementById("edit-username").value.trim(); const newAvatar = document.getElementById("edit-avatar").value; 
    if (!auth.currentUser) return;
    try {
        statusMsg.innerText = "⏳ Profil güncelleniyor...";
        await updateDoc(doc(db, "users", auth.currentUser.uid), { username: newUsername || currentUserData.username, avatar: newAvatar || currentUserData.avatar });
        alert("Profiliniz başarıyla güncellendi!"); sideMenuPanel.classList.remove("open"); location.reload(); 
    } catch (error) { alert("Güncelleme hatası: " + error.message); }
});

updatePasswordBtn.addEventListener("click", async () => {
    const newPassword = document.getElementById("edit-password").value.trim();
    if (!newPassword) { alert("Lütfen yeni bir şifre yazın!"); return; }
    if (newPassword.length < 6) { alert("Şifre en az 6 karakter olmalıdır!"); return; }
    if (!auth.currentUser) return;
    try {
        statusMsg.innerText = "⏳ Şifre güncelleniyor...";
        await updatePassword(auth.currentUser, newPassword); alert("Şifreniz başarıyla değiştirildi!");
        document.getElementById("edit-password").value = ""; sideMenuPanel.classList.remove("open");
    } catch (error) { alert("Şifre değiştirme hatası: " + error.message); }
});

upgradePremiumBtn.addEventListener("click", async () => {
    if (!auth.currentUser) return;
    if (confirm("Premium Üye statüsüne yükselmek istiyor musunuz?")) {
        try {
            await updateDoc(doc(db, "users", auth.currentUser.uid), { isAdmin: true });
            alert("🎉 Başarıyla Premium Üye statüsüne yükseldiniz!"); sideMenuPanel.classList.remove("open"); location.reload();
        } catch (error) { alert("Abonelik hatası: " + error.message); }
    }
});

deleteAccountBtn.addEventListener("click", async () => {
    if (!confirm("Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz!")) return;
    try {
        const user = auth.currentUser; await deleteDoc(doc(db, "users", user.uid)); await user.delete(); 
        alert("Hesabınız silindi."); location.reload(); 
    } catch (error) { alert("Hesap silme hatası: " + error.message); }
});

finalRestartBtn.addEventListener("click", () => {
    currentParty = 1; pastParties = []; rounds = []; players = []; historyPartyRounds = [];
    if (auth.currentUser) { summaryScreen.style.display = "none"; dashboardScreen.style.display = "block"; fetchGroups(); } else { location.reload(); }
});

// --- GRUPTAN AYRILMA İŞLEMİ ---
leaveGroupBtn.addEventListener("click", async () => {
    if (!currentSelectedGroupId || !currentGroupData) return;
    
    if (confirm("Bu gruptan ayrılmak istediğinize emin misiniz? (İstatistikleriniz grupta kalacak, tekrar davet edilirseniz eski puanlarınızdan devam edebilirsiniz)")) {
        try {
            statusMsg.innerText = "⏳ Gruptan ayrılıyor...";
            
            let currentEmails = currentGroupData.memberEmails || [];
            currentEmails = currentEmails.filter(email => email !== auth.currentUser.email);
            
            const groupRef = doc(db, "groups", currentSelectedGroupId);
            await updateDoc(groupRef, { memberEmails: currentEmails });
            
            alert("Gruptan başarıyla ayrıldınız.");
            
            groupDetailScreen.style.display = "none";
            dashboardScreen.style.display = "block";
            fetchGroups(); 
            
        } catch (error) {
            alert("Ayrılma hatası: " + error.message);
        }
    }
});

// --- PUAN GİRİŞİNDE ARTI / EKSİ DEĞİŞTİRME FONKSİYONU ---
modalScoreToggleSign.addEventListener("click", () => {
    let currentVal = modalScoreInput.value.trim();
    
    if (currentVal !== "") {
        if (currentVal.startsWith("-")) {
            modalScoreInput.value = currentVal.substring(1);
        } else {
            modalScoreInput.value = "-" + currentVal;
        }
    } else {
        modalScoreInput.value = "-";
    }
    
    modalScoreInput.focus();
});

// --- GÜVENLİK KALKANI: YANLIŞLIKLA SEKME KAPATMA/YENİLEME ENGELLEYİCİ ---
window.addEventListener("beforeunload", (e) => {
    if (gameScreen.style.display === "block" && rounds.length > 0) {
        e.preventDefault();
        e.returnValue = "⚠️ Masada devam eden bir oyununuz var! Sayfayı yenilerseniz veya kapatırsanız skorlar kaybolabilir.";
    }
});

// --- GÜVENLİK KALKANI: BULUTA ANLIK CANLI OTO-KAYIT MOTORU ---
// --- GÜVENLİK KALKANI: BULUTA ANLIK CANLI OTO-KAYIT MOTORU (JSON DESTEKLİ) ---
async function syncLiveMatchToCloud() {
    if (!currentSelectedGroupId) return;
    try {
        const groupRef = doc(db, "groups", currentSelectedGroupId);
        
        // MUCİZE ÇÖZÜM: Tüm iç içe dizileri tek bir düz metin şeridine çevirip Firebase engelini aşıyoruz!
        const jsonState = JSON.stringify({
            players: players,
            rounds: rounds,
            currentParty: currentParty,
            selectedGameName: selectedGameName,
            historyPartyRounds: historyPartyRounds,
            pastParties: pastParties,
            gameTypeValue: gameTypeSelect.value,
            gameModeValue: gameModeSelect.value,
            winConditionValue: winConditionSelect.value,
            targetScoreValue: targetScoreInput.value,
            startScoreValue: startScoreInput.value
        });
        
        // Firebase'e "activeMatchRaw" adında tertemiz düz bir metin yolluyoruz
        await updateDoc(groupRef, {
            activeMatchRaw: jsonState
        });
    } catch (err) { 
        console.log("Oto-yedekleme hatası:", err); 
    }
}

// --- GÜVENLİK KALKANI: YARIM KALAN CANLI MAÇI KURTARMA TETİKLEYİCİSİ (JSON DESTEKLİ) ---
liveMatchJoinBtn.addEventListener("click", () => {
    if (!currentSelectedGroupId || !currentGroupData || !currentGroupData.activeMatchRaw) return;
    
    try {
        // Buluttaki şifreli metni çözüp saniyede canlı hafızaya yüklüyoruz
        const am = JSON.parse(currentGroupData.activeMatchRaw);
        
        players = am.players;
        rounds = am.rounds;
        currentParty = am.currentParty;
        selectedGameName = am.selectedGameName;
        historyPartyRounds = am.historyPartyRounds || [];
        pastParties = am.pastParties || [];
        
        gameTypeSelect.value = am.gameTypeValue;
        gameModeSelect.value = am.gameModeValue;
        winConditionSelect.value = am.winConditionValue;
        targetScoreInput.value = am.targetScoreValue;
        startScoreInput.value = am.startScoreValue;
        
        groupDetailScreen.style.display = "none";
        gameScreen.style.display = "block";
        
        partyTitle.innerText = `${currentParty}. Parti Oynanıyor (${selectedGameName})`;
        
        let winCondition = winConditionSelect.value;
        let panelHTML = `<div style="font-weight: bold; text-align: center; margin-bottom: 8px; border-bottom: 1px solid #dee2e6; padding-bottom: 5px; color:#2c4d61;">🏆 GENEL SERİ: ${players.map(p => `${p.name}: ${p.wins}`).join(' - ')}</div>`;
        liveSeriesScore.innerHTML = panelHTML;
        
        renderTable(); 
        alert("🚀 Harika! Yarım kalan maçınız bulut yedeklerinden başarıyla kurtarıldı. Devam edebilirsiniz!");
    } catch (e) {
        alert("Maç kurtarılırken teknik bir hata oluştu: " + e.message);
    }
});