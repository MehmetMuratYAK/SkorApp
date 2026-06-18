import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, getDoc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup, updatePassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// FIREBASE YAPILANDIRMASI
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
let allSystemUsers = []; 

let players = []; 
let rounds = []; 
let pastParties = []; 
let currentParty = 1;
let selectedGameName = "";
// Turnuva bitiminde tüm el detaylarını veri tabanına gömmek için bu state dizisini tutuyoruz
let historyPartyRounds = []; 

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

// MATRIX TABLO VE ARŞİV FİLTRE DÜĞMELERİ
const leaderboardGameSelect = document.getElementById("leaderboard-game-select");
const leaderboardModeSelect = document.getElementById("leaderboard-mode-select");
const archiveFilterGame = document.getElementById("archive-filter-game");
const archiveFilterMode = document.getElementById("archive-filter-mode");

// MODAL DÜĞMELERİ
const matchDetailsModal = document.getElementById("match-details-modal");
const modalMatchTitle = document.getElementById("modal-match-title");
const modalMatchContent = document.getElementById("modal-match-content");
const modalCloseBtn = document.getElementById("modal-close-btn");

// HAMBURGER ELEMANLARI
const hamburgerBtn = document.getElementById("hamburger-btn");
const closeMenuBtn = document.getElementById("close-menu-btn");
const sideMenuPanel = document.getElementById("side-menu-panel");

hamburgerBtn.addEventListener("click", () => { sideMenuPanel.classList.add("open"); });
closeMenuBtn.addEventListener("click", () => { sideMenuPanel.classList.remove("open"); });
modalCloseBtn.addEventListener("click", () => { matchDetailsModal.style.display = "none"; });

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
        statusMsg.innerText = "✅ Oturum Açık"; 
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
    if (currentEmails.includes(email)) { alert(`🚨 ${username} zaten bu gruba ekli!`); return; }
    statusMsg.innerText = "⏳ Oyuncu ekibe dahil ediliyor..."; currentEmails.push(email);
    let currentMembers = currentGroupData.members || []; currentMembers.push({ name: username, wins: 0, placements: {} });
    try {
        const groupRef = doc(db, "groups", currentSelectedGroupId);
        await updateDoc(groupRef, { memberEmails: currentEmails, members: currentMembers });
        alert(`🎉 ${username} başarıyla ekibe dahil edildi!`); await showGroupDetails(currentSelectedGroupId);
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
    groupList.innerHTML = ""; const querySnapshot = await getDocs(collection(db, "groups")); let count = 0;
    querySnapshot.forEach((docSnap) => {
        const group = docSnap.data(); const emails = group.memberEmails || [];
        if (emails.includes(auth.currentUser.email)) {
            count++; const li = document.createElement("li"); li.className = "group-item-box";
            li.innerHTML = `<div class="group-info-text"><strong>🏠 ${group.name}</strong><div style="font-size:11px; color:#7f8c8d; margin-top:3px;">Toplam Oyuncu: ${group.members ? group.members.length : 0}</div></div><button class="group-play-btn" data-id="${docSnap.id}">Gruba Gir</button>`;
            groupList.appendChild(li);
        }
    });
    document.querySelectorAll(".group-play-btn").forEach(btn => {
        btn.addEventListener("click", (e) => { currentSelectedGroupId = e.target.getAttribute("data-id"); showGroupDetails(currentSelectedGroupId); });
    });
    if (count === 0) { groupList.innerHTML = `<li style="font-style:italic; font-size:13px; color:#7f8c8d; background:none; border:none; text-align:center;">Henüz üye olduğunuz bir grup bulunmuyor.</li>`; }
}

async function showGroupDetails(groupId) {
    dashboardScreen.style.display = "none"; groupDetailScreen.style.display = "block";
    statusMsg.innerText = "⏳ Grup kütüğü buluttan indiriliyor..."; invitePlayerSearch.value = ""; inviteSearchResults.style.display = "none";

    const groupDoc = await getDoc(doc(db, "groups", groupId));
    if (groupDoc.exists()) {
        currentGroupData = groupDoc.data(); detailGroupName.innerText = `🏠 ${currentGroupData.name}`;

        if (currentUserData && currentUserData.isAdmin) {
            detailStartMatchBtn.style.display = "block"; document.getElementById("premium-match-notice").style.display = "none"; document.getElementById("group-invite-area").style.display = "block"; 
        } else {
            detailStartMatchBtn.style.display = "none"; document.getElementById("premium-match-notice").style.display = "block"; document.getElementById("group-invite-area").style.display = "none"; 
        }

        // Dinamik Matris Puan Tablosunu ve Arşivi İlk Kez Hesaplayıp Çizelim
        calculateAndRenderLeaderboard();
        renderFilteredArchive();
        statusMsg.innerText = "✅ Grup verileri senkronize.";
    }
}

// --- DİNAMİK PUAN TABLOSU VE MATRIX MOTORU (GÖRSELLERDEKİ GİBİ SIFIRDAN ÇİZER) ---
function calculateAndRenderLeaderboard() {
    const targetGame = leaderboardGameSelect.value;
    const targetMode = leaderboardModeSelect.value;
    const thead = document.getElementById("leaderboard-thead");
    const tbody = document.getElementById("detail-leaderboard");

    tbody.innerHTML = "";
    
    // Gruptaki tüm oyuncuları baz alan geçici bir istatistik haritası açalım
    let statsMap = {};
    currentGroupData.members.forEach(m => {
        statsMap[m.name] = { name: m.name, p1: 0, p2: 0, p3: 0, p4: 0, wins: 0, losses: 0, hasPlayed: false };
    });

    // Son oynanan tüm maçları tarayarak seçilen oyun/mod filtresine uyan verileri süzüyoruz
    const matchHistory = currentGroupData.recentGames || [];
    matchHistory.forEach(game => {
        if (game.gameType === targetGame && game.gameMode === targetMode) {
            // Eşli Mod Matrisi (Galibiyet / Mağlubiyet)
            if (targetMode === "esli") {
                if (game.partyScores && game.partyScores.length > 0) {
                    let sortedParty = [...game.partyScores].sort((a,b) => b.wins - a.wins);
                    let maxWins = sortedParty[0].wins;
                    game.partyScores.forEach(pScore => {
                        if (!statsMap[pScore.name]) statsMap[pScore.name] = { name: pScore.name, p1: 0, p2: 0, p3: 0, p4: 0, wins: 0, losses: 0, hasPlayed: true };
                        statsMap[pScore.name].hasPlayed = true;
                        if (pScore.wins === maxWins) {
                            statsMap[pScore.name].wins += 1;
                        } else {
                            statsMap[pScore.name].losses += 1;
                        }
                    });
                }
            } 
            // Tekli Mod Matrisi (1.lik, 2.lik, 3.lük, 4.lük Sıralaması)
            else {
                if (game.partyScores && game.partyScores.length > 0) {
                    let sortedParty = [...game.partyScores].sort((a,b) => b.wins - a.wins);
                    sortedParty.forEach((pScore, index) => {
                        if (!statsMap[pScore.name]) statsMap[pScore.name] = { name: pScore.name, p1: 0, p2: 0, p3: 0, p4: 0, wins: 0, losses: 0, hasPlayed: true };
                        statsMap[pScore.name].hasPlayed = true;
                        let rank = index + 1;
                        if (rank === 1) statsMap[pScore.name].p1 += 1;
                        if (rank === 2) statsMap[pScore.name].p2 += 1;
                        if (rank === 3) statsMap[pScore.name].p3 += 1;
                        if (rank === 4) statsMap[pScore.name].p4 += 1;
                    });
                }
            }
        }
    });

    let statsArray = Object.values(statsMap);

    // KURAL: Eğer TEKLİ ise sıralama önce en çok 1. olana, eşitse 2.ye, o da eşitse 3.ye göre yapılır!
    if (targetMode === "tekli") {
        thead.innerHTML = `<tr><th style="padding:10px;">Oyuncu</th><th>1</th><th>2</th><th>3</th><th>4</th></tr>`;
        statsArray.sort((a, b) => b.p1 - a.p1 || b.p2 - a.p2 || b.p3 - a.p3 || b.p4 - a.p4);
        
        statsArray.forEach(row => {
            tbody.innerHTML += `
                <tr class="leaderboard-row" style="background: ${row.hasPlayed ? '#ffffff' : '#fdfefe'}; opacity: ${row.hasPlayed ? '1' : '0.6'}">
                    <td style="padding:10px; font-weight:bold;">👤 ${row.name}</td>
                    <td style="color:#1c7b64; font-weight:bold;">${row.p1}</td>
                    <td>${row.p2}</td>
                    <td>${row.p3}</td>
                    <td style="color:#e74c3c;">${row.p4}</td>
                </tr>`;
        });
    } 
    // KURAL: Eğer EŞLİ ise sıralama galibiyete göre yapılır
    else {
        thead.innerHTML = `<tr><th style="padding:10px;">Oyuncu</th><th style="color:#2ecc71;">Galibiyet</th><th style="color:#e74c3c;">Mağlubiyet</th></tr>`;
        statsArray.sort((a, b) => b.wins - a.wins || a.losses - b.losses);

        statsArray.forEach(row => {
            tbody.innerHTML += `
                <tr class="leaderboard-row" style="background: ${row.hasPlayed ? '#ffffff' : '#fdfefe'}; opacity: ${row.hasPlayed ? '1' : '0.6'}">
                    <td style="padding:10px; font-weight:bold;">👤 ${row.name}</td>
                    <td style="color:#1c7b64; font-weight:bold;">${row.wins} Maç</td>
                    <td style="color:#e74c3c; font-weight:bold;">${row.losses} Maç</td>
                </tr>`;
        });
    }
}

// --- AKILLI ARŞİV FİLTRELEME VE MAÇ DETAY GÖSTERİM MOTORU ---
function renderFilteredArchive() {
    const gameFilter = archiveFilterGame.value;
    const modeFilter = archiveFilterMode.value;
    const container = document.getElementById("detail-recent-games");
    container.innerHTML = "";

    const matchHistory = currentGroupData.recentGames || [];
    let count = 0;

    matchHistory.forEach((game, globalIdx) => {
        const matchGameType = game.gameType || "okey";
        const matchGameMode = game.gameMode || "tekli";

        // Filtre süzgeç kontrolleri
        if (gameFilter !== "all" && matchGameType !== gameFilter) return;
        if (modeFilter !== "all" && matchGameMode !== modeFilter) return;

        count++;
        let scoresHTML = game.partyScores ? game.partyScores.map(s => `<span>${s.name}: <strong>${s.wins}</strong></span>`).join(' | ') : "Skor yok";
        
        const card = document.createElement("div");
        card.className = "recent-game-card";
        card.style.cursor = "pointer";
        card.style.transition = "0.2s";
        card.title = "Tüm el puan detaylarını görmek için tıkla!";
        card.innerHTML = `
            <div class="recent-game-header">
                <span>🎮 ${game.gameName} (${matchGameMode === 'esli' ? 'Eşli' : 'Tekli'})</span>
                <span style="font-size:11px; font-weight:normal; color:#7f8c8d;">📅 ${game.date || 'Tarih yok'} 🔍 Tıkla Detay Gör</span>
            </div>
            <div class="recent-game-scores">${scoresHTML}</div>
        `;

        // TIKLANDIĞINDA TÜM EL PUANLARINI AYRI BİR MODAL PENCEREDE ÇİZEN DİNLEYİCİ
        card.addEventListener("click", () => {
            showExactHandDetailsModal(game);
        });

        container.appendChild(card);
    });

    if (count === 0) {
        container.innerHTML = `<div style="color:#7f8c8d; font-style:italic; font-size:13px; text-align:center; padding:10px;">Filtre kriterlerine uyan geçmiş oyun kaydı bulunamadı.</div>`;
    }
}

// GÖRSELDEKİ GİBİ GEÇMİŞ MAÇIN TÜM EL/TUR PUANLARINI DETAYLICA ÇİZEN MODAL AKIŞI
function showExactHandDetailsModal(gameData) {
    modalMatchTitle.innerText = `📊 ${gameData.gameName} - El Skor Geçmişi`;
    let modalHTML = `<div style="font-size:13px; color:#7f8c8d; margin-bottom:10px;"><strong>Tarih:</strong> ${gameData.date || '-'} | <strong>Mod:</strong> ${gameData.gameMode === 'esli' ? 'Eşli (2 Takım)' : 'Tekli'}</div>`;
    
    const gameParties = gameData.partyRoundDetails || [];
    
    if (gameParties.length === 0) {
        modalHTML += `<div style="text-align:center; font-style:italic; color:#7f8c8d; padding:15px;">Bu maça ait el detay puan verisi bulunmuyor.</div>`;
    } else {
        // Her bir partiyi ayrı birer tablo halinde modal içerisine döküyoruz
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

            // Turları/Elleri satır satır döküyoruz
            if (partyObj.handRounds && partyObj.handRounds.length > 0) {
                partyObj.handRounds.forEach((hand, hIdx) => {
                    modalHTML += `<tr><td style="padding:6px; border:1px solid #dee2e6; font-weight:bold;">${hIdx + 1}. El</td>`;
                    hand.forEach(scoresArray => {
                        let totalCellScore = scoresArray.reduce((sum, score) => sum + score, 0);
                        let sign = totalCellScore > 0 ? "+" : "";
                        let color = totalCellScore >= 0 ? "#333" : "#e74c3c";
                        modalHTML += `<td style="padding:6px; border:1px solid #dee2e6; color:${color}; font-weight:bold;">${sign}${totalCellScore}</td>`;
                    });
                    modalHTML += `</tr>`;
                });
            }

            // En alt satıra o partinin toplam skorlarını basalım
            modalHTML += `<tr style="background:#fffdf5; font-weight:bold; border-top:2px solid #ced4da;">
                            <td style="padding:6px; border:1px solid #dee2e6; color:#2c3e50;">TOPLAM</td>`;
            partyObj.finalTotals.forEach(tScore => {
                modalHTML += `<td style="padding:6px; border:1px solid #dee2e6; color:${tScore >= 0 ? '#333':'#e74c3c'}">${tScore}</td>`;
            });

            modalHTML += `</tr></tbody></table></div></div>`;
        });
    }

    modalMatchContent.innerHTML = modalHTML;
    matchDetailsModal.style.display = "flex";
}

// Tetikleyici Dinleyicilerini Seçim Kutularına Bağlayalım
leaderboardGameSelect.addEventListener("change", calculateAndRenderLeaderboard);
leaderboardModeSelect.addEventListener("change", calculateAndRenderLeaderboard);
archiveFilterGame.addEventListener("change", renderFilteredArchive);
archiveFilterMode.addEventListener("change", renderFilteredArchive);

detailBackBtn.addEventListener("click", () => { groupDetailScreen.style.display = "none"; dashboardScreen.style.display = "block"; fetchGroups(); });

// --- YENI MAÇ SEÇİM ALANI VE DINAMIK KOMPONENT MOTORU ---

detailStartMatchBtn.addEventListener("click", () => {
    groupDetailScreen.style.display = "none"; setupScreen.style.display = "block";
    setupTitle.innerText = "Ekip Maç Kurulumu"; setupAddArea.style.display = "flex"; setupBackBtn.style.display = "block";
    
    gameModeSelect.value = "tekli";
    players = []; 
    historyPartyRounds = []; // Yeni maç için el geçmişi state'ini sıfırla
    
    updatePlayerInputComponent();
    updateList();
});

function updatePlayerInputComponent() {
    if (currentSelectedGroupId && currentGroupData) {
        let optionsHTML = currentGroupData.members.map(m => `<option value="${m.name}">👤 ${m.name}</option>`).join('');
        if (optionsHTML === "") { optionsHTML = `<option value="">Grupta oyuncu yok</option>`; }
        playerInputWrapper.innerHTML = `<select id="player-name-select" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #ced4da; font-size: 16px; background: white;">${optionsHTML}</select>`;
    } else {
        let placeholderText = gameModeSelect.value === "esli" ? "Takım / Eş Adı (Örn: Ahmet & Can)" : "Oyuncu Adı";
        playerInputWrapper.innerHTML = `<input type="text" id="player-name" placeholder="${placeholderText}">`;
    }
}

gameModeSelect.addEventListener("change", () => {
    players = []; 
    updatePlayerInputComponent();
    updateList();
});

setupBackBtn.addEventListener("click", () => {
    setupScreen.style.display = "none";
    if (isQuickStart) { authScreen.style.display = "block"; } 
    else if (currentSelectedGroupId) { groupDetailScreen.style.display = "block"; } 
    else { dashboardScreen.style.display = "block"; }
});

dashboardQuickBtn.addEventListener("click", () => {
    currentSelectedGroupId = null; currentGroupData = null; dashboardScreen.style.display = "none"; setupScreen.style.display = "block"; setupTitle.innerText = "Hızlı Oyun Kurulumu"; setupAddArea.style.display = "flex"; setupBackBtn.style.display = "block"; players = []; historyPartyRounds = [];
    gameModeSelect.value = "tekli"; updatePlayerInputComponent(); updateList();
});

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
    let name = "";
    if (currentSelectedGroupId && currentGroupData) {
        const selectEl = document.getElementById("player-name-select"); name = selectEl ? selectEl.value : "";
    } else {
        const inputEl = document.getElementById("player-name"); name = inputEl ? inputEl.value.trim() : "";
    }

    if (name !== "") {
        if (players.some(p => p.name === name)) { alert("Bu oyuncu/takım zaten listeye eklendi!"); return; }
        if (gameModeSelect.value === "esli" && players.length >= 2) { alert("Eşli modda en fazla 2 takım/eş ekleyebilirsiniz!"); return; }
        
        players.push({ name: name, wins: 0, placements: {} });
        const inputEl = document.getElementById("player-name"); if (inputEl) inputEl.value = "";
        updateList(); 
    }
});

function updateList() {
    playerList.innerHTML = ""; 
    players.forEach((player, index) => {
        const li = document.createElement("li"); li.innerHTML = `<span>👤 <strong>${player.name}</strong></span> <button class="remove-btn" onclick="removePlayer(${index})">X</button>`; playerList.appendChild(li);
    });
    
    const mode = gameModeSelect.value;
    let canStart = mode === "esli" ? (players.length === 2) : (players.length >= 2);

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
}

function renderTable() {
    const thead = document.getElementById("score-thead"); const tbody = document.getElementById("score-tbody"); const tfoot = document.getElementById("score-tfoot");
    thead.innerHTML = `<tr><th>Turlar</th>${players.map(p => `<th>${p.name}</th>`).join('')}</tr>`; tbody.innerHTML = "";
    
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
    let totals = players.map(() => 0); 
    rounds.forEach(round => { round.forEach((playerScores, pIndex) => { playerScores.forEach(score => { totals[pIndex] += score; }); }); });
    tfoot.innerHTML = `<tr><th>TOPLAM</th>${totals.map(t => `<th>${t}</th>`).join('')}</tr>`; return totals; 
}

window.addScoreToCell = function(rIndex, pIndex) {
    let points = prompt(`${rIndex + 1}. El - ${players[pIndex].name} için puan girin:`); 
    if (points !== null && points.trim() !== "") {
        let parsed = parseInt(points);
        if (!isNaN(parsed)) {
            rounds[rIndex][pIndex].push(parsed); let currentTotals = renderTable(); 
            let isRoundComplete = rounds[rIndex].every(playerScores => playerScores.length > 0);
            if (isRoundComplete) { checkAutoEnd(currentTotals); }
        } else { alert("Lütfen sadece rakam girin!"); }
    }
};

document.getElementById("new-round-btn").addEventListener("click", () => {
    let totals = players.map(() => 0); 
    rounds.forEach(round => { round.forEach((playerScores, pIndex) => { playerScores.forEach(score => { totals[pIndex] += score; }); }); });
    if (checkAutoEnd(totals)) { return; }
    rounds.push(players.map(() => [])); renderTable();
});

function checkAutoEnd(totals) {
    let target = parseInt(targetScoreInput.value);
    if (!isNaN(target)) {
        let winCondition = winConditionSelect.value; let isGameOver = false;
        if (winCondition === "high") { isGameOver = totals.some(t => t >= target); } else { isGameOver = totals.some(t => t <= target); }
        if (isGameOver) { setTimeout(() => { alert(`Hedef puana (${target}) ulaşıldı!`); endParty(); }, 300); return true; }
    }
    return false;
}

manualEndBtn.addEventListener("click", () => { if (confirm("Bu partiyi bitirip sonuçları görmek istediğinize emin misiniz?")) { endParty(); } });

function endParty() {
    gameScreen.style.display = "none"; endScreen.style.display = "block";
    
    let partyTotalsOrdered = players.map((p, i) => {
        let totalScore = 0; rounds.forEach(round => { if (round[i]) { round[i].forEach(score => { totalScore += score; }); } }); return totalScore;
    });

    // Akıllı Arşiv: Oynanan bu partinin tur puan detaylarını klonlayıp kalıcı hafızaya alıyoruz
    historyPartyRounds.push({
        playerNames: players.map(p => p.name),
        handRounds: JSON.parse(JSON.stringify(rounds)), 
        finalTotals: partyTotalsOrdered
    });

    pastParties.push(partyTotalsOrdered);
    let totals = players.map((p, i) => { return { originalIndex: i, name: p.name, score: partyTotalsOrdered[i] }; });
    let winCondition = winConditionSelect.value;
    if (winCondition === "high") { totals.sort((a, b) => b.score - a.score); } else { totals.sort((a, b) => a.score - b.score); }
    
    totals.forEach((player, index) => {
        let rank = index + 1; let playerObj = players[player.originalIndex]; playerObj.placements[rank] = (playerObj.placements[rank] || 0) + 1;
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

nextPartyBtn.addEventListener("click", () => { currentParty += 1; startParty(); });

endCompletelyBtn.addEventListener("click", async () => {
    if (confirm("Turnuvayı bitirip istatistikleri rapora işlemek istiyor musunuz?")) {
        endScreen.style.display = "none"; summaryScreen.style.display = "block";
        const statType = statTypeSelect.value; let playedPartyCount = pastParties.length;
        let totalGamesCount = statType === "per-party" ? playedPartyCount : (playedPartyCount > 0 ? 1 : 0);
        gameCountInfo.innerText = `🎮 Toplam Değerlendirilen ${selectedGameName} Oyunu Sayısı: ${totalGamesCount}`;
        
        if (currentSelectedGroupId && currentGroupData) {
            statusMsg.innerText = "⏳ Maç özeti buluta yazılıyor...";
            try {
                const groupRef = doc(db, "groups", currentSelectedGroupId);
                
                // KALICI ARŞİV DETAY OBJESİ: Tüm el detaylarını ve modu buluta tek seferde basar
                let matchSummary = { 
                    gameName: selectedGameName, 
                    gameType: gameTypeSelect.value,
                    gameMode: gameModeSelect.value,
                    date: new Date().toLocaleDateString('tr-TR'), 
                    partyScores: players.map(p => ({ name: p.name, wins: p.wins })),
                    partyRoundDetails: historyPartyRounds // Tüm el skor matrisi
                };

                let updatedRecentGames = currentGroupData.recentGames || [];
                updatedRecentGames.unshift(matchSummary);
                
                await updateDoc(groupRef, { recentGames: updatedRecentGames });
                statusMsg.innerText = "✅ İstatistikler ve Son 5 Oyun buluta işlendi!";
            } catch (err) { console.log("Bulut kayıt hatası: ", err); }
        }

        summaryList.innerHTML = "";
        players.forEach(p => {
            let placementBadges = [];
            for (let i = 1; i <= players.length; i++) {
                let count = p.placements[i] || 0; if (count > 0) { placementBadges.push(`<span style="background: #eaf2f8; color: #2980b9; padding: 4px 10px; border-radius: 6px; border: 1px solid #d4e6f1; font-size: 13px; font-weight: bold;">${i}.lik: ${count} Kez</span>`); }
            }
            summaryList.innerHTML += `<div style="background: #ffffff; border: 1px solid #dee2e6; padding: 15px; border-radius: 12px; text-align: left; box-shadow: 0 2px 5px rgba(0,0,0,0.02);"><strong style="color: #1c7b64; font-size: 16px; display: block; margin-bottom: 8px;">👤 ${p.name}</strong><div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px;">${placementBadges.join('')}</div><div style="font-size: 13px; color: #7f8c8d; font-weight: 500;">🏆 Bu Turnuvadaki Toplam Parti Galibiyeti: ${p.wins}</div></div>`;
        });
    }
});

// --- PROFİL MANIPÜLASYONLARI ---
const updateProfileBtn = document.getElementById("update-profile-btn");
const updatePasswordBtn = document.getElementById("update-password-btn");
const upgradePremiumBtn = document.getElementById("upgrade-premium-btn");
const deleteAccountBtn = document.getElementById("delete-account-btn");

updateProfileBtn.addEventListener("click", async () => {
    const newUsername = document.getElementById("edit-username").value.trim(); const newAvatar = document.getElementById("edit-avatar").value; 
    if (!auth.currentUser) return;
    try {
        statusMsg.innerText = "⏳ Profil kütüğü güncelleniyor...";
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
        statusMsg.innerText = "⏳ Şifre güvenliği senkronize ediliyor...";
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