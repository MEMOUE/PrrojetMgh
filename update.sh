#!/bin/bash

# Script de mise à jour MaGestionHotel
# Auteur: Memko
# Date: 2026

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║    Mise à jour MaGestionHotel             ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""

# Fonction pour afficher un message d'étape
step() {
    echo -e "${GREEN}▶ $1${NC}"
}

# Demander confirmation
read -p "Voulez-vous mettre à jour l'application? (o/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Oo]$ ]]; then
    echo "Mise à jour annulée."
    exit 0
fi

# Backup de la base de données
step "1. Sauvegarde de la base de données..."
timestamp=$(date +%Y%m%d_%H%M%S)
mkdir -p backups

docker exec mgh-mysql mysqldump \
    -u ${MYSQL_USER:-mgh_user} \
    -p${MYSQL_PASSWORD} \
    ${MYSQL_DATABASE:-mgh_database} \
    > backups/backup_${timestamp}.sql

echo -e "${GREEN}✓ Backup créé: backups/backup_${timestamp}.sql${NC}"

# Pull des dernières modifications
step "2. Récupération des dernières modifications..."
if [ -d .git ]; then
    git pull
    echo -e "${GREEN}✓ Code mis à jour${NC}"
else
    echo -e "${YELLOW}⚠ Pas de dépôt git, passage à l'étape suivante${NC}"
fi

# Rebuild des images
step "3. Reconstruction des images Docker..."
if command -v docker-compose &> /dev/null; then
    docker-compose build --no-cache
else
    docker compose build --no-cache
fi
echo -e "${GREEN}✓ Images reconstruites${NC}"

# Redémarrage des services
step "4. Redémarrage des services..."
if command -v docker-compose &> /dev/null; then
    docker-compose down
    docker-compose up -d
else
    docker compose down
    docker compose up -d
fi
echo -e "${GREEN}✓ Services redémarrés${NC}"

# Attendre que les services soient prêts
step "5. Vérification des services..."
sleep 15

if docker exec mgh-backend curl -f http://localhost:8080/actuator/health -s > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend opérationnel${NC}"
else
    echo -e "${YELLOW}⚠ Backend en cours de démarrage...${NC}"
fi

if docker exec mgh-nginx nginx -t > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Nginx opérationnel${NC}"
fi

# Nettoyage
step "6. Nettoyage des anciennes images..."
docker image prune -f
echo -e "${GREEN}✓ Nettoyage effectué${NC}"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║       MISE À JOUR TERMINÉE! ✓             ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}📋 Commandes utiles:${NC}"
echo -e "   Voir les logs:  docker-compose logs -f"
echo -e "   Restaurer DB:   cat backups/backup_${timestamp}.sql | docker exec -i mgh-mysql mysql -u root -p\$MYSQL_ROOT_PASSWORD \$MYSQL_DATABASE"
echo ""