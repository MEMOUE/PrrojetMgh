package com.mghbackend.enums;

public enum TypeChambre {
    SIMPLE("Chambre Simple"),
    DOUBLE("Chambre Double"),
    TWIN("Chambre Twin"),
    TRIPLE("Chambre Triple"),
    SUITE("Suite"),
    SUITE_JUNIOR("Suite Junior"),
    SUITE_PRESIDENTIELLE("Suite Présidentielle"),
    FAMILIALE("Chambre Familiale"),
    DELUXE("Chambre Deluxe");

    private final String libelle;

    TypeChambre(String libelle) {
        this.libelle = libelle;
    }

    public String getLibelle() {
        return libelle;
    }
}