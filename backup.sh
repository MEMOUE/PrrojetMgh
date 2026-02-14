#!/bin/bash

# Script de sauvegarde automatique MaGestionHotel
# Auteur: Memko
# Date: 2026

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Charger les variables d'environnement
if [ -f .env ]; then
    source .env
else
    echo -e "${RED}❌ Fichier .env introuvable!${NC}"
    exit 1
fi

# Configuration
BACKUP_DIR="backups"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE=$(date +%Y-%m-%d)

# Créer le répertoire de backup s'il n'existe pas
mkdir -p $BACKUP_DIR

echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     Sauvegarde MaGestionHotel             ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""

# 1. Sauvegarde de la base de données
echo -e "${YELLOW}▶ Sauvegarde de la base de données...${NC}"

BACKUP_FILE="$BACKUP_DIR/db_backup_${TIMESTAMP}.sql"

docker exec mgh-mysql mysqldump \
    -u ${MYSQL_USER} \
    -p${MYSQL_PASSWORD} \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    ${MYSQL_DATABASE} > $BACKUP_FILE

if [ $? -eq 0 ]; then
    # Compresser la sauvegarde
    gzip $BACKUP_FILE
    BACKUP_FILE="${BACKUP_FILE}.gz"
    
    FILE_SIZE=$(du -h $BACKUP_FILE | cut -f1)
    echo -e "${GREEN}✓ Sauvegarde créée: $BACKUP_FILE ($FILE_SIZE)${NC}"
else
    echo -e "${RED}✗ Échec de la sauvegarde${NC}"
    exit 1
fi

# 2. Sauvegarde des fichiers de configuration (optionnel)
echo -e "${YELLOW}▶ Sauvegarde de la configuration...${NC}"

CONFIG_BACKUP="$BACKUP_DIR/config_backup_${TIMESTAMP}.tar.gz"

tar -czf $CONFIG_BACKUP \
    docker-compose.yml \
    nginx.conf \
    MghFrontend/nginx.conf \
    --exclude='*.log' \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='build' \
    2>/dev/null || true

if [ -f $CONFIG_BACKUP ]; then
    CONFIG_SIZE=$(du -h $CONFIG_BACKUP | cut -f1)
    echo -e "${GREEN}✓ Configuration sauvegardée: $CONFIG_BACKUP ($CONFIG_SIZE)${NC}"
fi

# 3. Nettoyage des anciennes sauvegardes
echo -e "${YELLOW}▶ Nettoyage des anciennes sauvegardes (>${RETENTION_DAYS} jours)...${NC}"

DELETED_COUNT=0
find $BACKUP_DIR -name "*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete && DELETED_COUNT=$((DELETED_COUNT + 1)) || true
find $BACKUP_DIR -name "*.tar.gz" -type f -mtime +${RETENTION_DAYS} -delete || true

if [ $DELETED_COUNT -gt 0 ]; then
    echo -e "${GREEN}✓ $DELETED_COUNT ancienne(s) sauvegarde(s) supprimée(s)${NC}"
else
    echo -e "${GREEN}✓ Aucune ancienne sauvegarde à supprimer${NC}"
fi

# 4. Statistiques des sauvegardes
echo ""
echo -e "${YELLOW}📊 Statistiques des sauvegardes:${NC}"

DB_BACKUPS=$(ls -1 $BACKUP_DIR/db_backup_*.sql.gz 2>/dev/null | wc -l)
CONFIG_BACKUPS=$(ls -1 $BACKUP_DIR/config_backup_*.tar.gz 2>/dev/null | wc -l)
TOTAL_SIZE=$(du -sh $BACKUP_DIR | cut -f1)

echo "   Sauvegardes DB: $DB_BACKUPS"
echo "   Sauvegardes config: $CONFIG_BACKUPS"
echo "   Espace total: $TOTAL_SIZE"

# 5. Liste des 5 dernières sauvegardes
echo ""
echo -e "${YELLOW}📋 Dernières sauvegardes:${NC}"
ls -lht $BACKUP_DIR/*.sql.gz 2>/dev/null | head -5 | while IFS= read -r line; do
    echo "   $line"
done

# 6. Optionnel: Upload vers un stockage distant (à configurer)
# Exemples:
# - AWS S3: aws s3 cp $BACKUP_FILE s3://votre-bucket/backups/
# - SCP: scp $BACKUP_FILE user@backup-server:/path/to/backups/
# - FTP, Dropbox, etc.

if [ -n "$REMOTE_BACKUP_ENABLED" ] && [ "$REMOTE_BACKUP_ENABLED" = "true" ]; then
    echo ""
    echo -e "${YELLOW}▶ Upload vers le stockage distant...${NC}"
    
    # Exemple avec SCP (à adapter)
    if [ -n "$REMOTE_HOST" ] && [ -n "$REMOTE_PATH" ]; then
        scp $BACKUP_FILE ${REMOTE_HOST}:${REMOTE_PATH}/ && \
        echo -e "${GREEN}✓ Sauvegarde uploadée vers ${REMOTE_HOST}${NC}" || \
        echo -e "${RED}✗ Échec de l'upload${NC}"
    fi
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     SAUVEGARDE TERMINÉE! ✓                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""

# Afficher la commande de restauration
echo -e "${YELLOW}💡 Pour restaurer cette sauvegarde:${NC}"
echo "   gunzip -c $BACKUP_FILE | docker exec -i mgh-mysql mysql -u root -p\${MYSQL_ROOT_PASSWORD} \${MYSQL_DATABASE}"
echo ""