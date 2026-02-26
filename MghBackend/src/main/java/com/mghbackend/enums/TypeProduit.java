package com.mghbackend.enums;

import lombok.Getter;

@Getter
public enum TypeProduit {
    BOISSON("Boisson"),
    ENTREE("Entrée"),
    PLAT("Plat principal"),
    DESSERT("Dessert"),
    AUTRE("Autre");

    private final String libelle;

    TypeProduit(String libelle) {
        this.libelle = libelle;
    }

}