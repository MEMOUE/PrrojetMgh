package com.mghbackend.enums;

public enum StatutReservation {
    EN_ATTENTE("En attente"),
    CONFIRMEE("Confirmée"),
    ANNULEE("Annulée"),
    EN_COURS("En cours"),
    TERMINEE("Terminée"),
    NO_SHOW("No-show"); // Client ne s'est pas présenté

    private final String libelle;

    StatutReservation(String libelle) {
        this.libelle = libelle;
    }

    public String getLibelle() {
        return libelle;
    }
}