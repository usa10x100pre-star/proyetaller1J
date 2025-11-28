package com.Proyecto.backEnd.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import com.Proyecto.backEnd.model.DatosModel;

public interface DatosRepo extends JpaRepository<DatosModel, Integer> {
    boolean existsByCedula(String cedula);
    Optional<DatosModel> findByCedula(String cedula);
}
