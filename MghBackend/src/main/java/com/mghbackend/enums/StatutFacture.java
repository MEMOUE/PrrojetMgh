package com.mghbackend.enums;

public enum StatutFacture {
    BROUILLON("Brouillon"),
    EMISE("Émise"),
    PAYEE("Payée"),
    ANNULEE("Annulée");

    private final String libelle;

    StatutFacture(String libelle) {
        this.libelle = libelle;
    }

    public String getLibelle() {
        return libelle;
    }
}