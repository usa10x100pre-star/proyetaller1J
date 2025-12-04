package com.Proyecto.backEnd.model;

import java.time.LocalDate;
import com.Proyecto.backEnd.model.DatosModel;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name="personal")
@Getter
@Setter
public class PersonalModel {
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // ✅ autoincremental
    private Integer codp;
	String nombre;
	String ap;
	String am;
	int estado;
	LocalDate fnac; 	 
	String ecivil;
	String genero;
	String direc;
	String telf;
    String tipo;
    String foto;

    @Transient
    private Integer tieneClave;
    @Transient
    private String cedula;

    @OneToOne(mappedBy="personal")
    @JsonBackReference
    private UsuariosModel usuarios;

    @OneToOne(mappedBy = "personal")
    @JsonManagedReference
    private DatosModel datos;

}