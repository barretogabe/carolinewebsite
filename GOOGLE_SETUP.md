# Guia de Ativação e Integração Google — Caroline Melo Fisioterapia

Este documento reúne todas as orientações práticas para quando você desejar ativar as ferramentas do ecossistema Google para o site **Caroline Melo Fisioterapia** (`https://carolinemelofisio.com.br`).

> [!IMPORTANT]
> O código do site já está 100% preparado tecnicamente com:
> - Domínio canônico configurado em todas as páginas;
> - `sitemap.xml` e `robots.txt` ativos;
> - Redirecionamento 301 de `carolinemelofisio.vercel.app` e `www` para `https://carolinemelofisio.com.br`;
> - Schema.org estruturado (`LocalBusiness` e `Person`);
> - Camada de eventos e Analytics condicional pronta (que não dispara nem gera erros sem o ID configurado).

---

## 1. Google Search Console (Indexação e Desempenho de Pesquisa)

O **Search Console** é a ferramenta oficial e gratuita do Google que monitora a presença do site nas buscas e relata quais palavras-chave atraem visitantes.

### Passo a passo para conectar:
1. Acesse: [search.google.com/search-console](https://search.google.com/search-console)
2. Faça login com a conta Google da clínica ou a sua conta pessoal.
3. Clique em **Adicionar Propriedade**:
   - **Opção Recomendada (Prefixo do URL)**: Digite `https://carolinemelofisio.com.br` e clique em *Continuar*.
4. **Verificação da Propriedade**:
   - **Método por Tag HTML**: O Google fornecerá uma tag meta como:
     ```html
     <meta name="google-site-verification" content="SEU_CODIGO_AQUI" />
     ```
   - Basta colar esse código na seção `<head>` do `index.html` (ou nos solicitar para adicionar) e clicar em **Verificar** no Google.
5. **Envio do Sitemap**:
   - No menu lateral esquerdo do Search Console, clique em **Sitemaps**.
   - No campo "Adicionar um novo sitemap", digite: `sitemap.xml`
   - Clique em **Enviar**. O Google confirmará o processamento das 9 páginas públicas do site.

---

## 2. Google Analytics 4 (GA4)

O site já possui um helper de telemetria ética (`trackEvent`) implementado em `app.js`. Ele foi desenvolvido para:
- Só carregar quando você definir o seu ID de Medição (Measurement ID);
- **Nunca capturar ou enviar dados sensíveis de saúde** (nomes, dores, diagnósticos ou respostas de formulário jamais saem do navegador).

### Como ativar quando criar a conta:
1. Acesse [analytics.google.com](https://analytics.google.com) e crie uma propriedade para **Caroline Melo Fisioterapia**.
2. Adicione um **Fluxo de dados da Web** com o endereço `https://carolinemelofisio.com.br`.
3. Você receberá um código no formato: `G-XXXXXXXXXX`.
4. Para ativar no site, basta adicionar no `<head>` do `index.html`:
   ```html
   <!-- Google Analytics 4 (Ativar apenas quando tiver a conta) -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script>
     window.GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX', { anonymize_ip: true });
   </script>
   ```

### Eventos Comportamentais já Mapeados no Código:
- `whatsapp_click`: Clique em botões de agendamento no WhatsApp (registra o serviço clicado, ex: `pilates_clinico`, `domiciliar`, `neurofuncional`, etc.).
- `phone_click`: Clique no telefone para chamada direta.
- `instagram_click`: Clique no link do Instagram `@melscarol`.
- `maps_click`: Clique para abrir rotas no Google Maps.
- `triage_start`: Seleção de especialidade na Triagem Rápida.
- `triage_complete`: Clique final para enviar a triagem via WhatsApp.
- `service_view`: Navegação para páginas dedicadas de serviços.
- `pilates_event_click`: Clique de interesse em Pilates para Eventos.

---

## 3. Google Perfil da Empresa (Google Meu Negócio)

Para que a clínica apareça no topo da busca local, no Google Maps e no bloco de empresas com avaliações quando alguém pesquisar por fisioterapia no Janga ou em Paulista:

### Dados Oficiais Padronizados (Fonte de Verdade):
- **Nome da Empresa**: `Caroline Melo Fisioterapia` (ou `Caroline Melo | Fisioterapia e Pilates`)
- **Profissional**: `Caroline Melo` (CREFITO 315194-F)
- **Categoria Principal**: `Fisioterapeuta`
- **Categorias Secundárias**: `Estúdio de Pilates`, `Clínica de fisioterapia`
- **Endereço Oficial**: `Av. Dr. Cláudio José Gueiros Leite, nº 571, Sala 14`
- **Bairro / Cidade**: `Janga, Paulista - PE`
- **Website**: `https://carolinemelofisio.com.br`
- **Telefone / WhatsApp**: `(81) 98834-5003`

### Posicionamento das Modalidades de Atendimento:
- **Atendimento Presencial & Pilates Clínico**: Realizado exclusivamente no estúdio: `Av. Dr. Cláudio José Gueiros Leite, nº 571, Sala 14, Janga, Paulista - PE`.
- **Área de Atendimento Domiciliar**: No painel do Perfil da Empresa, ative a opção "Atendo clientes no endereço deles" e selecione as áreas de cobertura:
  - *Paulista (PE)*
  - *Olinda (PE)*
  - *Regiões metropolitanas adjacentes (Recife norte)*
- **Pilates para Eventos**: Informar na descrição do perfil que este serviço possui formato flexível e localização definida conforme cada proposta.

### Checklist de Ativação do Perfil:
- [ ] Acessar [google.com/business](https://www.google.com/business) e reivindicar/cadastrar o local com os dados acima.
- [ ] Concluir o método de verificação solicitado pelo Google (geralmente vídeo curto do espaço/fachada ou código por correspondência/SMS).
- [ ] Fazer upload de fotos reais do estúdio com os aparelhos (Reformer, Cadillac, Barrel) e fotos profissionais de Caroline.
- [ ] Adicionar o link direto do site: `https://carolinemelofisio.com.br`.
- [ ] Convidar de 5 a 10 pacientes atuais para publicarem avaliações 5 estrelas mencionando o atendimento recebido.
