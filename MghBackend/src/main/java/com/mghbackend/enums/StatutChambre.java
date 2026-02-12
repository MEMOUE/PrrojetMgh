package com.mghbackend.enums;

public enum StatutChambre {
    DISPONIBLE("Disponible"),
    OCCUPEE("Occupée"),
    RESERVEE("Réservée"),
    EN_NETTOYAGE("En nettoyage"),
    EN_MAINTENANCE("En maintenance"),
    HORS_SERVICE("Hors service");

    private final String libelle;

    StatutChambre(String libelle) {
        this.libelle = libelle;
    }

    public String getLibelle() {
        return libelle;
    }
}