# 🎙️ Estúdio de Voz Neural TTS (.mp3)

Programa moderno em HTML com processamento local em Python que transforma documentos e textos em fala humana fluída e realista, exportando o áudio diretamente em formato **.mp3** (192 kbps estúdio).

---

## ✨ Funcionalidades

- **Saída em Áudio .mp3:** Gera arquivos de áudio padronizados em `.mp3` compatíveis com qualquer reprodutor, celular ou editor.
- **Pausa Natural em Palavras entre Parênteses:** Identifica automaticamente palavras ou termos entre `(...)` e insere uma pequena pausa/respiração natural antes de ler o seu conteúdo.
- **Anúncio de Tópicos e Subtópicos:** Identifica e verbaliza numerações como `1.`, `1.2`, `1.3`, `a)`, `b)` antes de narrar o conteúdo correspondente.
- **Execução 100% Local (Ultra Rápida):**
  - **⚡ Faber (Brasil) — Piper Neural:** Voz neural que roda localmente no chip Apple Silicon do Mac sem gastar internet e sem latência de rede (~1.3s de processamento).
  - **🍏 Luciana / Joana — Apple CoreAudio:** Processamento instantâneo via utilitário nativo do macOS (~0.7s).
- **Vozes em Nuvem (Opcional):** Acesso às vozes de estúdio da Microsoft (Francisca, Antônio, etc.).
- **Leitura de Documentos:** Arraste ou selecione arquivos **.pdf**, **.txt** ou **.md**.
- **Controle de Fala:** Ajuste de velocidade da fala (0.5x até 1.8x).

---

## 🚀 Como Iniciar

1. Abra a pasta `gerador-tts-mp4` no **Finder**.
2. Dê dois cliques no arquivo **`iniciar.command`**.
3. O programa abrirá automaticamente no seu navegador padrão (`http://localhost:5055`).
