# [wayfinder:task] Otimização Extrema de Usabilidade e Formato Amigável no Celular (Mobile-First)

- **ID**: `T07`
- **Tipo**: `wayfinder:task`
- **Status**: Bloqueado por `T05`, `T06`
- **Bloqueia**: `T04`
- **Bloqueado por**: `T05`, `T06`

---

## Question

Como garantir que a experiência no smartphone (iOS e Android) seja fluida, rápida, amigável e com taxa máxima de conversão para pacientes no celular?

### Pontos de Decisão a Planejar:
1. **Ergonomia e Área de Toque (Thumb Zone)**:
   - Garantir que todos os botões e links tenham altura mínima de 48px e espaçamento adequado para toque sem erros.
   - Otimizar o botão flutuante de WhatsApp para não cobrir informações importantes ou botões de envio.
2. **Menu Mobile Acessível**:
   - Menu hambúrguer deslizante suave com links amplos e botão de WhatsApp em destaque total.
3. **Avaliador de Queixas no Mobile**:
   - Ajustar os botões de seleção de área (Lombar, Pós-Op, Neuro, Idoso, etc.) para grade de 2 colunas com padding tátil confortável no celular (360px a 430px de largura).
4. **Tipografia e Legibilidade Fluida**:
   - Ajustar tamanhos de títulos (`text-2xl` a `text-3xl` no mobile) para evitar quebras de linhas desarmônicas em telas compactas.
   - Espaçamento confortável entre parágrafos para leitura sem fadiga visual.
5. **Performance e Carregamento Rápido no 4G**:
   - Uso de imagens comprimidas e otimizadas com lazy-loading nativo (`loading="lazy"`).
