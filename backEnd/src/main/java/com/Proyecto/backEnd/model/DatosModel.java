package com.Proyecto.backEnd.model;

import jakarta.persistence.*;
import org.springframework.data.domain.Persistable;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "datos")
public class DatosModel implements Persistable<Integer> {

    @Id
    private Integer codp;

    @Column(length = 10, nullable = false, unique = true)
    private String cedula;

    // Relación con la tabla PERSONAL
    @OneToOne
    @MapsId  // usa el mismo codp como ID
    @JoinColumn(name = "codp")
    @JsonBackReference
    private PersonalModel personal;

    @Transient
    private boolean isNew = true;
    
    // Getters y setters
    @Override
    public Integer getId() { return codp; }
    
    public Integer getCodp() { return codp; }
    public void setCodp(Integer codp) { this.codp = codp; }

    public String getCedula() { return cedula; }
    public void setCedula(String cedula) { this.cedula = cedula; }

    public PersonalModel getPersonal() { return personal; }
    public void setPersonal(PersonalModel personal) { this.personal = personal; }
    
    @Override
    public boolean isNew() { return isNew; }

    @PostLoad
    @PostPersist
    void markNotNew() {
        this.isNew = false;
    }
}

