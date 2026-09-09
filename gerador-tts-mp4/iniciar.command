#!/bin/bash

# Navega até o diretório onde o script está localizado
cd "$(dirname "$0")"

clear
echo "========================================================="
echo "   ⚡ ESTÚDIO DE VOZ TTS LOCAL EM .MP3 (ALTA VELOCIDADE) "
echo "========================================================="
echo ""

# Determina o executável Python (prioriza o ambiente virtual local isolado)
if [ -f ".venv/bin/python" ]; then
    PYTHON_EXEC=".venv/bin/python"
    PIP_EXEC=".venv/bin/pip"
elif command -v python3 &> /dev/null; then
    PYTHON_EXEC="python3"
    PIP_EXEC="python3 -m pip"
else
    echo "❌ Erro: Python 3 não foi encontrado no seu Mac."
    read -p "Pressione Enter para sair..."
    exit 1
fi

# Verifica se os pacotes essenciais estão instalados
$PYTHON_EXEC -c "import piper, onnxruntime, lameenc, edge_tts" &> /dev/null
if [ $? -ne 0 ]; then
    echo "📦 Instalando pacotes locais de IA e áudio (piper-tts, onnxruntime, lameenc, edge-tts)..."
    $PIP_EXEC install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "❌ Ocorreu um erro ao instalar as dependências. Verifique sua conexão."
        read -p "Pressione Enter para sair..."
        exit 1
    fi
    echo "✅ Instalação concluída com sucesso!"
fi

# Verifica se o modelo neural local existe
if [ ! -f "models/pt_BR-faber-medium.onnx" ]; then
    echo "📥 Baixando modelo neural local em português (Faber - 60MB)..."
    mkdir -p models
    curl -L -o models/pt_BR-faber-medium.onnx "https://huggingface.co/rhasspy/piper-voices/resolve/main/pt/pt_BR/faber/medium/pt_BR-faber-medium.onnx"
    curl -L -o models/pt_BR-faber-medium.onnx.json "https://huggingface.co/rhasspy/piper-voices/resolve/main/pt/pt_BR/faber/medium/pt_BR-faber-medium.onnx.json"
    echo "✅ Modelo neural local pronto!"
fi

echo "🚀 Abrindo a interface web no seu navegador..."
echo "👉 Acesse a qualquer momento em: http://localhost:5055"
echo ""
echo "Pressione [Ctrl + C] aqui no terminal quando desejar encerrar."
echo "---------------------------------------------------------"

$PYTHON_EXEC app.py
