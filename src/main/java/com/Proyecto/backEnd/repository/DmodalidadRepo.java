package com.Proyecto.backEnd.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import com.Proyecto.backEnd.model.DmodalidadModel;

public interface DmodalidadRepo extends JpaRepository<DmodalidadModel, String>, JpaSpecificationExecutor<DmodalidadModel> {

    boolean existsByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCaseAndCoddmNot(String nombre, String coddm);
}