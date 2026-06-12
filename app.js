// Firebase kütüphanesini internet üzerinden (CDN) çağırıyoruz
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

// Senin Firebase Projenin Kimlik Bilgileri
const firebaseConfig = {
  apiKey: "AIzaSyA963gL6nAee0JZ11W5Utbfz4UL9n8VFdg",
  authDomain: "skorapp-cc771.firebaseapp.com",
  projectId: "skorapp-cc771",
  storageBucket: "skorapp-cc771.firebasestorage.app",
  messagingSenderId: "336176556053",
  appId: "1:336176556053:web:47663b2ef090e9554e461c",
  measurementId: "G-4JBJSCYTJP"
};

// Uygulamayı Firebase'e bağlıyoruz
const app = initializeApp(firebaseConfig);


// Ekrana başarı mesajı yazdırıyoruz
document.getElementById("status-message").innerText = "✅ Sistem Hazır: Firebase başarıyla bağlandı!";
document.getElementById("status-message").style.color = "#4CAF50";

// Butona tıklama özelliğini ekliyoruz
document.getElementById("start-btn").addEventListener("click", () => {
    alert("Harika! İlk butonumuz çalışıyor. Bir sonraki adımda buraya yeni oyun açma ekranını getireceğiz.");
});