package com.Proyecto.backEnd.service;

import com.Proyecto.backEnd.exception.CedulaDuplicadaException;
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

        // 🔥 VALIDAR DUPLICADO
        if (datosRepo.existsByCedula(cedula)) {
            personalRepo.delete(persona);
            throw new CedulaDuplicadaException("La cédula " + cedula + " ya está registrada");
        }

        DatosModel d = new DatosModel();
        d.setCedula(cedula);
        d.setPersonal(persona);

        return datosRepo.save(d);
    }
}
