package com.Proyecto.backEnd.repository;

import com.Proyecto.backEnd.model.DictaId;
import com.Proyecto.backEnd.model.DictaModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface DictaRepo extends JpaRepository<DictaModel, DictaId>, JpaSpecificationExecutor<DictaModel> {
    // JpaSpecificationExecutor nos permitirá hacer los filtros complejos de B-16
	 java.util.Optional<DictaModel> findById_CodmatAndId_CodparAndId_Gestion(String codmat, Integer codpar, int gestion);
}
