package com.Proyecto.backEnd.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "modalidades")
@Getter
@Setter
public class ModalidadesModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer codmod;

    @Column(length = 60, nullable = false, unique = true)
    private String nombre;

    @Column(nullable = false)
    private int estado;
}