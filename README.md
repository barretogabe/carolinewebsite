# Site Oficial - Caroline • Fisioterapia & Pilates

Site institucional e de agendamento desenvolvido sob medida para a fisioterapeuta **Caroline**, com foco em acolhimento, autoridade profissional e conversão de pacientes via WhatsApp.

---

## 🌿 Características do Projeto

- **Identidade Visual & Cores**:
  - **Verde Sálvia (`#527363`)**: Equilíbrio, saúde, regeneração muscular e serenidade.
  - **Creme / Warm Sand (`#FAF7F2`)**: Fundo acolhedor e aconchegante, sem o aspecto impessoal de hospitais.
  - **Branco Puro (`#FFFFFF`)**: Limpeza visual nos cards e destaques de fotos.
  - **Verde Floresta Nobre (`#1E3127`)**: Títulos e textos com alto contraste e legibilidade.
- **Tipografia**: *Playfair Display* (serifada elegante nos títulos) e *Plus Jakarta Sans* (moderna e humanista nos textos).
- **Ferramenta Interativa Exclusiva (Avaliador de Queixas & Triagem)**:
  - O paciente clica na região onde sente dor ou seu objetivo (Lombar, Cervical, Ombros, Joelhos, Postura, Pilates Geral).
  - Seleciona há quanto tempo sente e observações extras.
  - O site recomenda o protocolo ideal e gera um botão com **mensagem pronta formatada para o WhatsApp** da Caroline!
- **100% Responsivo**: Otimizado para smartphones (iOS/Android), tablets e desktops.
- **Seções Completas**:
  - Hero com proposta de valor e botões de chamada rápida.
  - Sobre Caroline (história, valores, foto e formação).
  - Especialidades com fotos (Pilates Clínico em Aparelhos, Reabilitação Ortopédica, Dores na Coluna, Gestantes, Terapia Manual, Terceira Idade).
  - O Espaço (aparelhos Reformer/Cadillac, ambiente climatizado).
  - Depoimentos reais de pacientes.
  - Perguntas Frequentes (FAQ) interativo.
  - Endereço, mapa interativo incorporado, horário de atendimento e botão de WhatsApp flutuante.

---

## 🚀 Como Visualizar o Site

Você pode abrir o arquivo `index.html` diretamente em qualquer navegador (Chrome, Safari, Edge, Firefox):

1. Dê um duplo clique no arquivo `index.html` na pasta do projeto;
2. Ou inicie um servidor local se preferir (ex: com Python ou Node):
   ```bash
   python3 -m http.server 8000
   ```
   e acesse `http://localhost:8000`.

---

## ✏️ Como Personalizar

### 1. Alterar Número do WhatsApp, Nome e Instagram
Abra o arquivo [`app.js`](file:///Users/gabrielbarreto/Documents/Site%20Caroline/app.js) e edite as primeiras linhas:
```javascript
const CLINIC_CONFIG = {
  whatsappNumber: "5511999999999", // Coloque o DDD + Número real da Caroline
  therapistName: "Caroline",
  instagramHandle: "@caroline.fisiopilates",
  cityState: "Sua Cidade - UF"
};
```

### 2. Alterar Endereço e Horários
No arquivo [`index.html`](file:///Users/gabrielbarreto/Documents/Site%20Caroline/index.html), busque pela seção `#localizacao` e edite os textos de endereço e horário de funcionamento.

### 3. Substituir Fotos Pelas Fotos Reais da Caroline
Para colocar as fotos reais do estúdio e da Caroline:
- Salve as fotos na pasta do projeto (ou em uma pasta `assets/`).
- No `index.html`, substitua os links `src="..."` das tags `<img>` pelos nomes dos arquivos locais (ex: `src="caroline-perfil.jpg"`).
