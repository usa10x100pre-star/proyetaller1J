package com.Proyecto.backEnd.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor; // Importar
import com.Proyecto.backEnd.model.ProcesosModel;

public interface ProcesosRepo extends JpaRepository<ProcesosModel,Integer>, JpaSpecificationExecutor<ProcesosModel> { 
	 Optional<ProcesosModel> findByEnlaceIgnoreCase(String enlace);
}