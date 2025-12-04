package com.Proyecto.backEnd.exception;

public class TokenVencidoException extends RuntimeException {

    public TokenVencidoException(String message) {
        super(message);
    }
}
