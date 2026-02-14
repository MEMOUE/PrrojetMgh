# ==========================================
# ÉTAPE 1 : BUILD ANGULAR
# ==========================================
FROM node:20-slim as build

WORKDIR /app

# Installation des outils nécessaires
RUN apt-get update && \
    apt-get install -y git && \
    rm -rf /var/lib/apt/lists/*

# Configuration npm pour éviter les timeouts
RUN npm config set registry https://registry.npmjs.org/ && \
    npm config set fetch-timeout 120000 && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

# Nettoyer le cache npm
RUN rm -rf /root/.npm /root/.cache && \
    npm cache clean --force && \
    npm cache verify

# Copier les fichiers de dépendances
COPY package*.json ./

# Supprimer package-lock.json s'il existe
RUN rm -f package-lock.json

# Installer Angular CLI globalement
RUN npm install -g @angular/cli@^20.0.0

# Installer toutes les dépendances
RUN npm install --legacy-peer-deps || \
    (rm -rf node_modules /root/.npm && \
     npm cache clean --force && \
     npm install --legacy-peer-deps)

# Copier le code source
COPY . .

# Build de production
RUN ng build --configuration production

# ==========================================
# ÉTAPE 2 : SERVEUR NGINX
# ==========================================
FROM nginx:alpine

# Copier les fichiers buildés
COPY --from=build /app/dist/MghFrontend/browser /usr/share/nginx/html

# Copier la configuration Nginx pour Angular SPA
COPY nginx-angular.conf /etc/nginx/conf.d/default.conf

# Créer le répertoire pour les logs
RUN mkdir -p /var/log/nginx

# Exposer le port
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]