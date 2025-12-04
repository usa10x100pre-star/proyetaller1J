package com.Proyecto.backEnd.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Proyecto.backEnd.model.ItematId;
import com.Proyecto.backEnd.model.ItematModel;

public interface ItematRepo extends JpaRepository<ItematModel, ItematId> {
    List<ItematModel> findById_CodmatAndId_Gestion(String codmat, int gestion);
}