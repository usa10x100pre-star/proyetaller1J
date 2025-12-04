package com.Proyecto.backEnd.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "dmodalidad")
@Getter
@Setter
public class DmodalidadModel {

    @Id
    @Column(length = 15, nullable = false)
    private String coddm;

    @Column(length = 40, nullable = false)
    private String nombre;

    @Column(nullable = false)
    private int estado;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "codmod", nullable = false)
    private ModalidadesModel modalidad;
}