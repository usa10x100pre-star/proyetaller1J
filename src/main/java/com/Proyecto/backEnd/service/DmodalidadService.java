package com.Proyecto.backEnd.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import com.Proyecto.backEnd.model.DmodalidadModel;
import com.Proyecto.backEnd.model.ModalidadesModel;
import com.Proyecto.backEnd.repository.DmodalidadRepo;
import com.Proyecto.backEnd.repository.ModalidadesRepo;
import jakarta.persistence.criteria.Predicate;

@Service
public class DmodalidadService {

    @Autowired
    DmodalidadRepo dmodalidadRepo;

    @Autowired
    ModalidadesRepo modalidadesRepo;

    /**
     * Lista, filtra y pagina los tipos de modalidad.
     */
    public Page<DmodalidadModel> listarPaginado(String filtro, String estado, Integer codmod, Pageable pageable) {
        Specification<DmodalidadModel> spec = (root, query, cb) -> {
            Predicate predicate = cb.conjunction();

            if (filtro != null && !filtro.isEmpty()) {
                String likeFiltro = "%" + filtro.toLowerCase() + "%";
                predicate = cb.and(predicate,
                    cb.or(
                        cb.like(cb.lower(root.get("nombre")), likeFiltro),
                        cb.like(cb.lower(root.get("coddm")), likeFiltro)
                    )
                );
            }

            if (codmod != null) {
                predicate = cb.and(predicate, cb.equal(root.get("modalidad").get("codmod"), codmod));
            }

            if ("ACTIVOS".equalsIgnoreCase(estado)) {
                predicate = cb.and(predicate, cb.equal(root.get("estado"), 1));
            } else if ("BAJAS".equalsIgnoreCase(estado)) {
                predicate = cb.and(predicate, cb.equal(root.get("estado"), 0));
            }

            return predicate;
        };

        return dmodalidadRepo.findAll(spec, pageable);
    }

    /**
     * Crea un nuevo detalle de modalidad.
     */
    public DmodalidadModel crear(DmodalidadModel detalle) {
        if (detalle.getCoddm() == null || detalle.getCoddm().isBlank()) {
        	String codigo = "DM-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            detalle.setCoddm(codigo);
        }

        if (dmodalidadRepo.existsById(detalle.getCoddm())) {
            throw new RuntimeException("Ya existe un detalle de modalidad con código: " + detalle.getCoddm());
        }

        if (dmodalidadRepo.existsByNombreIgnoreCase(detalle.getNombre())) {
            throw new RuntimeException("Ya existe un detalle de modalidad con nombre: " + detalle.getNombre());
        }

        if (detalle.getModalidad() == null || detalle.getModalidad().getCodmod() == null) {
            throw new RuntimeException("La modalidad es obligatoria para registrar el detalle.");
        }

        ModalidadesModel modalidad = modalidadesRepo.findById(detalle.getModalidad().getCodmod())
        		 .orElseThrow(() -> new RuntimeException("Modalidad no encontrada con id: " + detalle.getModalidad().getCodmod()));


        detalle.setModalidad(modalidad);
        detalle.setEstado(1);
        return dmodalidadRepo.save(detalle);
    }

    /**
     * Modifica un detalle de modalidad existente.
     */
    public DmodalidadModel modificar(String coddm, DmodalidadModel datos) {
        DmodalidadModel detalle = dmodalidadRepo.findById(coddm)
            .orElseThrow(() -> new RuntimeException("Detalle de modalidad no encontrado con id: " + coddm));

        if (dmodalidadRepo.existsByNombreIgnoreCaseAndCoddmNot(datos.getNombre(), coddm)) {
            throw new RuntimeException("Ya existe un detalle de modalidad con nombre: " + datos.getNombre());
        }

        if (datos.getModalidad() == null || datos.getModalidad().getCodmod() == null) {
            throw new RuntimeException("La modalidad es obligatoria para registrar el detalle.");
        }

        ModalidadesModel modalidad = modalidadesRepo.findById(datos.getModalidad().getCodmod())
            .orElseThrow(() -> new RuntimeException("Modalidad no encontrada con id: " + datos.getModalidad().getCodmod()));

        detalle.setNombre(datos.getNombre());
        detalle.setModalidad(modalidad);
        return dmodalidadRepo.save(detalle);
    }

    /**
     * Realiza baja lógica del detalle de modalidad.
     */
    public void eliminar(String coddm) {
        DmodalidadModel detalle = dmodalidadRepo.findById(coddm)
            .orElseThrow(() -> new RuntimeException("Detalle de modalidad no encontrado con id: " + coddm));
        detalle.setEstado(0);
        dmodalidadRepo.save(detalle);
    }

    /**
     * Reactiva un detalle dado de baja.
     */
    public void habilitar(String coddm) {
        DmodalidadModel detalle = dmodalidadRepo.findById(coddm)
            .orElseThrow(() -> new RuntimeException("Detalle de modalidad no encontrado con id: " + coddm));
        detalle.setEstado(1);
        dmodalidadRepo.save(detalle);
    }

    /**
     * Busca un detalle de modalidad por ID.
     */
    public DmodalidadModel buscarPorId(String coddm) {
        return dmodalidadRepo.findById(coddm)
            .orElseThrow(() -> new RuntimeException("Detalle de modalidad no encontrado con id: " + coddm));
    }
}