# Usa imagem oficial do Node.js
FROM node:18-alpine

# Define diretório de trabalho
WORKDIR /app

# Copia os arquivos package.json e package-lock.json
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia o restante dos arquivos
COPY . .

# Expõe a porta que o app usará
EXPOSE 3000

# Inicia a aplicação
CMD ["npm", "start"]
