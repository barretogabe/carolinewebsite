import asyncio
import os
import re
import json
import uuid
import time
import wave
import shutil
import subprocess
import webbrowser
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse

try:
    import lameenc
except ImportError:
    lameenc = None

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "output_audio")
MODELS_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

# Caminho do modelo neural local Piper
PIPER_MODEL_PATH = os.path.join(MODELS_DIR, "pt_BR-faber-medium.onnx")

# Detecta o executável do Piper no ambiente virtual ou sistema
VENV_PIPER = os.path.join(BASE_DIR, ".venv", "bin", "piper")
PIPER_EXEC = VENV_PIPER if os.path.exists(VENV_PIPER) else "piper"

# Tenta carregar edge-tts para modo nuvem opcional
try:
    import edge_tts
except ImportError:
    edge_tts = None

VOICES = [
    # --- MOTORES LOCAIS (EXECUÇÃO 100% NO MAC - ULTRA RÁPIDO EM MP3) ---
    {
        "id": "local:piper:faber",
        "name": "⚡ Faber (Brasil) — Neural Local (Ultra Rápido e Humano)",
        "type": "local_neural",
        "gender": "Masculino",
        "style": "Locução natural de audiolivro rodando 100% offline no Mac",
        "default": True
    },
    {
        "id": "local:mac:Luciana",
        "name": "🍏 Luciana (Brasil) — Apple Nativa (Instantânea)",
        "type": "local_mac",
        "gender": "Feminina",
        "style": "Voz integrada do macOS, processamento imediato sem internet",
        "default": False
    },
    {
        "id": "local:mac:Joana",
        "name": "🍏 Joana (Portugal) — Apple Nativa",
        "type": "local_mac",
        "gender": "Feminina",
        "style": "Voz de Portugal integrada do macOS",
        "default": False
    },
    {
        "id": "local:mac:Eddy",
        "name": "🍏 Eddy (Brasil) — Apple Nativa",
        "type": "local_mac",
        "gender": "Masculino",
        "style": "Voz jovem do sistema",
        "default": False
    },
    # --- MOTORES EM NUVEM (EDGE TTS - ESTÚDIO ONLINE) ---
    {
        "id": "cloud:pt-BR-FranciscaNeural",
        "name": "☁️ Francisca (Brasil) — Nuvem Estúdio",
        "type": "cloud",
        "gender": "Feminina",
        "style": "Muito expressiva e calorosa (Requer conexão)",
        "default": False
    },
    {
        "id": "cloud:pt-BR-AntonioNeural",
        "name": "☁️ Antônio (Brasil) — Nuvem Estúdio",
        "type": "cloud",
        "gender": "Masculino",
        "style": "Firme e profissional (Requer conexão)",
        "default": False
    },
    {
        "id": "cloud:pt-BR-ThalitaNeural",
        "name": "☁️ Thalita (Brasil) — Nuvem Estúdio",
        "type": "cloud",
        "gender": "Feminina",
        "style": "Suave e amigável (Requer conexão)",
        "default": False
    },
    {
        "id": "cloud:pt-PT-RaquelNeural",
        "name": "☁️ Raquel (Portugal) — Nuvem Estúdio",
        "type": "cloud",
        "gender": "Feminina",
        "style": "Português de Portugal em alta definição",
        "default": False
    }
]

# --- DICIONÁRIOS DE DESROBOTIZAÇÃO E FONÉTICA ---

ORDINALS_MASC = {
    '1': 'primeiro', '2': 'segundo', '3': 'terceiro', '4': 'quarto', '5': 'quinto',
    '6': 'sexto', '7': 'sétimo', '8': 'oitavo', '9': 'nono', '10': 'décimo'
}
ORDINALS_FEM = {
    '1': 'primeira', '2': 'segunda', '3': 'terceira', '4': 'quarta', '5': 'quinta',
    '6': 'sexta', '7': 'sétima', '8': 'oitava', '9': 'nona', '10': 'décima'
}
ROMAN_CENTURIES = {
    'I': 'primeiro', 'II': 'segundo', 'III': 'terceiro', 'IV': 'quarto', 'V': 'quinto',
    'VI': 'sexto', 'VII': 'sétimo', 'VIII': 'oitavo', 'IX': 'nono', 'X': 'décimo',
    'XI': 'onze', 'XII': 'doze', 'XIII': 'treze', 'XIV': 'quatorze', 'XV': 'quinze',
    'XVI': 'dezesseis', 'XVII': 'dezessete', 'XVIII': 'dezoito', 'XIX': 'dezenove',
    'XX': 'vinte', 'XXI': 'vinte e um', 'XXII': 'vinte e dois'
}

# Dicionário Fonético para leitura natural de termos em inglês
ENGLISH_PHONETICS = {
    r'\bfeedback\b': 'fídibéque',
    r'\bmachine\s+learning\b': 'mexíne lârnin',
    r'\bdeep\s+learning\b': 'díp lârnin',
    r'\bbig\s+data\b': 'bíg dêita',
    r'\bdesign\b': 'dizáine',
    r'\bdesigner\b': 'dizáiner',
    r'\bworkshop\b': 'uôrcxóp',
    r'\binsights?\b': 'insáits',
    r'\bbriefing\b': 'brífin',
    r'\bmindset\b': 'máindisét',
    r'\bdeadline\b': 'dédiláine',
    r'\bbrainstorming\b': 'breinstórmin',
    r'\bcheck-?up\b': 'tchécap',
    r'\bguidelines?\b': 'gáidilaine',
    r'\bevidence-based\b': 'évidens bêisid',
    r'\bnursing\b': 'nârsin',
    r'\bassessment\b': 'asséssment',
    r'\bscreening\b': 'scrínin',
    r'\bfollow-?up\b': 'fólo-ap',
    r'\bhome\s+office\b': 'rôme ófice',
    r'\bsoftware\b': 'sóftuér',
    r'\bhardware\b': 'rárduér',
    r'\bdownload\b': 'daunlôud',
    r'\bupload\b': 'uplôud',
    r'\bonline\b': 'on-láine',
    r'\boffline\b': 'off-láine',
    r'\bburnout\b': 'bêrnaut',
    r'\bperformance\b': 'perfórmance',
    r'\bteam\b': 'tím',
    r'\bchecklist\b': 'tchék-list',
    r'\bcompliance\b': 'compláiens',
    r'\bknow-?how\b': 'nôu-ráu',
    r'\bcase\s+stud(?:y|ies)\b': 'kêis stâdi',
    r'\bcases?\b': 'kêis',
    r'\bstakeholders?\b': 'stêik-rôulder',
    r'\bturnover\b': 'têrnouvér',
    r'\bnetworking\b': 'netuôrquin',
    r'\bpodcast\b': 'pódicást',
    r'\bexpert\b': 'écspert',
    r'\bscore\b': 'iscór',
    r'\bstandard\b': 'stándard',
    r'\bcare\b': 'kér',
    r'\blayout\b': 'leiáute',
    r'\bbackup\b': 'bécap',
    r'\bsmartphones?\b': 'ismártifone',
    r'\bcloud\b': 'cláud',
    r'\bpitch\b': 'pítchi',
    r'\bstaff\b': 'stáf',
    r'\brounds?\b': 'ráunds',
    r'\btriage\b': 'triágem',
    r'\broadmap\b': 'rôudmép',
    r'\btarget\b': 'tárguet',
    r'\bopen\s+source\b': 'ôpen sôrce',
    r'\bframeworks?\b': 'frêim-uôrc',
    r'\bworkflows?\b': 'uôrc-flôu',
    r'\btrials?\b': 'tráial',
    r'\bstatus\s+quo\b': 'státus cuô',
    r'\bcoaching\b': 'côutchin',
    r'\bleadership\b': 'líderxip',
    r'\bgaps?\b': 'gép',
    r'\bsurveys?\b': 'sêrvei',
    r'\bsprints?\b': 'isprint',
    r'\bmeetings?\b': 'mítin',
    r'\bcalls?\b': 'cól',
    r'\bhubs?\b': 'râb',
    r'\bbackgrounds?\b': 'békigraund',
    r'\bplaybooks?\b': 'plêibuc'
}

def clean_pdf_artifacts(text: str) -> str:
    """
    Remove resíduos típicos de PDF:
    - Une hifenizações de quebra de linha ('enferma- \\n ria' -> 'enfermaria').
    - Remove frases desconexas de cabeçalho, rodapé e metadados no fim de parágrafos.
    - Remove números de página isolados e paginações ('Página 12 de 50').
    - Remove fragmentos e palavras truncadas terminadas em '…' (ex: 'avaliacao abordagem enfermari…').
    - Remove citações numéricas em colchetes ('[1, 2, 4-6]').
    - Remove citações autor-data em parênteses ('(SILVA; SANTOS, 2020)').
    - Converte 'et al.' para 'e colaboradores' e remove anos soltos após nomes.
    - Remove fragmentos desconexos de DOI, ISSN, links e dados editoriais.
    """
    # 1. Unir hifenização de fim de linha de PDF: enferma- \n ria -> enfermaria
    text = re.sub(r'(\w+)-\s*\n\s*(\w+)', r'\1\2', text)

    # 2. Remover caudas desconexas de metadados no final de parágrafos
    text = re.sub(r'(?i)\s*(?:disponível em|acesso em|acessado em|consultado em)\s*:?.*$', '', text, flags=re.MULTILINE)
    text = re.sub(r'(?i)\s*(?:doi|issn|isbn|pmid|pmcid)\s*:\s*\S+.*$', '', text, flags=re.MULTILINE)
    text = re.sub(r'(?i)(?<=[.!?])\s+(?:revista|journal|acta|anais)\s+.*?\d{4}.*?$', '', text, flags=re.MULTILINE)
    text = re.sub(r'(?<=[.!?])\s+[^\n.!?]{2,80}(?:…|\.{3})\s*$', '', text, flags=re.MULTILINE)

    lines = text.splitlines()
    filtered_lines = []

    for line in lines:
        stripped = line.strip()
        if not stripped:
            filtered_lines.append('')
            continue

        # Identifica linhas de resíduos técnicos e metadados desconexos
        is_junk = (
            re.match(r'(?i)^(?:página|pag\.|pág\.)\s*\d+\s*(?:de\s*\d+)?$', stripped) or
            re.match(r'^\d{1,4}$', stripped) or  # Apenas número de página solto
            re.match(r'(?i)^https?:\/\/\S+$', stripped) or  # Link isolado na linha
            re.match(r'(?i)^(?:doi:\s*|issn\s*|isbn\s*|pmid\s*|disponível em:|acesso em:|recebido em:|submetido em:|aprovado em:|como citar).*$', stripped) or
            re.match(r'(?i)^(?:autor correspondente|conflito de interesse|declaração de|todos os direitos reservados|all rights reserved|creative commons|cc by).*$', stripped) or
            re.match(r'(?i)^(?:palavras-chave|keywords|descritores|descritores em ciências da saúde)\s*:.*$', stripped) or
            (len(stripped) < 90 and (stripped.endswith('…') or re.search(r'\b\w+…\s*$', stripped))) or  # Ex: 'avaliacao abordagem enfermari…'
            (len(stripped) < 70 and stripped.endswith('...') and not re.search(r'[.!?]\s+[A-ZÀ-Ú]', stripped)) or
            re.match(r'(?i)^.*?(?:revista|journal|acta|anais)\s+.*?\d{4}.*?$', stripped)
        )
        if is_junk:
            continue

        filtered_lines.append(stripped)

    text = '\n'.join(filtered_lines)

    # 3. Remover citações numéricas entre colchetes: [1], [1, 2], [1-4], [12, 14-16]
    text = re.sub(r'\[\s*\d+(?:[\s,\-–—\d]*)\s*\]', '', text)

    # 4. Remover citações bibliográficas autor-data entre parênteses: (SILVA, 2020), (SILVA; SANTOS, 2019)
    text = re.sub(r'\([A-ZÀ-Ú\s;,\.]+\b(?:et\s+al\.?)?,?\s*\d{4}[a-z]?\)', '', text)

    # 5. Converter 'et al.' para 'e colaboradores' no corpo do texto
    text = re.sub(r'\bet\s+al\.?\s*\(\d{4}[a-z]?\)', 'e colaboradores', text)
    text = re.sub(r'\bet\s+al\.?\b', 'e colaboradores', text)

    # 6. Remover anos soltos entre parênteses logo após nome de autor: 'Silva (2020)' -> 'Silva'
    text = re.sub(r'([A-ZÀ-Ú][a-zà-ú]+(?:\s+e\s+colaboradores)?)\s*\(\d{4}[a-z]?\)', r'\1', text)

    # 7. Limpar resíduos de DOI e links de referência isolados
    text = re.sub(r'(?i)\bdoi:\s*https?:\/\/[^\s]+', '', text)

    # 8. Limpar pontuações e espaços residuais após remoção de citações
    text = re.sub(r'\s+([,\.!?])', r'\1', text)
    text = re.sub(r'([,\.!?])\s*\1+', r'\1', text)

    return text.strip()

def derobotize_text(text: str) -> str:
    """
    Expande abreviações e medidas para fala natural de locutor humano:
    - Títulos (Dr. -> Doutor, Dra. -> Doutora, Prof. -> Professor, Enf. -> Enfermeiro).
    - Abreviaturas acadêmicas e textuais (etc. -> e assim por diante, pág. -> página, art. -> artigo).
    - Unidades de saúde e medidas (120x80 mmHg -> 120 por 80 milímetros de mercúrio, mg, h, min, kg).
    - Ordinais (1º -> primeiro, 2ª -> segunda) e Séculos em romanos (século XXI -> século vinte e um).
    """
    # 1. Títulos e Tratamentos
    text = re.sub(r'\bDr\.\s*', 'Doutor ', text)
    text = re.sub(r'\bDra\.\s*', 'Doutora ', text)
    text = re.sub(r'\bProf\.\s*', 'Professor ', text)
    text = re.sub(r'\bProfa\.\s*', 'Professora ', text)
    text = re.sub(r'\bSr\.\s*', 'Senhor ', text)
    text = re.sub(r'\bSra\.\s*', 'Senhora ', text)
    text = re.sub(r'\bEnf\.\s*', 'Enfermeiro ', text)
    text = re.sub(r'\bEnfa\.\s*', 'Enfermeira ', text)

    # 2. Termos textuais e acadêmicos
    text = re.sub(r'\betc\b\.?', 'e assim por diante', text)
    text = re.sub(r'\bex\.:?\s*', 'por exemplo, ', text)
    text = re.sub(r'\bp\.ex\.\s*', 'por exemplo, ', text)
    text = re.sub(r'\bpágs?\.\s*(\d+)', r'página \1', text, flags=re.IGNORECASE)
    text = re.sub(r'\bp\.\s*(\d+)', r'página \1', text)
    text = re.sub(r'\bcap\.\s*(\d+)', r'capítulo \1', text, flags=re.IGNORECASE)
    text = re.sub(r'\barts?\.\s*(\d+)', r'artigo \1', text, flags=re.IGNORECASE)
    text = re.sub(r'\bobs\.:?\s*', 'observação: ', text, flags=re.IGNORECASE)
    text = re.sub(r'\bvol\.\s*(\d+)', r'volume \1', text, flags=re.IGNORECASE)
    text = re.sub(r'\b[Nn]º\.?\s*(\d+)', r'número \1', text)

    # 3. Unidades de saúde e medidas
    text = re.sub(r'(\d+)\s*x\s*(\d+)\s*mmHg\b', r'\1 por \2 milímetros de mercúrio', text)
    text = re.sub(r'(\d+)\s*mmHg\b', r'\1 milímetros de mercúrio', text)
    text = re.sub(r'(\d+)\s*mg\b', r'\1 miligramas', text)
    text = re.sub(r'(\d+)\s*mcg\b', r'\1 microgramas', text)
    text = re.sub(r'(\d+)\s*ml\b', r'\1 mililitros', text)
    text = re.sub(r'(\d+)\s*kg\b', r'\1 quilos', text)
    text = re.sub(r'(\d+)\s*km\b', r'\1 quilômetros', text)
    text = re.sub(r'(\d+)\s*cm\b', r'\1 centímetros', text)
    text = re.sub(r'(\d+)\s*mm\b', r'\1 milímetros', text)
    text = re.sub(r'(\d+)\s*h(?:rs?)?\b', r'\1 horas', text)
    text = re.sub(r'(\d+)\s*min\b', r'\1 minutos', text)
    text = re.sub(r'(\d+)\s*°C\b', r'\1 graus celsius', text)

    # 4. Ordinais
    def repl_ord_m(m):
        n = m.group(1)
        return ORDINALS_MASC.get(n, f'{n}º')
    def repl_ord_f(m):
        n = m.group(1)
        return ORDINALS_FEM.get(n, f'{n}ª')

    text = re.sub(r'\b(\d{1,2})º\b', repl_ord_m, text)
    text = re.sub(r'\b(\d{1,2})ª\b', repl_ord_f, text)

    # 5. Séculos em algarismos romanos
    def repl_sec(m):
        rom = m.group(1).upper()
        return f'século {ROMAN_CENTURIES.get(rom, rom)}'
    text = re.sub(r'\b[sS]éculo\s+([IVXLCDM]+)\b', repl_sec, text)

    return text

def apply_english_phonetics(text: str) -> str:
    """Substitui termos em inglês por equivalentes fonéticos que soam autênticos no TTS em português."""
    for pattern, repl in ENGLISH_PHONETICS.items():
        text = re.sub(pattern, repl, text, flags=re.IGNORECASE)
    return text

def verbalize_number_dotted(num_str: str) -> str:
    """Converte '1.2' em '1 ponto 2', '1.2.3' em '1 ponto 2 ponto 3' para leitura falada natural."""
    parts = num_str.split('.')
    return ' ponto '.join(parts)

def sanitize_and_structure_for_tts(
    text: str, 
    topic_mode: str = "formal",
    clean_pdf: bool = True,
    derobotize: bool = True,
    english_phonetics: bool = True
) -> str:
    """
    Higieniza o texto para narração humana fluida:
    - Limpa resíduos e fragmentos de PDF (se ativado).
    - Desrobotiza abreviações, medidas e números (se ativado).
    - Aplica fonética com sotaque natural em termos em inglês (se ativado).
    - Identifica e verbaliza tópicos e subtópicos (1., 1.2, a, b...).
    - Insere pequena pausa antes e após palavras entre parênteses (...).
    - Remove caracteres não-textuais (#, @, emojis, links brutos).
    """
    # Etapa 1: Filtro de resíduos de PDF
    if clean_pdf:
        text = clean_pdf_artifacts(text)

    # Etapa 2: Desrobotização de abreviações e medidas
    if derobotize:
        text = derobotize_text(text)

    # Etapa 3: Fonética em inglês
    if english_phonetics:
        text = apply_english_phonetics(text)

    lines = text.splitlines()
    cleaned_lines = []

    for line in lines:
        stripped = line.strip()
        if not stripped:
            cleaned_lines.append("")
            continue

        heading_level = 0
        m_hash = re.match(r'^(#{1,6})\s+(.*)$', stripped)
        if m_hash:
            heading_level = len(m_hash.group(1))
            stripped = m_hash.group(2).strip()

        stripped = re.sub(r'[*_~`]', '', stripped)

        processed_heading = None

        # Tópicos e Subtópicos com anúncio verbal prévio
        if topic_mode != 'none':
            # 1a. Multi-nível numerado (ex: 1.2, 1.2.3, 2.1 - Subtítulo)
            m_multi = re.match(r'^(\d+(?:\.\d+)+)\s*[\.\-\)\:\s]\s*(.*)$', stripped)
            if m_multi:
                num_raw = m_multi.group(1)
                content = m_multi.group(2).strip()
                num_spoken = verbalize_number_dotted(num_raw)
                if topic_mode == 'formal':
                    prefix = f"Subtópico {num_spoken}:"
                else:
                    prefix = f"{num_spoken}:"
                if content and not content.endswith(('.', ':', '!', '?')):
                    content += '.'
                processed_heading = f"{prefix} {content}".strip()

            # 1b. Letras de tópicos / subtópicos (ex: a), B., c -, d:)
            if not processed_heading:
                m_alpha = re.match(r'^([a-zA-Z])\s*[\.\-\)\:]\s+(.*)$', stripped)
                if m_alpha and (re.match(r'^[a-zA-Z]\s*[\.\-\)\:]', stripped) or heading_level > 0):
                    letter = m_alpha.group(1).upper()
                    content = m_alpha.group(2).strip()
                    if topic_mode == 'formal':
                        prefix = f"Item {letter}:"
                    else:
                        prefix = f"{letter}:"
                    if content and not content.endswith(('.', ':', '!', '?')):
                        content += '.'
                    processed_heading = f"{prefix} {content}".strip()

            # 1c. Número único de tópico (ex: 1. Título, 2 - Tema, 3) Conclusão)
            if not processed_heading:
                m_single = re.match(r'^(\d{1,3})\s*[\.\-\)\:]\s+(.*)$', stripped)
                if m_single and (re.match(r'^\d{1,3}\s*[\.\-\)\:]', stripped) or heading_level > 0):
                    num = m_single.group(1)
                    content = m_single.group(2).strip()
                    if topic_mode == 'formal':
                        prefix = f"Tópico {num}:" if heading_level <= 2 else f"Subtópico {num}:"
                    else:
                        prefix = f"{num}:"
                    if content and not content.endswith(('.', ':', '!', '?')):
                        content += '.'
                    processed_heading = f"{prefix} {content}".strip()

            # 1d. Rótulos explícitos ('Tópico 1', 'Capítulo 2.1')
            if not processed_heading:
                m_named = re.match(r'^(Tópico|Subtópico|Capítulo|Seção|Módulo)\s+(\d+(?:\.\d+)*)\s*[\.\-\)\:\s]\s*(.*)$', stripped, re.IGNORECASE)
                if m_named:
                    kind = m_named.group(1).capitalize()
                    num_raw = m_named.group(2)
                    num_spoken = verbalize_number_dotted(num_raw)
                    content = m_named.group(3).strip()
                    if content and not content.endswith(('.', ':', '!', '?')):
                        content += '.'
                    processed_heading = f"{kind} {num_spoken}: {content}".strip()

        if processed_heading:
            stripped = processed_heading
        elif heading_level > 0:
            if stripped and not stripped.endswith(('.', ':', '!', '?')):
                stripped += '.'

        # Marcadores de lista genéricos
        bullet_match = re.match(r'^([\*\-\+\•\▪\▫\✓\✔\➢\➤\➜\⁃])\s+(.*)$', stripped)
        if bullet_match:
            item = bullet_match.group(2).strip()
            item = re.sub(r'[*_~`]', '', item)
            if item and not item.endswith(('.', ':', '!', '?', ';', ',')):
                item += '.'
            cleaned_lines.append(item)
            continue

        # Linhas divisórias (---, ===)
        if re.match(r'^[-=*_]{3,}$', stripped):
            cleaned_lines.append("")
            continue

        # Tabelas
        if stripped.startswith('|') and stripped.endswith('|'):
            cells = [c.strip() for c in stripped.split('|') if c.strip() and not re.match(r'^:?-+:?$', c.strip())]
            if cells:
                stripped = ", ".join(cells) + "."
            else:
                continue

        # Formatação inline
        stripped = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', stripped)
        stripped = re.sub(r'!\[([^\]]*)\]\([^\)]+\)', '', stripped)
        stripped = re.sub(r'(\*\*|__)(.*?)\1', r'\2', stripped)
        stripped = re.sub(r'(\*|_)(.*?)\1', r'\2', stripped)
        stripped = re.sub(r'~~(.*?)~~', r'\1', stripped)
        stripped = re.sub(r'`(.*?)`', r'\1', stripped)

        # E-mails e menções
        stripped = re.sub(r'(\b[\w\.-]+)@([\w\.-]+\.\w+\b)', r'\1 arroba \2', stripped)
        stripped = re.sub(r'@(\w+)', r'\1', stripped)
        stripped = stripped.replace('@', '')

        # Hashtags
        stripped = re.sub(r'#(\d+)', r'número \1', stripped)
        stripped = re.sub(r'#(\w+)', r'\1', stripped)
        stripped = stripped.replace('#', '')

        # URLs
        def clean_url(m):
            url = m.group(0)
            dom = re.sub(r'^https?:\/\/(www\.)?', '', url).split('/')[0]
            return f"no site {dom}"
        stripped = re.sub(r'https?:\/\/[^\s]+', clean_url, stripped)

        # Emojis e caracteres decorativos
        stripped = re.sub(r'[\U00010000-\U0010ffff\u2600-\u26ff\u2700-\u27bf\ufe00-\ufe0f]', '', stripped)

        # PALAVRAS ENTRE PARÊNTESES: Insere pequena pausa antes do conteúdo e no fechamento
        def repl_parentheses(m):
            content = m.group(1).strip()
            if not content:
                return ""
            if content.endswith(('.', '!', '?', ';', ':')):
                return f", {content} "
            return f", {content}, "

        stripped = re.sub(r'\(([^)]+)\)', repl_parentheses, stripped)
        stripped = re.sub(r'^[,\s]+', '', stripped)
        stripped = re.sub(r',\s*,+', ',', stripped)
        stripped = re.sub(r'\s+,', ',', stripped)
        stripped = re.sub(r',\s*([.!?])', r'\1', stripped)
        stripped = re.sub(r'([.!?])\s*,', r'\1', stripped)

        # Caracteres residuais que prejudicam a fala
        stripped = re.sub(r'[\[\]{}|\\^~<>=/]', ' ', stripped)
        stripped = re.sub(r'\.{4,}', '...', stripped)
        stripped = re.sub(r'([!?,;])\1+', r'\1', stripped)
        stripped = re.sub(r'\s+([,\.!?])', r'\1', stripped)
        stripped = re.sub(r'(?<!\.)\.\s*\.(?!\.)', '.', stripped)
        stripped = re.sub(r',\s*\.', '.', stripped)
        stripped = re.sub(r'\.\s*,', '.', stripped)
        stripped = re.sub(r'\s+', ' ', stripped).strip()

        if stripped and not stripped.endswith(('.', ':', '!', '?', ';', ',')):
            if len(stripped) < 75:
                stripped += '.'

        cleaned_lines.append(stripped)

    result = "\n".join(cleaned_lines)
    result = re.sub(r'\n{3,}', '\n\n', result)
    return result.strip()

# --- MOTORES DE SÍNTESE E CONVERSÃO MP3 ---

def convert_audio_to_mp3(input_path: str, output_mp3_path: str, bitrate: int = 192) -> bool:
    """
    Converte qualquer áudio (WAV gerado pelo Piper, AIFF do macOS, ou MP3 do Edge)
    em um arquivo .mp3 padronizado de alta fidelidade em milissegundos.
    """
    ext = os.path.splitext(input_path)[1].lower()

    if ext == ".mp3":
        if input_path != output_mp3_path:
            shutil.copy2(input_path, output_mp3_path)
        return True

    wav_path = input_path
    temp_wav = None

    if ext == ".aiff":
        temp_wav = input_path + ".wav"
        res = subprocess.run([
            "/usr/bin/afconvert",
            "-f", "WAVE",
            "-d", "LEI16",
            input_path,
            temp_wav
        ], capture_output=True)
        if res.returncode != 0:
            print(f"[ERRO afconvert aiff->wav]: {res.stderr}")
            return False
        wav_path = temp_wav

    try:
        if lameenc:
            with wave.open(wav_path, "rb") as wf:
                channels = wf.getnchannels()
                sample_rate = wf.getframerate()
                frames = wf.readframes(wf.getnframes())

            encoder = lameenc.Encoder()
            encoder.set_bit_rate(bitrate)
            encoder.set_in_sample_rate(sample_rate)
            encoder.set_channels(channels)
            encoder.set_quality(2)
            mp3_data = encoder.encode(frames) + encoder.flush()

            with open(output_mp3_path, "wb") as f:
                f.write(mp3_data)
            return True
        else:
            raise RuntimeError("Biblioteca 'lameenc' necessária para codificação MP3.")
    except Exception as e:
        print(f"[ERRO conversão MP3]: {e}")
        return False
    finally:
        if temp_wav and os.path.exists(temp_wav):
            os.remove(temp_wav)

def synthesize_local_piper(text: str, rate_factor: float, output_wav: str) -> bool:
    """Executa a síntese neural 100% offline e local no Mac usando Piper TTS."""
    if not os.path.exists(PIPER_MODEL_PATH):
        raise FileNotFoundError("Modelo Piper 'pt_BR-faber-medium.onnx' não encontrado na pasta models.")

    length_scale = round(1.0 / max(0.4, rate_factor), 2)
    cmd = [
        PIPER_EXEC,
        "-m", PIPER_MODEL_PATH,
        "-f", output_wav,
        "--length-scale", str(length_scale)
    ]
    res = subprocess.run(cmd, input=text.encode("utf-8"), capture_output=True)
    if res.returncode != 0:
        print(f"[ERRO Piper]: {res.stderr.decode('utf-8')}")
        return False
    return True

def synthesize_local_mac(text: str, voice_name: str, rate_factor: float, output_aiff: str) -> bool:
    """Executa a síntese ultra-rápida nativa do macOS usando o utilitário 'say'."""
    wpm = int(175 * rate_factor)
    cmd = [
        "/usr/bin/say",
        "-v", voice_name,
        "-r", str(wpm),
        "-o", output_aiff,
        text
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print(f"[ERRO say]: {res.stderr}")
        return False
    return True

async def synthesize_cloud_edge(text: str, voice_id: str, rate_str: str, pitch_str: str, output_mp3: str) -> bool:
    """Executa a síntese em nuvem via Edge TTS."""
    if edge_tts is None:
        raise RuntimeError("edge-tts não disponível.")
    comm = edge_tts.Communicate(text, voice_id, rate=rate_str, pitch=pitch_str)
    await comm.save(output_mp3)
    return True

def cleanup_old_files():
    """Remove áudios gerados há mais de 12 horas."""
    try:
        now = time.time()
        for filename in os.listdir(OUTPUT_DIR):
            filepath = os.path.join(OUTPUT_DIR, filename)
            if os.path.isfile(filepath) and now - os.path.getmtime(filepath) > 43200:
                os.remove(filepath)
    except Exception as e:
        print(f"[Aviso limpeza]: {e}")

class TTSHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/" or path == "/index.html":
            index_file = os.path.join(BASE_DIR, "index.html")
            if os.path.exists(index_file):
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.end_headers()
                with open(index_file, "rb") as f:
                    self.wfile.write(f.read())
                return
            else:
                self.send_error(404, "index.html não encontrado")
                return

        elif path == "/api/voices":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps(VOICES, ensure_ascii=False).encode("utf-8"))
            return

        elif path.startswith("/api/audio/"):
            filename = os.path.basename(path)
            filepath = os.path.join(OUTPUT_DIR, filename)
            if not os.path.exists(filepath):
                self.send_error(404, "Arquivo de áudio não encontrado")
                return

            content_type = "audio/mpeg"
            file_size = os.path.getsize(filepath)

            range_header = self.headers.get("Range")
            if range_header and range_header.startswith("bytes="):
                range_spec = range_header[6:].split("-")
                start = int(range_spec[0])
                end = int(range_spec[1]) if range_spec[1] else file_size - 1
                length = end - start + 1

                self.send_response(206)
                self.send_header("Content-Type", content_type)
                self.send_header("Content-Range", f"bytes {start}-{end}/{file_size}")
                self.send_header("Content-Length", str(length))
                self.send_header("Accept-Ranges", "bytes")
                self.end_headers()

                with open(filepath, "rb") as f:
                    f.seek(start)
                    self.wfile.write(f.read(length))
                return
            else:
                self.send_response(200)
                self.send_header("Content-Type", content_type)
                self.send_header("Content-Length", str(file_size))
                self.send_header("Accept-Ranges", "bytes")
                self.send_header("Content-Disposition", f'inline; filename="{filename}"')
                self.end_headers()

                with open(filepath, "rb") as f:
                    self.wfile.write(f.read())
                return

        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)

        if parsed.path == "/api/clean-text":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            try:
                data = json.loads(body.decode("utf-8"))
            except Exception as e:
                self.send_error(400, f"JSON inválido: {e}")
                return

            raw_text = data.get("text", "")
            topic_mode = data.get("topic_mode", "formal")
            clean_pdf = data.get("clean_pdf", True)
            derobotize = data.get("derobotize", True)
            english_phonetics = data.get("english_phonetics", True)

            cleaned = sanitize_and_structure_for_tts(
                raw_text, 
                topic_mode=topic_mode,
                clean_pdf=clean_pdf,
                derobotize=derobotize,
                english_phonetics=english_phonetics
            )

            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"cleaned_text": cleaned}, ensure_ascii=False).encode("utf-8"))
            return

        elif parsed.path == "/api/generate":
            content_length = int(self.headers.get("Content-Length", 0))
            if content_length == 0:
                self.send_error(400, "Corpo da requisição vazio")
                return

            body = self.rfile.read(content_length)
            try:
                data = json.loads(body.decode("utf-8"))
            except Exception as e:
                self.send_error(400, f"JSON inválido: {e}")
                return

            raw_text = data.get("text", "").strip()
            if not raw_text:
                self.send_response(400)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "O texto não pode ser vazio."}).encode("utf-8"))
                return

            should_clean = data.get("auto_clean", True)
            topic_mode = data.get("topic_mode", "formal")
            clean_pdf = data.get("clean_pdf", True)
            derobotize = data.get("derobotize", True)
            english_phonetics = data.get("english_phonetics", True)

            spoken_text = sanitize_and_structure_for_tts(
                raw_text, 
                topic_mode=topic_mode,
                clean_pdf=clean_pdf,
                derobotize=derobotize,
                english_phonetics=english_phonetics
            ) if should_clean else raw_text

            voice = data.get("voice", "local:piper:faber")
            rate_pct = int(data.get("rate", "0").replace("%", "").replace("+", "") or "0")
            rate_factor = 1.0 + (rate_pct / 100.0)
            pitch = data.get("pitch", "+0Hz")

            file_id = uuid.uuid4().hex[:10]
            mp3_path = os.path.join(OUTPUT_DIR, f"{file_id}.mp3")

            t_start = time.time()

            try:
                # 1. Modo Local Neural (Piper)
                if voice.startswith("local:piper:"):
                    temp_audio = os.path.join(OUTPUT_DIR, f"{file_id}_raw.wav")
                    print(f"[INFO] Sintetizando localmente com IA Neural Piper (Faber)...")
                    if not synthesize_local_piper(spoken_text, rate_factor, temp_audio):
                        raise RuntimeError("Falha ao gerar voz com Piper local.")
                    if not convert_audio_to_mp3(temp_audio, mp3_path):
                        raise RuntimeError("Falha ao converter WAV para MP3.")
                    if os.path.exists(temp_audio):
                        os.remove(temp_audio)
                    engine_used = "Local Neural (Piper - 100% Offline)"

                # 2. Modo Local Nativo do Mac (Apple say)
                elif voice.startswith("local:mac:"):
                    voice_name = voice.split(":")[-1]
                    temp_audio = os.path.join(OUTPUT_DIR, f"{file_id}_raw.aiff")
                    print(f"[INFO] Sintetizando instantaneamente com voz Mac nativa '{voice_name}'...")
                    if not synthesize_local_mac(spoken_text, voice_name, rate_factor, temp_audio):
                        raise RuntimeError(f"Falha na voz nativa '{voice_name}'.")
                    if not convert_audio_to_mp3(temp_audio, mp3_path):
                        raise RuntimeError("Falha ao converter AIFF para MP3.")
                    if os.path.exists(temp_audio):
                        os.remove(temp_audio)
                    engine_used = f"Apple CoreAudio ({voice_name} - Instantâneo)"

                # 3. Modo Nuvem (Edge TTS)
                else:
                    edge_voice = voice.replace("cloud:", "")
                    rate_str = f"{rate_pct:+d}%"
                    print(f"[INFO] Sintetizando em nuvem com Edge TTS '{edge_voice}'...")
                    asyncio.run(synthesize_cloud_edge(spoken_text, edge_voice, rate_str, pitch, mp3_path))
                    engine_used = f"Nuvem Estúdio ({edge_voice})"

                if not os.path.exists(mp3_path):
                    raise RuntimeError("Falha na geração do arquivo MP3 final.")

                elapsed = round(time.time() - t_start, 2)
                mp3_size = os.path.getsize(mp3_path)
                print(f"[SUCESSO] MP3 gerado em {elapsed}s: {mp3_path} ({mp3_size} bytes)")

                cleanup_old_files()

                response_data = {
                    "success": True,
                    "id": file_id,
                    "mp3_url": f"/api/audio/{file_id}.mp3",
                    "filename_mp3": f"narracao_{file_id}.mp3",
                    "size_bytes": mp3_size,
                    "elapsed_seconds": elapsed,
                    "engine": engine_used,
                    "cleaned_text": spoken_text
                }

                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps(response_data, ensure_ascii=False).encode("utf-8"))

            except Exception as e:
                print(f"[ERRO Síntese]: {e}")
                self.send_response(500)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))
            return

        self.send_error(404, "Rota não encontrada")

def start_server(port=5055):
    server_address = ("127.0.0.1", port)
    httpd = HTTPServer(server_address, TTSHandler)
    url = f"http://localhost:{port}"
    print("=" * 60)
    print(" 🎙️  ESTÚDIO DE VOZ NEURAL LOCAL TTS (.MP3)")
    print(f" Servidor iniciado em: {url}")
    print(" Filtro de PDF, Desrobotização e Fonética em Inglês ATIVADOS.")
    print(" Pressione Ctrl+C para encerrar.")
    print("=" * 60)
    
    try:
        webbrowser.open(url)
    except Exception:
        pass

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[Encerrando servidor...]")
        httpd.server_close()

if __name__ == "__main__":
    start_server()
