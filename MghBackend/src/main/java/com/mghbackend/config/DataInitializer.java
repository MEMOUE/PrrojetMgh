package com.mghbackend.config;

import com.mghbackend.entity.*;
import com.mghbackend.enums.TypePermission;
import com.mghbackend.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

	private final RoleRepository roleRepository;

	@Override
	@Transactional
	public void run(String... args) throws Exception {
		log.info("Initialisation des données...");

		createRoles();

		log.info("Initialisation des données terminée");
	}

	private void createRoles() {
		// Rôle RECEPTION
		if (!roleRepository.existsByName("RECEPTION")) {
			Role reception = new Role();
			reception.setName("RECEPTION");
			reception.setDescription("Employé de la réception");
			reception.setPermissions(Set.of(
					TypePermission.VOIR_RESERVATIONS,
					TypePermission.CREER_RESERVATION,
					TypePermission.MODIFIER_RESERVATION,
					TypePermission.ANNULER_RESERVATION,
					TypePermission.VOIR_CONFIGURATION
			));
			roleRepository.save(reception);
			log.info("Rôle créé: RECEPTION");
		}

		// Rôle RESTAURANT
		if (!roleRepository.existsByName("RESTAURANT")) {
			Role restaurant = new Role();
			restaurant.setName("RESTAURANT");
			restaurant.setDescription("Employé du restaurant");
			restaurant.setPermissions(Set.of(
					TypePermission.VOIR_COMMANDES,
					TypePermission.CREER_COMMANDE,
					TypePermission.MODIFIER_COMMANDE,
					TypePermission.GERER_MENU,
					TypePermission.VOIR_CONFIGURATION
			));
			roleRepository.save(restaurant);
			log.info("Rôle créé: RESTAURANT");
		}

		// Rôle ECONOMAT
		if (!roleRepository.existsByName("ECONOMAT")) {
			Role economat = new Role();
			economat.setName("ECONOMAT");
			economat.setDescription("Employé de l'économat");
			economat.setPermissions(Set.of(
					TypePermission.VOIR_STOCK,
					TypePermission.MODIFIER_STOCK,
					TypePermission.GERER_FOURNISSEURS,
					TypePermission.PASSER_COMMANDES,
					TypePermission.VOIR_CONFIGURATION
			));
			roleRepository.save(economat);
			log.info("Rôle créé: ECONOMAT");
		}

		// Rôle COMPTABLE
		if (!roleRepository.existsByName("COMPTABLE")) {
			Role comptable = new Role();
			comptable.setName("COMPTABLE");
			comptable.setDescription("Employé comptable");
			comptable.setPermissions(Set.of(
					TypePermission.VOIR_COMPTABILITE,
					TypePermission.MODIFIER_COMPTABILITE,
					TypePermission.GENERER_RAPPORTS,
					TypePermission.VOIR_CONFIGURATION
			));
			roleRepository.save(comptable);
			log.info("Rôle créé: COMPTABLE");
		}

		// Rôle MANAGER
		if (!roleRepository.existsByName("MANAGER")) {
			Role manager = new Role();
			manager.setName("MANAGER");
			manager.setDescription("Manager général");
			manager.setPermissions(Set.of(
					TypePermission.VOIR_RESERVATIONS,
					TypePermission.CREER_RESERVATION,
					TypePermission.MODIFIER_RESERVATION,
					TypePermission.ANNULER_RESERVATION,
					TypePermission.VOIR_COMMANDES,
					TypePermission.CREER_COMMANDE,
					TypePermission.MODIFIER_COMMANDE,
					TypePermission.GERER_MENU,
					TypePermission.VOIR_STOCK,
					TypePermission.MODIFIER_STOCK,
					TypePermission.GERER_FOURNISSEURS,
					TypePermission.PASSER_COMMANDES,
					TypePermission.VOIR_COMPTABILITE,
					TypePermission.GENERER_RAPPORTS,
					TypePermission.VOIR_CONFIGURATION,
					TypePermission.MODIFIER_CONFIGURATION,
					TypePermission.GERER_EMPLOYES,
					TypePermission.VOIR_EMPLOYES
			));
			roleRepository.save(manager);
			log.info("Rôle créé: MANAGER");
		}
	}
}
