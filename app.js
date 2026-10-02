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
    title: "Recomendação Personalizada: Pilates em Casa ou em Grupo & Domiciliar",
    subtitle: "Aulas Particulares em Casa, Vivências e Grupos em Eventos",
    description: "Levamos toda a estrutura do método Pilates e fisioterapia até você: seja para aulas particulares no conforto do seu lar, grupos de amigos/família ou eventos corporativos em Paulista, Olinda e região.",
    whatsappTag: "Pilates em Casa ou em Grupo"
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
// 4. LÓGICA DO AVALIADOR DE QUEIXAS & PRÉ-AVALIAÇÃO (TRIAGEM + ANAMNESE)
// ==========================================
let currentSelectedArea = "domicilio";
let currentSelectedTime = "pouco";
let currentPainLevel = 0;

const PAIN_LABELS = {
  0: "0/10 • Sem dor (Prevenção / Pilates)",
  1: "1/10 • Desconforto muito leve",
  2: "2/10 • Desconforto leve",
  3: "3/10 • Dor leve a moderada",
  4: "4/10 • Dor moderada",
  5: "5/10 • Dor moderada marcante",
  6: "6/10 • Dor persistente / incômoda",
  7: "7/10 • Dor intensa",
  8: "8/10 • Dor muito intensa",
  9: "9/10 • Dor severa / quase insuportável",
  10: "10/10 • Dor máxima / insuportável"
};

function getPainBadgeColor(level) {
  if (level === 0) return "bg-emerald-500/20 text-emerald-300 border-emerald-400/30";
  if (level <= 3) return "bg-emerald-600/25 text-emerald-200 border-emerald-500/40";
  if (level <= 6) return "bg-amber-500/25 text-amber-200 border-amber-400/40";
  if (level <= 8) return "bg-orange-500/25 text-orange-200 border-orange-400/40";
  return "bg-rose-500/25 text-rose-200 border-rose-400/40";
}

function initTriageEngine() {
  const areaButtons = document.querySelectorAll("#area-options .triage-btn");
  const timeButtons = document.querySelectorAll("#time-options .triage-time-btn");
  const painSlider = document.getElementById("pain-slider");
  const painButtons = document.querySelectorAll("#pain-buttons-container .pain-scale-btn");
  const painBadge = document.getElementById("pain-badge");
  const nameInput = document.getElementById("user-name");
  const phoneInput = document.getElementById("user-phone");
  const notesInput = document.getElementById("user-notes");
  const historyInput = document.getElementById("user-history");
  const whatsappBtn = document.getElementById("whatsapp-triage-btn");

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

  // Slider de Rolagem de Dor (EVA 0 a 10)
  if (painSlider) {
    painSlider.addEventListener("input", (e) => {
      const val = parseInt(e.target.value, 10);
      setPainLevel(val);
    });
  }

  // Botões Numéricos da Escala de Dor
  painButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const val = parseInt(btn.getAttribute("data-pain"), 10);
      setPainLevel(val);
    });
  });

  function setPainLevel(val) {
    currentPainLevel = val;
    if (painSlider) painSlider.value = val;
    
    // Atualiza botões
    painButtons.forEach(btn => {
      const bVal = parseInt(btn.getAttribute("data-pain"), 10);
      if (bVal === val) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Atualiza badge de dor
    if (painBadge) {
      painBadge.textContent = PAIN_LABELS[val] || `${val}/10`;
      painBadge.className = `px-3 py-1 rounded-full text-xs font-bold border transition-colors ${getPainBadgeColor(val)}`;
    }

    renderTriageResult();
  }

  // Inputs de Texto
  [nameInput, phoneInput, notesInput, historyInput].forEach(inp => {
    if (inp) {
      inp.addEventListener("input", () => {
        renderTriageResult();
      });
    }
  });

  // Botão de Envio para WhatsApp com validação humanizada
  if (whatsappBtn) {
    whatsappBtn.addEventListener("click", () => {
      const name = nameInput ? nameInput.value.trim() : "";
      
      if (!name) {
        if (nameInput) {
          nameInput.focus();
          nameInput.classList.add("ring-2", "ring-emerald-400", "border-emerald-400");
          setTimeout(() => {
            nameInput.classList.remove("ring-2", "ring-emerald-400");
          }, 2500);
        }
        alert("Por favor, digite seu nome completo acima para que a Dra. Caroline possa te atender pessoalmente.");
        return;
      }

      const whatsappUrl = generateWhatsAppTriageUrl();
      window.open(whatsappUrl, "_blank");
    });
  }

  // Links dos Cards de Especialidades (acionam a triagem automaticamente)
  const specialtyLinks = document.querySelectorAll("[data-select-area]");
  specialtyLinks.forEach(link => {
    link.addEventListener("click", () => {
      const area = link.getAttribute("data-select-area");
      const targetBtn = document.querySelector(`#area-options .triage-btn[data-area="${area}"]`);
      if (targetBtn) {
        targetBtn.click();
      }
    });
  });

  // Render inicial
  renderTriageResult();
}

function generateWhatsAppTriageUrl() {
  const data = TRIAGE_DATA[currentSelectedArea] || TRIAGE_DATA["domicilio"];
  const timeLabel = TIME_LABELS[currentSelectedTime] || "fase inicial";
  const nameInput = document.getElementById("user-name");
  const phoneInput = document.getElementById("user-phone");
  const notesInput = document.getElementById("user-notes");
  const historyInput = document.getElementById("user-history");

  const name = nameInput ? nameInput.value.trim() : "";
  const phone = phoneInput ? phoneInput.value.trim() : "";
  const notes = notesInput ? notesInput.value.trim() : "";
  const history = historyInput ? historyInput.value.trim() : "";
  const painLabel = PAIN_LABELS[currentPainLevel] || `${currentPainLevel}/10`;

  let message = `📋 *TRIAGEM RÁPIDA & PRÉ-AVALIAÇÃO*\n`;
  message += `_Dra. Caroline Melo • Fisioterapia & Pilates (CREFITO 315194-F)_\n\n`;
  
  if (name) {
    message += `👤 *Paciente:* ${name}\n`;
  }
  if (phone) {
    message += `📱 *WhatsApp/Contato:* ${phone}\n`;
  }
  message += `🎯 *Especialidade / Foco:* ${data.whatsappTag}\n`;
  message += `⏱️ *Tempo / Fase:* ${timeLabel}\n`;
  message += `⚡ *Nível de Dor/Desconforto:* ${painLabel}\n`;

  if (notes) {
    message += `\n🩺 *Queixa Principal / Objetivo:*\n"${notes}"\n`;
  }
  if (history) {
    message += `🏥 *Histórico / Cirurgia Prévia:*\n"${history}"\n`;
  }

  message += `\nOlá, Dra. Caroline! Preenchi minhas informações na triagem do site e gostaria de agendar uma avaliação.`;

  return `https://wa.me/${CLINIC_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function renderTriageResult() {
  const data = TRIAGE_DATA[currentSelectedArea] || TRIAGE_DATA["domicilio"];
  const titleEl = document.getElementById("result-title");
  const subtitleEl = document.getElementById("result-subtitle");
  const descEl = document.getElementById("result-description");

  if (titleEl) titleEl.textContent = data.title;
  if (subtitleEl) subtitleEl.textContent = data.subtitle;
  if (descEl) descEl.textContent = data.description;
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
