package com.Proyecto.backEnd.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentials(BadCredentialsException ex) {

        Map<String, Object> body = new HashMap<>();
        body.put("mensaje", "Usuario o contraseña incorrectos");
        body.put("timestamp", LocalDateTime.now());

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(body);
    }
@ExceptionHandler(TokenVencidoException.class)
public ResponseEntity<Map<String, Object>> handleTokenVencido(TokenVencidoException ex) {

    Map<String, Object> body = new HashMap<>();
    body.put("mensaje", ex.getMessage());
    body.put("timestamp", LocalDateTime.now());

    return ResponseEntity
            .status(HttpStatus.UNAUTHORIZED) // 401
            .body(body);
}

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntime(RuntimeException ex) {

        Map<String, Object> body = new HashMap<>();
        body.put("mensaje", ex.getMessage()); 
        body.put("timestamp", LocalDateTime.now());

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(body);
    }
    @ExceptionHandler(CedulaDuplicadaException.class)
    public ResponseEntity<Map<String, Object>> handleCedulaDuplicada(CedulaDuplicadaException ex) {

        Map<String, Object> body = new HashMap<>();
        body.put("mensaje", ex.getMessage());
        body.put("timestamp", LocalDateTime.now());

        return ResponseEntity
                .status(HttpStatus.CONFLICT) // 409
                .body(body);
    }

    // Captura cualquier excepción NO controlada
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneral(Exception ex) {

        Map<String, Object> body = new HashMap<>();
        body.put("mensaje", "Error interno del servidor");
        body.put("detalle", ex.getMessage());
        body.put("timestamp", LocalDateTime.now());

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(body);
    }
    @ExceptionHandler(UsuarioNoEncontradoException.class)
    public ResponseEntity<Map<String, Object>> handleUsuarioNoEncontrado(UsuarioNoEncontradoException ex) {

        Map<String, Object> body = new HashMap<>();
        body.put("mensaje", ex.getMessage());
        body.put("timestamp", LocalDateTime.now());

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)  
                .body(body);
    }
}
