package com.Proyecto.backEnd.service;

import java.util.Optional; // Quitamos import java.util.List

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.Proyecto.backEnd.model.PersonalModel;
import com.Proyecto.backEnd.model.UsuariosModel;
import com.Proyecto.backEnd.repository.PersonalRepo;
import com.Proyecto.backEnd.repository.UsuariosRepo;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;

@Service
public class UsuariosService {

    @Autowired
    private UsuariosRepo usuariosRepo;

    @Autowired
    private PersonalRepo personalRepo;

    // --- ❌ MÉTODO CONFLICTIVO ELIMINADO ---
    /*
    public List<UsuariosModel> listaUsuarios() {
        return usuariosRepo.findAll();
    }
    */
    
    // ✅ Este es el único método que debe existir para listar
    public Page<UsuariosModel> listarUsuariosPaginado(String filtro, Pageable pageable) {
        
        Specification<UsuariosModel> spec = (root, query, cb) -> {
            Predicate p = cb.conjunction(); 
            p = cb.and(p, cb.equal(root.get("estado"), 1)); // Solo usuarios activos

            if (filtro != null && !filtro.isEmpty()) {
                String filtroLower = "%" + filtro.toLowerCase() + "%";
                Join<UsuariosModel, PersonalModel> personalJoin = root.join("personal");

                p = cb.and(p, cb.or(
                    cb.like(cb.lower(personalJoin.get("nombre")), filtroLower),
                    cb.like(cb.lower(personalJoin.get("ap")), filtroLower),
                    cb.like(cb.lower(personalJoin.get("am")), filtroLower)
                ));
            }
            return p;
        };
        return usuariosRepo.findAll(spec, pageable);
    }
    
    // El resto de tus métodos (buscarPorLogin, crearUsuario, etc.) están bien
    public UsuariosModel buscarPorLogin(String login) {
        return usuariosRepo.findByLogin(login)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + login));
    }
    
    public UsuariosModel crearUsuario(UsuariosModel usuario) {
        if (usuario.getPersonal() != null) {
            PersonalModel per = personalRepo.findById(usuario.getPersonal().getCodp())
                    .orElseThrow(() -> new RuntimeException("Personal no encontrado"));
            usuario.setPersonal(per);
        }
        usuario.setEstado(1); 
        return usuariosRepo.save(usuario);
    }
    
    public UsuariosModel modificarUsuario(String login, UsuariosModel datos) {
        UsuariosModel u = buscarPorLogin(login);
        if (datos.getPassword() != null && !datos.getPassword().isEmpty()) {
            u.setPassword(datos.getPassword());
        }
        if (datos.getEstado() >= 0) { 
            u.setEstado(datos.getEstado());
        }
        return usuariosRepo.save(u);
    }
    
    public void eliminarLogico(String login) {
        UsuariosModel u = buscarPorLogin(login);
        u.setEstado(0);
        usuariosRepo.save(u);
    }
    
    public void habilitarUsuario(String login) {
        UsuariosModel u = buscarPorLogin(login);
        u.setEstado(1);
        usuariosRepo.save(u);
    }
}