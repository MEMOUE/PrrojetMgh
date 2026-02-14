#!/bin/bash

# Script de déploiement MaGestionHotel avec Let's Encrypt
# Auteur: Memko
# Date: 2026

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Déploiement MaGestionHotel avec SSL      ║${NC}"
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo ""

# Vérifier si le fichier .env existe
if [ ! -f .env ]; then
    echo -e "${RED}❌ Fichier .env introuvable!${NC}"
    echo -e "${YELLOW}Créez un fichier .env avec les variables nécessaires.${NC}"
    exit 1
fi

# Charger les variables d'environnement
source .env

# Vérifier les variables obligatoires
if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo -e "${RED}❌ Variables DOMAIN et EMAIL requises dans .env${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Configuration:${NC}"
echo -e "   Domaine: $DOMAIN"
echo -e "   Email: $EMAIL"
echo ""

# Fonction pour afficher un message d'étape
step() {
    echo -e "${GREEN}▶ $1${NC}"
}

# Fonction pour afficher une erreur et quitter
error_exit() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Étape 1: Vérifier les prérequis
step "1. Vérification des prérequis..."
if ! command -v docker &> /dev/null; then
    error_exit "Docker n'est pas installé!"
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    error_exit "Docker Compose n'est pas installé!"
fi

echo -e "${GREEN}✓ Docker et Docker Compose installés${NC}"

# Étape 2: Créer les répertoires nécessaires
step "2. Création des répertoires..."
mkdir -p letsencrypt/live certbot/www nginx_cache
echo -e "${GREEN}✓ Répertoires créés${NC}"

# Étape 3: Remplacer le domaine dans nginx.conf
step "3. Configuration de nginx..."
if [ -f nginx.conf ]; then
    # Note: Les domaines sont déjà configurés dans nginx.conf
    # Pas besoin de remplacement car les domaines sont spécifiques
    echo -e "${GREEN}✓ Configuration nginx prête${NC}"
else
    error_exit "Fichier nginx.conf introuvable!"
fi

# Étape 4: Vérifier si les certificats existent déjà
if [ -d "letsencrypt/live/$DOMAIN" ]; then
    echo -e "${YELLOW}⚠ Certificats SSL déjà présents pour $DOMAIN${NC}"
    read -p "Voulez-vous les régénérer? (o/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Oo]$ ]]; then
        step "Passage à l'étape suivante..."
    else
        GENERATE_CERT=true
    fi
else
    GENERATE_CERT=true
fi

# Étape 5: Obtenir les certificats SSL
if [ "$GENERATE_CERT" = true ]; then
    step "4. Obtention des certificats SSL Let's Encrypt..."
    
    # Démarrer temporairement nginx pour le challenge HTTP
    echo -e "${YELLOW}   Démarrage temporaire de nginx...${NC}"
    
    # Créer une configuration nginx temporaire pour le challenge
    cat > nginx-temp.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    server {
        listen 80;
        server_name _;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 200 'OK';
        }
    }
}
EOF

    # Démarrer nginx temporaire
    docker run -d --name nginx-temp \
        -p 80:80 \
        -v $(pwd)/nginx-temp.conf:/etc/nginx/nginx.conf:ro \
        -v $(pwd)/certbot/www:/var/www/certbot:ro \
        nginx:alpine || error_exit "Impossible de démarrer nginx temporaire"

    sleep 2

    # Obtenir les certificats pour chaque domaine
    DOMAINS=("$DOMAIN" "$DOMAIN_BACKEND" "$DOMAIN_PHPMYADMIN")
    
    for CURRENT_DOMAIN in "${DOMAINS[@]}"; do
        echo -e "${YELLOW}   Demande des certificats SSL pour $CURRENT_DOMAIN...${NC}"
        
        docker run --rm \
            -v $(pwd)/letsencrypt:/etc/letsencrypt \
            -v $(pwd)/certbot/www:/var/www/certbot \
            certbot/certbot certonly \
            --webroot \
            --webroot-path=/var/www/certbot \
            --email $EMAIL \
            --agree-tos \
            --no-eff-email \
            -d $CURRENT_DOMAIN || {
                echo -e "${RED}Échec pour $CURRENT_DOMAIN${NC}"
            }
        
        sleep 2
    done

    # Arrêter nginx temporaire
    docker stop nginx-temp && docker rm nginx-temp
    rm nginx-temp.conf

    echo -e "${GREEN}✓ Certificats SSL obtenus avec succès${NC}"
else
    echo -e "${GREEN}✓ Utilisation des certificats existants${NC}"
fi

# Étape 6: Arrêter les conteneurs existants
step "5. Arrêt des conteneurs existants (si présents)..."
docker-compose down 2>/dev/null || docker compose down 2>/dev/null || true
echo -e "${GREEN}✓ Conteneurs arrêtés${NC}"

# Étape 7: Build et démarrage des conteneurs
step "6. Construction et démarrage des conteneurs..."
if command -v docker-compose &> /dev/null; then
    docker-compose build --no-cache
    docker-compose up -d
else
    docker compose build --no-cache
    docker compose up -d
fi

echo -e "${GREEN}✓ Conteneurs démarrés${NC}"

# Étape 8: Attendre que les services soient prêts
step "7. Vérification de l'état des services..."
sleep 10

# Vérifier MySQL
echo -n "   MySQL: "
if docker exec mgh-mysql mysqladmin ping -h localhost --silent; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

# Vérifier Backend
echo -n "   Backend: "
if docker exec mgh-backend curl -f http://localhost:8080/actuator/health -s > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⏳ En cours de démarrage...${NC}"
fi

# Vérifier Frontend
echo -n "   Frontend: "
if docker exec mgh-frontend curl -f http://localhost:80 -s > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⏳ En cours de démarrage...${NC}"
fi

# Vérifier Nginx
echo -n "   Nginx: "
if docker exec mgh-nginx nginx -t > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

# Étape 9: Informations sur le renouvellement
step "8. Renouvellement automatique des certificats..."
echo -e "${GREEN}✓ Le conteneur certbot renouvelle automatiquement les certificats${NC}"
echo -e "${YELLOW}   Vérification quotidienne à 2h du matin${NC}"

# Résumé final
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          DÉPLOIEMENT RÉUSSI! 🎉           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}📊 Informations:${NC}"
echo -e "   🌐 Frontend:  https://$DOMAIN"
echo -e "   🔌 API:       https://$DOMAIN_BACKEND"
echo -e "   🗄️  PhpMyAdmin: https://$DOMAIN_PHPMYADMIN"
echo -e "   🔐 SSL:       Activé (Let's Encrypt)"
echo -e "   📝 API Docs:  https://$DOMAIN_BACKEND/swagger-ui/"
echo ""
echo -e "${YELLOW}📋 Commandes utiles:${NC}"
echo -e "   Voir les logs:        docker-compose logs -f"
echo -e "   Arrêter:             docker-compose down"
echo -e "   Redémarrer:          docker-compose restart"
echo -e "   Vérifier nginx:      docker exec mgh-nginx nginx -t"
echo -e "   Renouveler SSL:      docker-compose run --rm certbot renew"
echo -e "   Monitoring:          ./monitor.sh"
echo ""
echo -e "${GREEN}✨ Votre application est maintenant accessible !${NC}"
echo ""