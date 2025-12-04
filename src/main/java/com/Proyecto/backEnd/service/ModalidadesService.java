package com.Proyecto.backEnd.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import com.Proyecto.backEnd.model.ModalidadesModel;
import com.Proyecto.backEnd.repository.ModalidadesRepo;
import jakarta.persistence.criteria.Predicate;

@Service
public class ModalidadesService {

    @Autowired
    ModalidadesRepo modalidadesRepo;

    /**
     * B-14. Listar, filtrar y paginar
     */
    public Page<ModalidadesModel> listarPaginado(String filtro, String estado, Pageable pageable) {
        Specification<ModalidadesModel> spec = (root, query, cb) -> {
            Predicate p = cb.conjunction();

            if (filtro != null && !filtro.isEmpty()) {
                p = cb.and(p, cb.like(cb.lower(root.get("nombre")), "%" + filtro.toLowerCase() + "%"));
            }

            if (estado.equals("ACTIVOS")) {
                p = cb.and(p, cb.equal(root.get("estado"), 1));
            } else if (estado.equals("BAJAS")) {
                p = cb.and(p, cb.equal(root.get("estado"), 0));
            }

            return p;
        };
        return modalidadesRepo.findAll(spec, pageable);
    }

    /**
     * B-14.1. Adicionar Modalidad
     */
    public ModalidadesModel crearModalidad(ModalidadesModel modalidad) {
    	 String nombreNormalizado = normalizarNombre(modalidad.getNombre());
         if (nombreNormalizado.isEmpty()) {
             throw new RuntimeException("El nombre de la modalidad es obligatorio.");
        }
         if (modalidadesRepo.existsByNombreIgnoreCase(nombreNormalizado)) {
             throw new RuntimeException("Ya existe una modalidad con el nombre: " + nombreNormalizado);
         }
         modalidad.setNombre(nombreNormalizado);
        modalidad.setEstado(1);
        return modalidadesRepo.save(modalidad);
    }

    /**
     * B-14.2. Modificar Datos de Modalidad
     */
    public ModalidadesModel modificarModalidad(int codmod, ModalidadesModel datos) {
        ModalidadesModel modalidad = modalidadesRepo.findById(codmod)
            .orElseThrow(() -> new RuntimeException("Modalidad no encontrada con id: " + codmod));

        String nombreNormalizado = normalizarNombre(modalidad.getNombre());
        if (nombreNormalizado.isEmpty()) {
            throw new RuntimeException("El nombre de la modalidad es obligatorio.");
        }
        if (modalidadesRepo.existsByNombreIgnoreCase(nombreNormalizado)) {
            throw new RuntimeException("Ya existe una modalidad con el nombre: " + nombreNormalizado);
        }
        modalidad.setNombre(nombreNormalizado);
        return modalidadesRepo.save(modalidad);
    }
    private String normalizarNombre(String nombre) {
        return nombre == null ? "" : nombre.trim();
    }

    /**
     * B-14.3. Eliminar Modalidad (Baja lógica)
     */
    public void eliminarLogico(int codmod) {
        ModalidadesModel modalidad = modalidadesRepo.findById(codmod)
            .orElseThrow(() -> new RuntimeException("Modalidad no encontrada con id: " + codmod));
        modalidad.setEstado(0);
        modalidadesRepo.save(modalidad);
    }

    /**
     * B-14.4. Habilitar Modalidad
     */
    public void habilitar(int codmod) {
        ModalidadesModel modalidad = modalidadesRepo.findById(codmod)
            .orElseThrow(() -> new RuntimeException("Modalidad no encontrada con id: " + codmod));
        modalidad.setEstado(1);
        modalidadesRepo.save(modalidad);
    }

    /**
     * Método auxiliar para buscar por ID
     */
    public ModalidadesModel buscarPorId(int codmod) {
        return modalidadesRepo.findById(codmod)
            .orElseThrow(() -> new RuntimeException("Modalidad no encontrada con id: " + codmod));
    }
}