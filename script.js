/**
 * CONFIGURAÇÕES GERAIS E API
 * Para o clima funcionar, crie uma conta gratuita em: https://openweathermap.org/
 */
const API_CONFIG = {
  weatherKey: "0390abddc107b13d8002540d1dd10fc7", // Insira sua chave aqui
  units: "metric",
  lang: "pt_br"
};

// --- 1. LÓGICA DO CLIMA (OPENWEATHER API) ---
async function fetchWeather() {
  const weatherText = document.getElementById('temp');
  
  if (!navigator.geolocation) {
      weatherText.innerText = "GPS não suportado";
      return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      
      try {
          const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_CONFIG.weatherKey}&units=${API_CONFIG.units}&lang=${API_CONFIG.lang}`;
          const response = await fetch(url);
          const data = await response.json();

          if (response.ok) {
              // Atualiza o widget com Cidade, Temp e Ícone
              const iconUrl = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
              weatherText.innerHTML = `
                  <span>${data.name}: <strong>${Math.round(data.main.temp)}°C</strong></span>
                  <img src="${iconUrl}" alt="clima" class="w-6 h-6 inline-block">
              `;
          }
      } catch (error) {
          console.error("Erro na API de Clima:", error);
          weatherText.innerText = "Erro ao carregar";
      }
  }, () => {
      weatherText.innerText = "Acesso negado ao GPS";
  });
}

// --- 2. CONTROLE DE INTERFACE (MODAIS) ---
function toggleModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
      const isHidden = modal.classList.contains('hidden');
      // Fecha todos os outros modais abertos primeiro
      document.querySelectorAll('[id$="Modal"]').forEach(m => m.classList.add('hidden'));
      
      if (isHidden) {
          modal.classList.remove('hidden');
          modal.classList.add('flex');
      } else {
          modal.classList.add('hidden');
          modal.classList.remove('flex');
      }
  }
}

// --- 3. CADASTRO DE ATLETA (SALVAMENTO LOCAL) ---
function handleRegistration(event) {
  event.preventDefault(); // Impede a página de recarregar
  
  const formData = {
      email: event.target[0].value,
      senha: event.target[1].value,
      timeAtual: event.target[2].value,
      timeFavoritoNFL: event.target[3].value,
      dataCadastro: new Date().toLocaleDateString()
  };

  // Salva no LocalStorage (Banco de dados temporário do navegador)
  localStorage.setItem('atleta_dados', JSON.stringify(formData));
  
  alert(`Bem-vindo, Atleta! Seu perfil do ${formData.timeFavoritoNFL} foi criado.`);
  toggleModal('registerModal');
  atualizarPerfilNaTela(formData);
}

// --- 4. SISTEMA DE FILTRO DE CONTEÚDO (ABAS) ---
function filtrarConteudo(categoria) {
  const cards = document.querySelectorAll('.card-item'); // Adicione essa classe nos seus cards HTML
  
  cards.forEach(card => {
      if (categoria === 'todos' || card.dataset.tipo === categoria) {
          card.style.display = 'block';
          card.style.opacity = '1';
      } else {
          card.style.display = 'none';
      }
  });
}

// --- 5. INICIALIZAÇÃO AO CARREGAR A PÁGINA ---
document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicia o Clima
  fetchWeather();

  // 2. Verifica se o atleta já está logado
  const dadosSalvos = localStorage.getItem('atleta_dados');
  if (dadosSalvos) {
      const atleta = JSON.parse(dadosSalvos);
      console.log("Atleta logado:", atleta.email);
      // Aqui você poderia mudar o botão "Entrar" para "Meu Perfil"
  }

  // 3. Listener para o formulário de cadastro
  const regForm = document.querySelector('#registerModal form');
  if (regForm) {
      regForm.addEventListener('submit', handleRegistration);
  }
});