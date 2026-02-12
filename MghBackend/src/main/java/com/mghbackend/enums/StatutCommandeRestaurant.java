package com.mghbackend.enums;

public enum StatutCommandeRestaurant {
    EN_ATTENTE("En attente"),
    EN_PREPARATION("En préparation"),
    PRETE("Prête"),
    SERVIE("Servie"),
    PAYEE("Payée"),
    ANNULEE("Annulée");

    private final String libelle;

    StatutCommandeRestaurant(String libelle) {
        this.libelle = libelle;
    }

    public String getLibelle() {
        return libelle;
    }
}