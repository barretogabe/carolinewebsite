/**
 * DRA. CAROLINE MELO • FISIOTERAPIA & PILATES
 * Script Principal da Aplicação
 * Gerencia a Ferramenta Interativa de Triagem, Menu Mobile, FAQ e Links Dinâmicos
 */

// ==========================================
// 1. CONFIGURAÇÕES PRINCIPAIS (Dados Oficiais)
// ==========================================
const CLINIC_CONFIG = {
  // WhatsApp oficial: (81) 98834-5003
  whatsappNumber: "5581988345003",
  
  // Nome e Registro da profissional
  therapistName: "Dra. Caroline Melo",
  therapistTitle: "Fisioterapeuta",

  // Redes e Localização Oficial
  instagramHandle: "@melscarol",
  instagramUrl: "https://instagram.com/melscarol",
  address: "Av. Dr. José Cláudio Gueiros Leite, 571",
  neighborhood: "Janga",
  cityState: "Paulista - PE",
};

// ==========================================
// 2. DADOS DO AVALIADOR INTERATIVO DE QUEIXAS
// ==========================================
const TRIAGE_DATA = {
  "pos-operatorio": {
    title: "Recomendação Personalizada: Pós-Operatório de Cirurgia Plástica",
    subtitle: "Drenagem Linfática Especializada + Taping + Manejo Tecidual",
    description: "Para pacientes em recuperação pós-cirúrgica (lipoaspiração, abdominoplastia, mamoplastia), o acompanhamento fisioterapêutico especializado reduz edemas, previne fibroses, acelera a cicatrização tecidual e devolve o conforto e a mobilidade de forma suave e segura.",
    whatsappTag: "Pós-Operatório de Cirurgia Plástica"
  },
  "neurofuncional": {
    title: "Recomendação Personalizada: Fisioterapia Neurofuncional",
    subtitle: "Reabilitação Motora, Equilíbrio e Plasticidade Neural",
    description: "Atendimento voltado para a recuperação funcional em quadros neurológicos (sequelas de AVC, Parkinson, neuropatias e disfunções neuromotoras). Focamos no resgate do controle motor, marcha, equilíbrio e máxima autonomia para as atividades diárias.",
    whatsappTag: "Fisioterapia Neurofuncional"
  },
  "idoso": {
    title: "Recomendação Personalizada: Fisioterapia da Pessoa Idosa",
    subtitle: "Geriatria Funcional, Prevenção de Quedas e Autonomia",
    description: "Trabalho cuidadoso focado no fortalecimento muscular global, estabilidade articular, treino de equilíbrio e mobilidade. Pode ser realizado no estúdio ou com a comodidade do Atendimento a Domicílio para maior conforto e segurança da família.",
    whatsappTag: "Fisioterapia da Pessoa Idosa"
  },
  "traumato-ortopedia": {
    title: "Recomendação Personalizada: Traumato-Ortopedia & Dores Articulares",
    subtitle: "Reabilitação da Coluna, Ombros, Joelhos e Lesões Musculares",
    description: "Abordagem precisa para hérnias de disco, dores na coluna (lombalgia/cervicalgia), tendinites e recuperação pós-fratura. Combinamos terapia manual descompressiva e cinesioterapia baseada em evidências para eliminar a dor.",
    whatsappTag: "Fisioterapia Traumato-Ortopédica"
  },
  "domicilio": {
    title: "Recomendação Personalizada: Pilates em Casa & Atendimento Domiciliar",
    subtitle: "Aulas Personalizadas e Reabilitação no Conforto do Seu Lar",
    description: "Levamos toda a estrutura fisioterapêutica e do método Pilates até a sua casa em Paulista, Olinda e região. Perfeito para quem busca praticidade, reabilitação personalizada ou aulas de Pilates no conforto e privacidade do próprio lar.",
    whatsappTag: "Pilates em Casa / Domiciliar"
  },
  "pilates": {
    title: "Recomendação Personalizada: Pilates no Estúdio",
    subtitle: "Aparelhos Clássicos, Alinhamento Postural e Força do Core",
    description: "Sessões no estúdio da Av. Dr. José Cláudio Gueiros Leite, 571. Aparelhos completos (Reformer, Cadillac, Barrel, Chair) conduzidos por fisioterapeuta para ganho de flexibilidade, postura impecável e condicionamento sem impacto nas articulações.",
    whatsappTag: "Pilates em Estúdio"
  }
};

const TIME_LABELS = {
  pouco: "menos de 1 mês (fase recente)",
  medio: "de 1 a 6 meses",
  cronico: "há mais de 6 meses (crônico)"
};

// ==========================================
// 3. INICIALIZAÇÃO E EVENTOS
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  initYear();
  initMobileMenu();
  initFaqAccordion();
  initTriageEngine();
  updateAllWhatsAppLinks();
});

// Atualiza o ano no rodapé automaticamente
function initYear() {
  const yearElement = document.getElementById("current-year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

// Menu Mobile
function initMobileMenu() {
  const menuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  const navLinks = document.querySelectorAll(".mobile-nav-link");

  if (!menuBtn || !mobileMenu) return;

  menuBtn.addEventListener("click", () => {
    const isHidden = mobileMenu.classList.contains("hidden");
    if (isHidden) {
      mobileMenu.classList.remove("hidden");
      menuBtn.innerHTML = '<i class="fas fa-xmark text-xl"></i>';
    } else {
      mobileMenu.classList.add("hidden");
      menuBtn.innerHTML = '<i class="fas fa-bars text-xl"></i>';
    }
  });

  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      mobileMenu.classList.add("hidden");
      menuBtn.innerHTML = '<i class="fas fa-bars text-xl"></i>';
    });
  });
}

// Acordeão de Perguntas Frequentes
function initFaqAccordion() {
  const triggers = document.querySelectorAll(".faq-trigger");

  triggers.forEach(trigger => {
    trigger.addEventListener("click", () => {
      const content = trigger.nextElementSibling;
      const isOpen = !content.classList.contains("hidden");

      // Fecha outros itens para manter elegância
      document.querySelectorAll(".faq-content").forEach(item => item.classList.add("hidden"));
      document.querySelectorAll(".faq-trigger").forEach(btn => btn.classList.remove("open"));

      if (!isOpen) {
        content.classList.remove("hidden");
        trigger.classList.add("open");
      }
    });
  });
}

// ==========================================
// 4. LÓGICA DO AVALIADOR DE QUEIXAS (TRIAGEM)
// ==========================================
let currentSelectedArea = "pos-operatorio";
let currentSelectedTime = "pouco";

function initTriageEngine() {
  const areaButtons = document.querySelectorAll("#area-options .triage-btn");
  const timeButtons = document.querySelectorAll("#time-options .triage-time-btn");
  const notesInput = document.getElementById("user-notes");

  // Botões de Área
  areaButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      areaButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentSelectedArea = btn.getAttribute("data-area");
      renderTriageResult();
    });
  });

  // Botões de Tempo
  timeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      timeButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentSelectedTime = btn.getAttribute("data-time");
      renderTriageResult();
    });
  });

  // Input de Observação
  if (notesInput) {
    notesInput.addEventListener("input", () => {
      renderTriageResult();
    });
  }

  // Render inicial
  renderTriageResult();
}

function renderTriageResult() {
  const data = TRIAGE_DATA[currentSelectedArea] || TRIAGE_DATA["pos-operatorio"];
  const titleEl = document.getElementById("result-title");
  const subtitleEl = document.getElementById("result-subtitle");
  const descEl = document.getElementById("result-description");
  const btnWhatsApp = document.getElementById("whatsapp-triage-btn");
  const notesInput = document.getElementById("user-notes");

  if (titleEl) titleEl.textContent = data.title;
  if (subtitleEl) subtitleEl.textContent = data.subtitle;
  if (descEl) descEl.textContent = data.description;

  const extraNotes = notesInput ? notesInput.value.trim() : "";
  const timeLabel = TIME_LABELS[currentSelectedTime] || "algum tempo";

  // Montagem da mensagem personalizada para o WhatsApp
  let message = `Olá, ${CLINIC_CONFIG.therapistName}! Fiz a triagem no seu site:\n\n`;
  message += `• Foco/Especialidade: *${data.whatsappTag}*\n`;
  message += `• Duração/Fase: *${timeLabel}*\n`;
  if (extraNotes) {
    message += `• Detalhes: "${extraNotes}"\n`;
  }
  message += `\nGostaria de informações sobre disponibilidade para avaliação/agendamento!`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${CLINIC_CONFIG.whatsappNumber}?text=${encodedMessage}`;

  if (btnWhatsApp) {
    btnWhatsApp.href = whatsappUrl;
  }
}

// Atualiza todos os links estáticos de WhatsApp com o número oficial
function updateAllWhatsAppLinks() {
  const allLinks = document.querySelectorAll('a[href*="wa.me"]');
  allLinks.forEach(link => {
    const currentUrl = new URL(link.href);
    const textParam = currentUrl.searchParams.get("text") || `Olá, ${CLINIC_CONFIG.therapistName}! Gostaria de agendar uma consulta.`;
    link.href = `https://wa.me/${CLINIC_CONFIG.whatsappNumber}?text=${encodeURIComponent(textParam)}`;
  });
}
