FROM python:3.10-slim

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y libgl1-mesa-glx

# Criar diretório de trabalho
WORKDIR /app

# Copiar arquivos
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Rodar o app com Gunicorn
CMD ["gunicorn", "main:app", "--bind", "0.0.0.0:8080"]
