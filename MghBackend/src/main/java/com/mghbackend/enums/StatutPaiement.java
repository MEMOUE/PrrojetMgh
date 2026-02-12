package com.mghbackend.enums;

public enum StatutPaiement {
    NON_PAYE("Non payé"),
    ACOMPTE("Acompte versé"),
    PAYE("Payé"),
    REMBOURSE("Remboursé");

    private final String libelle;

    StatutPaiement(String libelle) {
        this.libelle = libelle;
    }

    public String getLibelle() {
        return libelle;
    }
}