package com.Proyecto.backEnd.service;

import com.Proyecto.backEnd.model.DatosModel;
import com.Proyecto.backEnd.model.PersonalModel;
import com.Proyecto.backEnd.repository.DatosRepo;
import com.Proyecto.backEnd.repository.PersonalRepo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DatosService {

    @Autowired
    private DatosRepo datosRepo;

    @Autowired
    private PersonalRepo personalRepo;

    public DatosModel registrarDato(String cedula, int codp) {
        PersonalModel persona = personalRepo.findById(codp)
                .orElseThrow(() -> new RuntimeException("Persona no encontrada con codp: " + codp));

        if (datosRepo.existsByCedula(cedula)) {
            throw new RuntimeException("Ya existe una persona registrada con esa cédula");
        }

        DatosModel d = new DatosModel();
        d.setCedula(cedula);
        d.setPersonal(persona);
        return datosRepo.save(d);
    }
}
