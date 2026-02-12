package com.mghbackend.enums;

public enum TypeMouvement {
    ENTREE("Entrée"),
    SORTIE("Sortie"),
    AJUSTEMENT("Ajustement"),
    RETOUR("Retour");

    private final String libelle;

    TypeMouvement(String libelle) {
        this.libelle = libelle;
    }

    public String getLibelle() {
        return libelle;
    }
}