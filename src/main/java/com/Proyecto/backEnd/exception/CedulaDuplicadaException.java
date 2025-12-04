package com.Proyecto.backEnd.exception;

public class CedulaDuplicadaException extends RuntimeException {

    public CedulaDuplicadaException(String message) {
        super(message);
    }
}