package com.mghbackend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class StatistiquesFinanceDto {

    // Solde actuel (total revenus - total dépenses)
    private BigDecimal soldeActuel;

    // Revenus
    private BigDecimal totalRevenus;
    private BigDecimal revenusJour;
    private BigDecimal revenusMois;

    // Dépenses
    private BigDecimal totalDepenses;
    private BigDecimal depensesJour;
    private BigDecimal depensesMois;

    // Résultats
    private BigDecimal solde;
    private BigDecimal resultatMois;

    // Transactions
    private long nombreTransactions;
    private long transactionsEnAttente;
    private BigDecimal montantEnAttente;

    // Top catégories
    private List<TopCategorie> topCategories;

    // Évolution mensuelle
    private List<EvolutionMensuelle> evolutionMensuelle;

    @Data
    public static class TopCategorie {
        private String categorie;
        private BigDecimal montant;
    }

    @Data
    public static class EvolutionMensuelle {
        private String mois;
        private BigDecimal revenus;
        private BigDecimal depenses;
        private BigDecimal resultat;
    }
}