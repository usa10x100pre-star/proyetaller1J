package com.Proyecto.backEnd.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import com.Proyecto.backEnd.model.ModalidadesModel;

public interface ModalidadesRepo extends JpaRepository<ModalidadesModel, Integer>, JpaSpecificationExecutor<ModalidadesModel> {

    boolean existsByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCaseAndCodmodNot(String nombre, Integer codmod);
}