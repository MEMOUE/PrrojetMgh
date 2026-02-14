# ==========================================
# ÉTAPE 1 : BUILD AVEC GRADLE
# ==========================================
FROM eclipse-temurin:21-jdk-alpine as build

WORKDIR /app

# Installer curl pour le healthcheck
RUN apk add --no-cache curl

# Copier les fichiers Gradle
COPY gradle gradle
COPY gradlew .
COPY gradlew.bat .
COPY build.gradle .
COPY settings.gradle .

# Rendre le script gradlew exécutable
RUN chmod +x ./gradlew

# Télécharger les dépendances (layer séparé pour le cache)
RUN ./gradlew dependencies --no-daemon --refresh-dependencies

# Copier le code source
COPY src src

# Construire l'application
RUN ./gradlew bootJar --no-daemon -x test

# ==========================================
# ÉTAPE 2 : RUNTIME OPTIMISÉ
# ==========================================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Installer curl pour le healthcheck
RUN apk add --no-cache curl tzdata

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1000 spring && \
    adduser -D -u 1000 -G spring spring

# Créer les répertoires nécessaires
RUN mkdir -p /app/logs /app/uploads && \
    chown -R spring:spring /app

# Copier le JAR depuis l'étape de build
COPY --from=build --chown=spring:spring /app/build/libs/*.jar app.jar

# Changer vers l'utilisateur non-root
USER spring:spring

# Exposer le port
EXPOSE 8080

# Variables d'environnement par défaut
ENV JAVA_OPTS="-Xms256m -Xmx512m" \
    TZ="Africa/Abidjan"

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Démarrer l'application avec les options Java
ENTRYPOINT ["sh", "-c", "exec java ${JAVA_OPTS} -Djava.security.egd=file:/dev/./urandom -jar app.jar"]