// 1. IMPORTAÇÕES DOS MÓDULOS FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 2. CONFIGURAÇÃO DO SEU FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyA62bThIoyynk7QVA1_9csgYFbRrXoT2eI",
    authDomain: "snapflow-23372.firebaseapp.com",
    projectId: "snapflow-23372",
    storageBucket: "snapflow-23372.appspot.com",
    messagingSenderId: "1056580665516",
    appId: "1:1056580665516:web:6562584144490f23821014"
};

// Inicialização
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- LÓGICA DO CLIMA ---
async function fetchWeather() {
    const tempDisplay = document.getElementById('temp');
    const apiKey = "0390abddc107b13d8002540d1dd10fc7";

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&appid=${apiKey}&units=metric&lang=pt_br`);
                const data = await res.json();
                if (res.ok) {
                    const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
                    tempDisplay.innerHTML = `${data.name}: <strong>${Math.round(data.main.temp)}°C</strong> <img src="${iconUrl}" class="w-6 h-6 inline">`;
                }
            } catch (e) { tempDisplay.innerText = "Erro no clima"; }
        });
    }
}

// --- CONTROLE DE MODAIS (INCLUI MENU HAMBÚRGUER) ---
window.toggleModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) {
        const isHidden = modal.classList.contains('hidden');
        
        // Se estivermos abrindo um modal de login ou registro, fechamos os outros modais (exceto o menu mobile se quiser mantê-lo)
        if (id !== 'mobileMenuModal' && isHidden) {
             document.querySelectorAll('[id$="Modal"]').forEach(m => {
                m.classList.add('hidden');
                m.classList.remove('flex');
             });
        }

        if (isHidden) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        } else {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }
};

// --- MONITOR DE LOGIN ---
onAuthStateChanged(auth, (user) => {
    const authBtn = document.getElementById('authBtn');
    const registerBtnNav = document.getElementById('registerBtnNav');
    const heroBtn = document.getElementById('heroBtn');

    if (user) {
        authBtn.innerText = "SAIR";
        authBtn.onclick = () => deslogar();
        if(registerBtnNav) registerBtnNav.style.display = 'none';
        heroBtn.innerText = "VER MEU PAINEL";
        heroBtn.onclick = () => document.getElementById('modulos').scrollIntoView({behavior: 'smooth'});
    } else {
        authBtn.innerText = "ENTRAR";
        authBtn.onclick = () => toggleModal('loginModal');
        if(registerBtnNav) registerBtnNav.style.display = 'block';
        heroBtn.innerText = "COMEÇAR TREINO GRÁTIS";
        heroBtn.onclick = () => toggleModal('registerModal');
    }
});

// --- FUNÇÕES DE CADASTRO E LOGIN ---
async function registrarAtleta(e) {
    e.preventDefault();
    const email = e.target[0].value;
    const senha = e.target[1].value;
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        await setDoc(doc(db, "atletas", userCredential.user.uid), {
            email, data: new Date().toISOString()
        });
        alert("Bem-vindo ao time!");
        toggleModal('registerModal');
    } catch (error) { alert("Erro: " + error.message); }
}

async function logarAtleta(e) {
    e.preventDefault();
    try {
        await signInWithEmailAndPassword(auth, e.target[0].value, e.target[1].value);
        alert("De volta ao jogo!");
        toggleModal('loginModal');
    } catch (error) { alert("Falha no login."); }
}

window.deslogar = function() {
    signOut(auth).then(() => {
        alert("Atleta fora de campo!");
        window.location.reload();
    });
};

// --- AJUSTE DE RESPONSIVIDADE ---
window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) {
        const menu = document.getElementById('mobileMenuModal');
        if (menu && !menu.classList.contains('hidden')) {
            toggleModal('mobileMenuModal');
        }
    }
});

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    fetchWeather();
    const regForm = document.querySelector('#registerModal form');
    const logForm = document.querySelector('#loginModal form');
    if (regForm) regForm.onsubmit = registrarAtleta;
    if (logForm) logForm.onsubmit = logarAtleta;
});