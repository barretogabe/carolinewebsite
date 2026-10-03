/**
 * CAROLINE MELO FISIOTERAPIA • WEBSITE OFICIAL
 * Configuração Centralizada de Negócio & Scripts da Aplicação
 * Domínio: https://carolinemelofisio.com.br
 */

// ==========================================
// 1. CONFIGURAÇÃO CENTRALIZADA (Fonte de Verdade)
// ==========================================
const businessConfig = {
  businessName: "Caroline Melo Fisioterapia",
  brandHeading: "Caroline Melo | Fisioterapia e Pilates",
  shortName: "Caroline Melo Fisio",
  professionalName: "Caroline Melo",
  crefito: "315194-F",
  phone: "(81) 98834-5003",
  whatsappNumber: "5581988345003",
  email: "carolinemelo.fisio@hotmail.com", // NÃO ALTERAR (Regra Absoluta)
  instagramHandle: "@melscarol",
  instagramUrl: "https://instagram.com/melscarol",
  domain: "https://carolinemelofisio.com.br",
  address: {
    street: "Av. Dr. Cláudio José Gueiros Leite",
    number: "571",
    room: "Sala 14",
    neighborhood: "Janga",
    city: "Paulista",
    state: "PE",
    country: "BR",
    fullAddress: "Av. Dr. Cláudio José Gueiros Leite, nº 571, Sala 14, Janga, Paulista - PE",
    mapsUrl: "https://maps.google.com/?q=Av.+Dr.+Cl%C3%A1udio+Jos%C3%A9+Gueiros+Leite,+571,+Sala+14,+Janga,+Paulista+-+PE"
  },
  serviceAreas: {
    clinical: "Av. Dr. Cláudio José Gueiros Leite, nº 571, Sala 14, Janga, Paulista - PE",
    domiciliar: "Paulista, Olinda e região (sob consulta)",
    eventos: "Localização definida conforme cada evento"
  },
  // Mensagens contextuais para WhatsApp (Item 23 da especificação)
  whatsappMessages: {
    geral: "Olá, Caroline! Encontrei seu site e gostaria de informações sobre atendimento fisioterapêutico.",
    neurofuncional: "Olá, Caroline! Vi no seu site o atendimento de Fisioterapia Neurofuncional e gostaria de mais informações.",
    pessoa_idosa: "Olá, Caroline! Gostaria de informações sobre atendimento fisioterapêutico para pessoa idosa.",
    pos_operatorio: "Olá, Caroline! Gostaria de informações sobre acompanhamento fisioterapêutico no pós-operatório.",
    traumato_ortopedia: "Olá, Caroline! Gostaria de informações sobre atendimento fisioterapêutico traumato-ortopédico.",
    domiciliar: "Olá, Caroline! Gostaria de informações sobre atendimento fisioterapêutico domiciliar.",
    pilates_clinico: "Olá, Caroline! Vi no site as informações sobre Pilates Clínico no Janga e gostaria de saber mais.",
    pilates_eventos: "Olá, Caroline! Gostaria de informações sobre Pilates para um evento."
  }
};

// ==========================================
// 2. HELPER CONDICIONAL DE ANALYTICS (GA4 & TRACKING ÉTICO)
// ==========================================
// O Analytics só executa se window.GA_MEASUREMENT_ID for configurado externamente.
// JAMAIS envia dados de saúde, nomes, dores ou respostas de formulário.
function trackEvent(eventName, params = {}) {
  try {
    // Sanitização rigorosa: garantir que nenhuma resposta clínica seja enviada
    const safeParams = {};
    const allowedKeys = ["service", "method", "location", "source", "event_category"];
    Object.keys(params).forEach(k => {
      if (allowedKeys.includes(k) && typeof params[k] === "string") {
        safeParams[k] = params[k];
      }
    });

    if (typeof window.gtag === "function" && window.GA_MEASUREMENT_ID) {
      window.gtag("event", eventName, safeParams);
    }
  } catch (e) {
    // Falha silenciosa para não quebrar a navegação
  }
}

// ==========================================
// 3. GERADOR DE LINK WHATSAPP CONTEXTUAL
// ==========================================
function getContextualWhatsAppUrl(serviceKey = "geral") {
  const msg = businessConfig.whatsappMessages[serviceKey] || businessConfig.whatsappMessages.geral;
  return `https://wa.me/${businessConfig.whatsappNumber}?text=${encodeURIComponent(msg)}`;
}

// ==========================================
// 4. DADOS DO AVALIADOR INTERATIVO DE QUEIXAS (TRIAGEM)
// ==========================================
const TRIAGE_DATA = {
  "domicilio": {
    title: "Recomendação: Atendimento Domiciliar / Pilates",
    subtitle: "Atendimento no Conforto do Lar ou em Grupos",
    description: "Levamos a assistência fisioterapêutica e o método Pilates até você em Paulista, Olinda e região. Ideal para idosos, pós-operatório recente ou praticantes particulares.",
    whatsappTag: "Atendimento Domiciliar / Pilates em Casa",
    serviceKey: "domiciliar"
  },
  "pilates": {
    title: "Recomendação: Pilates Clínico no Estúdio",
    subtitle: "Aparelhos Clássicos, Alinhamento Postural e Força do Core",
    description: "Sessões no estúdio na Av. Dr. Cláudio José Gueiros Leite, nº 571, Sala 14. Aparelhos completos (Reformer, Cadillac, Barrel, Chair) conduzidos individualmente por fisioterapeuta.",
    whatsappTag: "Pilates Clínico no Janga",
    serviceKey: "pilates_clinico"
  },
  "neurofuncional": {
    title: "Recomendação: Fisioterapia Neurofuncional",
    subtitle: "Reabilitação Motora, Equilíbrio e Plasticidade Neural",
    description: "Atendimento voltado para a recuperação funcional em quadros neurológicos (sequelas de AVC, Parkinson, neuropatias e disfunções neuromotoras). Foco em autonomia e mobilidade.",
    whatsappTag: "Fisioterapia Neurofuncional",
    serviceKey: "neurofuncional"
  },
  "pos-operatorio": {
    title: "Recomendação: Pós-Operatório de Cirurgia Plástica",
    subtitle: "Drenagem Linfática Especializada + Taping + Manejo Tecidual",
    description: "Acompanhamento individualizado durante o processo de recuperação pós-operatória. Cuidados com edema, tecido cicatricial e retorno suave à funcionalidade com segurança clínica.",
    whatsappTag: "Pós-Operatório",
    serviceKey: "pos_operatorio"
  },
  "idoso": {
    title: "Recomendação: Fisioterapia da Pessoa Idosa",
    subtitle: "Gerontologia Funcional, Prevenção de Quedas e Autonomia",
    description: "Cuidado voltado à mobilidade, equilíbrio, força e autonomia. Pode ser realizado no estúdio ou com a comodidade do Atendimento a Domicílio para maior segurança.",
    whatsappTag: "Fisioterapia da Pessoa Idosa",
    serviceKey: "pessoa_idosa"
  },
  "traumato-ortopedia": {
    title: "Recomendação: Fisioterapia Traumato-Ortopédica",
    subtitle: "Reabilitação da Coluna, Ombros, Joelhos e Lesões Musculares",
    description: "Avaliação e tratamento de alterações musculoesqueléticas, dores articulares e na coluna. Planejamento terapêutico individualizado focado no alívio e na função.",
    whatsappTag: "Fisioterapia Traumato-Ortopédica",
    serviceKey: "traumato_ortopedia"
  }
};

const TIME_LABELS = {
  pouco: "menos de 1 mês (fase recente)",
  medio: "de 1 a 6 meses",
  cronico: "há mais de 6 meses (crônico)"
};

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

// ==========================================
// 5. INICIALIZAÇÃO E EVENTOS
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  initYear();
  initMobileMenu();
  initFaqAccordion();
  initTriageEngine();
  bindTrackingEvents();
});

function initYear() {
  const yearElement = document.getElementById("current-year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

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

function initFaqAccordion() {
  const triggers = document.querySelectorAll(".faq-trigger");
  triggers.forEach(trigger => {
    trigger.addEventListener("click", () => {
      const content = trigger.nextElementSibling;
      const isOpen = !content.classList.contains("hidden");

      document.querySelectorAll(".faq-content").forEach(item => item.classList.add("hidden"));
      document.querySelectorAll(".faq-trigger").forEach(btn => btn.classList.remove("open"));

      if (!isOpen) {
        content.classList.remove("hidden");
        trigger.classList.add("open");
      }
    });
  });
}

// Gerenciamento da Triagem
let currentSelectedArea = "domicilio";
let currentSelectedTime = "pouco";
let currentPainLevel = 0;

function initTriageEngine() {
  const areaButtons = document.querySelectorAll(".triage-btn");
  const timeButtons = document.querySelectorAll(".triage-time-btn");
  const whatsappBtn = document.getElementById("whatsapp-triage-btn");
  const slider = document.getElementById("pain-slider");
  const painButtons = document.querySelectorAll(".pain-scale-btn");
  const painBadge = document.getElementById("pain-badge");
  const painInput = document.getElementById("selected-pain-level");

  if (!areaButtons.length && !slider) return;

  function setPainLevel(level) {
    currentPainLevel = parseInt(level, 10);
    if (slider) slider.value = currentPainLevel;
    if (painInput) painInput.value = currentPainLevel;

    painButtons.forEach(btn => {
      if (parseInt(btn.getAttribute("data-pain"), 10) === currentPainLevel) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    if (painBadge) {
      painBadge.textContent = PAIN_LABELS[currentPainLevel] || `Nível ${currentPainLevel}`;
      if (currentPainLevel === 0) {
        painBadge.className = "px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30";
      } else if (currentPainLevel <= 4) {
        painBadge.className = "px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30";
      } else {
        painBadge.className = "px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-400/30";
      }
    }
  }

  if (slider) {
    slider.addEventListener("input", (e) => setPainLevel(e.target.value));
  }

  painButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      setPainLevel(btn.getAttribute("data-pain"));
    });
  });

  areaButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      areaButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentSelectedArea = btn.getAttribute("data-area");
      renderTriageResult();
      trackEvent("triage_start", { service: currentSelectedArea });
    });
  });

  timeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      timeButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentSelectedTime = btn.getAttribute("data-time");
    });
  });

  // Gatilhos externos para pré-selecionar especialidade
  document.querySelectorAll("[data-select-area]").forEach(trigger => {
    trigger.addEventListener("click", (e) => {
      const area = trigger.getAttribute("data-select-area");
      const targetBtn = document.querySelector(`.triage-btn[data-area="${area}"]`);
      if (targetBtn) {
        areaButtons.forEach(b => b.classList.remove("active"));
        targetBtn.classList.add("active");
        currentSelectedArea = area;
        renderTriageResult();
      }
    });
  });

  if (whatsappBtn) {
    whatsappBtn.addEventListener("click", () => {
      const nameInput = document.getElementById("user-name");
      const name = nameInput ? nameInput.value.trim() : "";
      if (!name) {
        if (nameInput) {
          nameInput.focus();
          nameInput.classList.add("border-rose-400");
          setTimeout(() => nameInput.classList.remove("border-rose-400"), 2000);
        }
        alert("Por favor, informe seu nome para que a Dra. Caroline possa te identificar no atendimento.");
        return;
      }

      // Registro do evento analítico (sem dados de saúde)
      trackEvent("triage_complete", { service: currentSelectedArea });
      const targetUrl = generateWhatsAppTriageUrl();
      window.open(targetUrl, "_blank");
    });
  }

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
  message += `_Caroline Melo Fisioterapia (CREFITO 315194-F)_\n\n`;
  
  if (name) message += `👤 *Paciente:* ${name}\n`;
  if (phone) message += `📱 *WhatsApp/Contato:* ${phone}\n`;
  message += `🎯 *Especialidade / Foco:* ${data.whatsappTag}\n`;
  message += `⏱️ *Tempo / Fase:* ${timeLabel}\n`;
  message += `⚡ *Nível de Dor/Desconforto:* ${painLabel}\n`;

  if (notes) message += `\n🩺 *Queixa Principal / Objetivo:*\n"${notes}"\n`;
  if (history) message += `🏥 *Histórico Relevante:*\n"${history}"\n`;

  message += `\nOlá, Caroline! Preenchi minhas informações na triagem do site e gostaria de agendar uma avaliação.`;

  return `https://wa.me/${businessConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
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

// Binds de Tracking nos Elementos Interativos
function bindTrackingEvents() {
  document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
    link.addEventListener("click", () => {
      const service = link.getAttribute("data-service") || "geral";
      trackEvent("whatsapp_click", { service: service });
    });
  });

  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener("click", () => {
      trackEvent("phone_click");
    });
  });

  document.querySelectorAll('a[href*="instagram.com"]').forEach(link => {
    link.addEventListener("click", () => {
      trackEvent("instagram_click");
    });
  });

  document.querySelectorAll('a[href*="maps.google.com"]').forEach(link => {
    link.addEventListener("click", () => {
      trackEvent("maps_click");
    });
  });

  document.querySelectorAll('[data-service-view]').forEach(item => {
    item.addEventListener("click", () => {
      trackEvent("service_view", { service: item.getAttribute("data-service-view") });
    });
  });

  document.querySelectorAll('[data-event="pilates_event_click"]').forEach(item => {
    item.addEventListener("click", () => {
      trackEvent("pilates_event_click", { service: "pilates_eventos" });
    });
  });
}
