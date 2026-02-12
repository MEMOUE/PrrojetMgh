package com.mghbackend.enums;

public enum ModePaiement {
    ESPECES("Espèces"),
    CARTE_BANCAIRE("Carte bancaire"),
    VIREMENT("Virement bancaire"),
    CHEQUE("Chèque"),
    MOBILE_MONEY("Mobile Money"),
    ORANGE_MONEY("Orange Money"),
    MTN_MONEY("MTN Money"),
    WAVE("Wave"),
    MOOV_MONEY("Moov Money");

    private final String libelle;

    ModePaiement(String libelle) {
        this.libelle = libelle;
    }

    public String getLibelle() {
        return libelle;
    }
}