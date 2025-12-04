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
	import com.Proyecto.backEnd.model.ModalidadesModel;
	import com.Proyecto.backEnd.service.ModalidadesService;

	@RestController
	@RequestMapping("/api/modalidades")
	@CrossOrigin(origins = "http://localhost:4200")
	public class ModalidadesController {

	    @Autowired
	    ModalidadesService modalidadesService;

	    /**
	     * B-14. Listar, filtrar y paginar
	     */
	    @GetMapping
	    public ResponseEntity<Page<ModalidadesModel>> listar(
	        @RequestParam(required = false, defaultValue = "") String filtro,
	        @RequestParam(defaultValue = "TODOS") String estado,
	        @RequestParam(defaultValue = "0") int page,
	        @RequestParam(defaultValue = "10") int size
	    ) {
	        Pageable pageable = PageRequest.of(page, size);
	        return ResponseEntity.ok(modalidadesService.listarPaginado(filtro, estado, pageable));
	    }

	    /**
	     * B-14.1. Adicionar Modalidad
	     */
	    @PostMapping
	    public ResponseEntity<ModalidadesModel> crear(@RequestBody ModalidadesModel modalidad) {
	        return ResponseEntity.ok(modalidadesService.crearModalidad(modalidad));
	    }

	    /**
	     * B-14.2. Modificar Datos de Modalidad
	     */
	    @PutMapping("/{codmod}")
	    public ResponseEntity<ModalidadesModel> modificar(@PathVariable int codmod, @RequestBody ModalidadesModel modalidad) {
	        return ResponseEntity.ok(modalidadesService.modificarModalidad(codmod, modalidad));
	    }

	    /**
	     * B-14.3. Eliminar Modalidad (Baja lógica)
	     */
	    @DeleteMapping("/{codmod}")
	    public ResponseEntity<Void> eliminar(@PathVariable int codmod) {
	        modalidadesService.eliminarLogico(codmod);
	        return ResponseEntity.noContent().build();
	    }

	    /**
	     * B-14.4. Habilitar Modalidad
	     */
	    @PutMapping("/{codmod}/habilitar")
	    public ResponseEntity<Void> habilitar(@PathVariable int codmod) {
	        modalidadesService.habilitar(codmod);
	        return ResponseEntity.noContent().build();
	    }

	    /**
	     * Endpoint auxiliar para buscar por ID
	     */
	    @GetMapping("/{codmod}")
	    public ResponseEntity<ModalidadesModel> buscarPorId(@PathVariable int codmod) {
	        return ResponseEntity.ok(modalidadesService.buscarPorId(codmod));
	    }
	}

