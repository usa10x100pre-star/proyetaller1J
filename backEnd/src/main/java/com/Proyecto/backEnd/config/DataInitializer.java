package com.Proyecto.backEnd.config;

import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.Proyecto.backEnd.model.MenusModel;
import com.Proyecto.backEnd.model.ProcesosModel;
import com.Proyecto.backEnd.model.RolesModel;
import com.Proyecto.backEnd.repository.MenusRepo;
import com.Proyecto.backEnd.repository.ProcesosRepo;
import com.Proyecto.backEnd.repository.RolesRepo;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RolesRepo rolesRepo;
    private final MenusRepo menusRepo;
    private final ProcesosRepo procesosRepo;

    public DataInitializer(RolesRepo rolesRepo, MenusRepo menusRepo, ProcesosRepo procesosRepo) {
        this.rolesRepo = rolesRepo;
        this.menusRepo = menusRepo;
        this.procesosRepo = procesosRepo;
    }

    @Override
    @Transactional
    public void run(String... args) {
        asegurarAsignacionesBasicas();
    }

    private void asegurarAsignacionesBasicas() {
        RolesModel profesor = rolesRepo.findByNombreIgnoreCase("Profesor").orElse(null);
        if (profesor != null) {
            MenusModel menuProfesor = obtenerOCrearMenu("Menu Profesor");
            vincularMenuConRol(profesor, menuProfesor);
            vincularProcesoConMenu(menuProfesor, "/asignardicta");
        }

        RolesModel estudiante = rolesRepo.findByNombreIgnoreCase("Estudiante").orElseGet(() -> {
            RolesModel nuevo = new RolesModel();
            nuevo.setNombre("Estudiante");
            nuevo.setEstado(1);
            return rolesRepo.save(nuevo);
        });

        MenusModel menuEstudiante = obtenerOCrearMenu("Menu Estudiante");
        vincularMenuConRol(estudiante, menuEstudiante);
        vincularProcesoConMenu(menuEstudiante, "/inscripcionAlumnos");
    }

    private MenusModel obtenerOCrearMenu(String nombre) {
        return menusRepo.findByNombreIgnoreCase(nombre).orElseGet(() -> {
            MenusModel nuevo = new MenusModel();
            nuevo.setNombre(nombre);
            nuevo.setEstado(1);
            return menusRepo.save(nuevo);
        });
    }

    private void vincularMenuConRol(RolesModel rol, MenusModel menu) {
        List<MenusModel> menus = rol.getMenus();
        if (menus == null) {
            menus = new ArrayList<>();
            rol.setMenus(menus);
        }

        boolean yaAsignado = menus.stream().anyMatch(m -> m.getCodm() == menu.getCodm());
        if (!yaAsignado) {
            menus.add(menu);
            rolesRepo.save(rol);
        }
    }

    private void vincularProcesoConMenu(MenusModel menu, String enlace) {
        ProcesosModel proceso = procesosRepo.findByEnlaceIgnoreCase(enlace).orElse(null);
        if (proceso == null) {
            return;
        }

        List<ProcesosModel> procesos = menu.getProcesos();
        if (procesos == null) {
            procesos = new ArrayList<>();
            menu.setProcesos(procesos);
        }

        boolean yaAsignado = procesos.stream().anyMatch(p -> p.getCodp() == proceso.getCodp());
        if (!yaAsignado) {
            procesos.add(proceso);
            menusRepo.save(menu);
        }
    }
}