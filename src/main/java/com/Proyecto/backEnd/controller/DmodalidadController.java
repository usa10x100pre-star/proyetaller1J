package com.Proyecto.backEnd.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.Proyecto.backEnd.model.DmodalidadModel;
import com.Proyecto.backEnd.service.DmodalidadService;

@RestController
@RequestMapping("/api/dmodalidades")
@CrossOrigin(origins = "http://localhost:4200")
public class DmodalidadController {

    @Autowired
    DmodalidadService dmodalidadService;

    /**
     * Lista, filtra y pagina los detalles de modalidad.
     */
    @GetMapping
    public ResponseEntity<Page<DmodalidadModel>> listar(
        @RequestParam(required = false, defaultValue = "") String filtro,
        @RequestParam(defaultValue = "TODOS") String estado,
        @RequestParam(required = false) Integer codmod,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(dmodalidadService.listarPaginado(filtro, estado, codmod, pageable));
    }

    /**
     * Adiciona un detalle de modalidad.
     */
    @PostMapping
    public ResponseEntity<DmodalidadModel> crear(@RequestBody DmodalidadModel detalle) {
        return ResponseEntity.ok(dmodalidadService.crear(detalle));
    }

    /**
     * Modifica datos del detalle de modalidad.
     */
    @PutMapping("/{coddm}")
    public ResponseEntity<DmodalidadModel> modificar(@PathVariable String coddm, @RequestBody DmodalidadModel detalle) {
        return ResponseEntity.ok(dmodalidadService.modificar(coddm, detalle));
    }

    /**
     * Elimina (baja lógica) un detalle de modalidad.
     */
    @DeleteMapping("/{coddm}")
    public ResponseEntity<Void> eliminar(@PathVariable String coddm) {
        dmodalidadService.eliminar(coddm);
        return ResponseEntity.noContent().build();
    }

    /**
     * Habilita un detalle de modalidad dado de baja.
     */
    @PutMapping("/{coddm}/habilitar")
    public ResponseEntity<Void> habilitar(@PathVariable String coddm) {
        dmodalidadService.habilitar(coddm);
        return ResponseEntity.noContent().build();
    }

    /**
     * Busca un detalle de modalidad por su identificador.
     */
    @GetMapping("/{coddm}")
    public ResponseEntity<DmodalidadModel> buscarPorId(@PathVariable String coddm) {
        return ResponseEntity.ok(dmodalidadService.buscarPorId(coddm));
    }
}