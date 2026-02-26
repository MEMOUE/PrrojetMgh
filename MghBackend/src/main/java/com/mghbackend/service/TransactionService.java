package com.mghbackend.service;

import com.mghbackend.dto.StatistiquesFinanceDto;
import com.mghbackend.dto.TransactionDto;
import com.mghbackend.enums.TypeTransaction;

import java.util.List;

public interface TransactionService {

    // CRUD de base
    TransactionDto createTransaction(Long hotelId, TransactionDto dto, Long userId);
    TransactionDto getTransactionById(Long id);
    List<TransactionDto> getTransactionsByHotel(Long hotelId);
    TransactionDto updateTransaction(Long id, TransactionDto dto);
    void deleteTransaction(Long id);

    // Filtres
    List<TransactionDto> getTransactionsByHotelAndType(Long hotelId, TypeTransaction type);
    List<TransactionDto> getTransactionsEnAttente(Long hotelId);
    List<TransactionDto> searchTransactions(Long hotelId, String keyword);

    // Actions métier
    TransactionDto validerTransaction(Long id, String validePar);
    TransactionDto annulerTransaction(Long id, String motif);

    // Statistiques
    StatistiquesFinanceDto getStatistiques(Long hotelId);

    // Export
    byte[] exportTransactions(Long hotelId, String format, String dateDebut, String dateFin);
}