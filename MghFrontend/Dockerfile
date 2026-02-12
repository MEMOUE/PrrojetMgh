# Étape 1: Build Angular
FROM node:20 as build

WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm ci --legacy-peer-deps

# Copier le code source
COPY . .

# Construire l'application
RUN npm run build

# Étape 2: Servir l'application avec Nginx
FROM nginx:alpine

# Supprimer les fichiers par défaut de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copier les fichiers de build Angular
COPY --from=build /app/dist/mgh-frontend/browser/ /usr/share/nginx/html/

# Copier la configuration Nginx
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]