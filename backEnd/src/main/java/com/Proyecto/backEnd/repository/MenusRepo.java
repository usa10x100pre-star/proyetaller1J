package com.Proyecto.backEnd.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor; // Importar
import com.Proyecto.backEnd.model.MenusModel;

public interface MenusRepo extends JpaRepository<MenusModel,Integer>, JpaSpecificationExecutor<MenusModel> { 
	  Optional<MenusModel> findByNombreIgnoreCase(String nombre);
}