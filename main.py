# Importando bibliotecas principais
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_cors import CORS
from deepface import DeepFace
import random
import os
import cv2
import numpy as np

# Inicializando o app Flask
app = Flask(__name__, static_folder="public", static_url_path="")
CORS(app)

# Mapeia emoções para as pastas de imagens
emocoes_para_pastas = {
    "happy": "public/static/mar_feliz",
    "sad": "public/static/mar_triste",
    "neutral": "public/static/mar_neutro"
}

# Função auxiliar para escolher uma imagem aleatória de uma pasta
def escolher_imagem(emocao):
    pasta = emocoes_para_pastas.get(emocao)
    if not pasta or not os.path.exists(pasta):
        print(f"Pasta não encontrada: {pasta}")
        return None

    arquivos = os.listdir(pasta)
    imagens = [arq for arq in arquivos if arq.lower().endswith(('.png', '.jpg', '.jpeg'))]
    
    if imagens:
        nome_arquivo = random.choice(imagens)
        caminho_absoluto = os.path.join(pasta, nome_arquivo).replace("\\", "/")
        return caminho_absoluto
    return None

@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")

# Rota principal da API que analisa a emoção de uma imagem enviada
@app.route("/analisa-rosto", methods=["POST"])
def analisa_rosto():
    if 'imagem' not in request.files:
        return jsonify({"erro": "Nenhuma imagem enviada"}), 400

    imagem_file = request.files['imagem']
    npimg = np.frombuffer(imagem_file.read(), np.uint8)
    frame = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    try:
        resultado = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)
        emocao = resultado[0]['dominant_emotion']
        print(f"Emoção detectada: {emocao}")

        imagem_fundo = escolher_imagem(emocao)
        print("Imagem fundo escolhida:", imagem_fundo)

        if imagem_fundo:
            relativo = imagem_fundo.split("public/static/")[-1]
            imagem_url = f"/static/{relativo}"
            print("Caminho relativo:", relativo)
            print("URL final:", imagem_url)
            return jsonify({
                "emocao": emocao,
                "imagem_fundo": imagem_url
            })
        else:
            return jsonify({"erro": "Imagem não encontrada"}), 404

    except Exception as e:
        print("ERRO:", str(e))
        return jsonify({"erro": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
