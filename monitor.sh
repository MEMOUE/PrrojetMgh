#!/bin/bash

# Script de monitoring MaGestionHotel
# Auteur: Memko
# Date: 2026

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Monitoring MaGestionHotel             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Fonction pour vérifier l'état d'un service
check_service() {
    local service=$1
    local container=$2
    local check_command=$3
    
    echo -n "   $service: "
    if docker ps --filter "name=$container" --filter "status=running" | grep -q $container; then
        if [ -n "$check_command" ]; then
            if eval "$check_command" > /dev/null 2>&1; then
                echo -e "${GREEN}✓ Opérationnel${NC}"
                return 0
            else
                echo -e "${YELLOW}⚠ Démarré mais non responsive${NC}"
                return 1
            fi
        else
            echo -e "${GREEN}✓ Démarré${NC}"
            return 0
        fi
    else
        echo -e "${RED}✗ Arrêté${NC}"
        return 1
    fi
}

# 1. État des conteneurs
echo -e "${YELLOW}📦 État des conteneurs:${NC}"
check_service "MySQL" "mgh-mysql" "docker exec mgh-mysql mysqladmin ping -h localhost --silent"
check_service "Backend" "mgh-backend" "docker exec mgh-backend curl -f http://localhost:8080/actuator/health -s"
check_service "Frontend" "mgh-frontend" "docker exec mgh-frontend curl -f http://localhost:80 -s"
check_service "Nginx" "mgh-nginx" "docker exec mgh-nginx nginx -t"
check_service "Certbot" "mgh-certbot" ""

echo ""

# 2. Utilisation des ressources
echo -e "${YELLOW}💾 Utilisation des ressources:${NC}"

# CPU et Mémoire par conteneur
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" | while IFS= read -r line; do
    echo "   $line"
done

echo ""

# 3. Espace disque
echo -e "${YELLOW}💿 Espace disque:${NC}"
df -h | grep -E 'Filesystem|/$|/var/lib/docker' | while IFS= read -r line; do
    echo "   $line"
done

echo ""

# 4. Espace Docker
echo -e "${YELLOW}🐳 Utilisation Docker:${NC}"
docker system df | while IFS= read -r line; do
    echo "   $line"
done

echo ""

# 5. Certificats SSL
echo -e "${YELLOW}🔐 Certificats SSL:${NC}"
source .env 2>/dev/null || DOMAIN="votre-domaine.com"

if [ -d "letsencrypt/live/$DOMAIN" ]; then
    cert_file="letsencrypt/live/$DOMAIN/cert.pem"
    if [ -f "$cert_file" ]; then
        expiry_date=$(openssl x509 -enddate -noout -in "$cert_file" | cut -d= -f2)
        expiry_epoch=$(date -d "$expiry_date" +%s)
        current_epoch=$(date +%s)
        days_left=$(( ($expiry_epoch - $current_epoch) / 86400 ))
        
        echo -n "   Expiration: "
        if [ $days_left -gt 30 ]; then
            echo -e "${GREEN}$expiry_date ($days_left jours restants)${NC}"
        elif [ $days_left -gt 7 ]; then
            echo -e "${YELLOW}$expiry_date ($days_left jours restants)${NC}"
        else
            echo -e "${RED}$expiry_date ($days_left jours restants - URGENT!)${NC}"
        fi
    else
        echo -e "   ${RED}✗ Certificat introuvable${NC}"
    fi
else
    echo -e "   ${RED}✗ Aucun certificat SSL installé${NC}"
fi

echo ""

# 6. Logs récents (erreurs uniquement)
echo -e "${YELLOW}📝 Erreurs récentes (dernières 24h):${NC}"

# Backend errors
backend_errors=$(docker logs mgh-backend --since 24h 2>&1 | grep -i "error" | wc -l)
echo -n "   Backend: "
if [ $backend_errors -eq 0 ]; then
    echo -e "${GREEN}Aucune erreur${NC}"
else
    echo -e "${RED}$backend_errors erreur(s)${NC}"
fi

# Frontend errors (si applicable)
frontend_errors=$(docker logs mgh-frontend --since 24h 2>&1 | grep -i "error" | wc -l)
echo -n "   Frontend: "
if [ $frontend_errors -eq 0 ]; then
    echo -e "${GREEN}Aucune erreur${NC}"
else
    echo -e "${RED}$frontend_errors erreur(s)${NC}"
fi

# Nginx errors
nginx_errors=$(docker logs mgh-nginx --since 24h 2>&1 | grep -i "error" | wc -l)
echo -n "   Nginx: "
if [ $nginx_errors -eq 0 ]; then
    echo -e "${GREEN}Aucune erreur${NC}"
else
    echo -e "${RED}$nginx_errors erreur(s)${NC}"
fi

echo ""

# 7. Base de données
echo -e "${YELLOW}🗄️  Base de données:${NC}"

if docker exec mgh-mysql mysqladmin ping -h localhost --silent 2>/dev/null; then
    # Taille de la base de données
    source .env 2>/dev/null
    db_size=$(docker exec mgh-mysql mysql -u root -p${MYSQL_ROOT_PASSWORD} -e "SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)' FROM information_schema.TABLES WHERE table_schema = '${MYSQL_DATABASE}';" -N 2>/dev/null)
    echo "   Taille: ${db_size} MB"
    
    # Nombre de connexions actives
    connections=$(docker exec mgh-mysql mysql -u root -p${MYSQL_ROOT_PASSWORD} -e "SHOW STATUS WHERE variable_name = 'Threads_connected';" -N 2>/dev/null | awk '{print $2}')
    echo "   Connexions actives: ${connections}"
else
    echo -e "   ${RED}✗ Base de données inaccessible${NC}"
fi

echo ""

# 8. Réseau
echo -e "${YELLOW}🌐 Connectivité:${NC}"

# Test HTTPS
echo -n "   HTTPS (${DOMAIN}): "
if curl -f -s -o /dev/null -w "%{http_code}" https://${DOMAIN} | grep -q 200; then
    echo -e "${GREEN}✓ Accessible${NC}"
else
    echo -e "${RED}✗ Inaccessible${NC}"
fi

# Test API
echo -n "   API: "
if curl -f -s -o /dev/null https://${DOMAIN}/api/health 2>/dev/null; then
    echo -e "${GREEN}✓ Accessible${NC}"
else
    echo -e "${YELLOW}⚠ Non accessible (endpoint peut ne pas exister)${NC}"
fi

echo ""

# 9. Uptime
echo -e "${YELLOW}⏱️  Uptime:${NC}"
for container in mgh-nginx mgh-frontend mgh-backend mgh-mysql; do
    if docker ps --filter "name=$container" --filter "status=running" | grep -q $container; then
        uptime=$(docker inspect --format='{{.State.StartedAt}}' $container | xargs -I {} date -d {} +"%Y-%m-%d %H:%M:%S")
        echo "   $(echo $container | sed 's/mgh-//'): Démarré le $uptime"
    fi
done

echo ""

# 10. Alertes
echo -e "${YELLOW}⚠️  Alertes:${NC}"

alerts=0

# Vérifier l'espace disque
disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $disk_usage -gt 80 ]; then
    echo -e "   ${RED}✗ Espace disque > 80% ($disk_usage%)${NC}"
    ((alerts++))
fi

# Vérifier la mémoire
mem_usage=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
if [ $mem_usage -gt 90 ]; then
    echo -e "   ${RED}✗ Utilisation mémoire > 90% ($mem_usage%)${NC}"
    ((alerts++))
fi

# Vérifier l'expiration SSL
if [ $days_left -lt 7 ]; then
    echo -e "   ${RED}✗ Certificat SSL expire dans $days_left jours!${NC}"
    ((alerts++))
fi

if [ $alerts -eq 0 ]; then
    echo -e "   ${GREEN}✓ Aucune alerte${NC}"
fi

echo ""

# Résumé final
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         Fin du monitoring                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"

# Options supplémentaires
echo ""
echo -e "${YELLOW}Options:${NC}"
echo "  1. Voir les logs en temps réel"
echo "  2. Redémarrer tous les services"
echo "  3. Nettoyer Docker"
echo "  4. Quitter"
echo ""
read -p "Choisir une option (1-4): " choice

case $choice in
    1)
        echo -e "${GREEN}Affichage des logs (Ctrl+C pour quitter)...${NC}"
        docker-compose logs -f
        ;;
    2)
        echo -e "${YELLOW}Redémarrage des services...${NC}"
        docker-compose restart
        echo -e "${GREEN}✓ Services redémarrés${NC}"
        ;;
    3)
        echo -e "${YELLOW}Nettoyage Docker...${NC}"
        docker system prune -f
        echo -e "${GREEN}✓ Nettoyage effectué${NC}"
        ;;
    4)
        exit 0
        ;;
    *)
        echo "Option invalide"
        exit 1
        ;;
esac