package com.Proyecto.backEnd.exception;

import com.Proyecto.backEnd.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.bind.annotation.ExceptionHandler;

@RestControllerAdvice
public class GlobalExceptionHandler {
	
	 public GlobalExceptionHandler() {
	        System.out.println("✅ ===== GlobalExceptionHandler INICIALIZADO =====");
	        System.out.println("✅ Listo para capturar excepciones");
	    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex, WebRequest request) {
        System.out.println("🔴 ===== CAPTURANDO RuntimeException =====");
        System.out.println("🔴 Mensaje: " + ex.getMessage());
        System.out.println("🔴 Tipo: " + ex.getClass().getName());

        HttpStatus status = determineHttpStatus(ex);
        String userFriendlyMessage = getUserFriendlyMessage(ex);
        
        System.out.println("🔴 Status HTTP: " + status);
        System.out.println("🔴 Mensaje usuario: " + userFriendlyMessage);

      
        ErrorResponse errorResponse = new ErrorResponse(
                userFriendlyMessage,
                ex.getMessage(),
                status.value()
            );

            return new ResponseEntity<>(errorResponse, status);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex, WebRequest request) {
        System.out.println("🔴 ===== CAYENDO EN Exception GENÉRICA =====");
        System.out.println("🔴 Tipo: " + ex.getClass().getName());
        System.out.println("🔴 Mensaje: " + ex.getMessage());
        ex.printStackTrace();

        ErrorResponse errorResponse = new ErrorResponse(
            "Error interno del servidor",
            "Ha ocurrido un error inesperado",
            HttpStatus.INTERNAL_SERVER_ERROR.value()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private HttpStatus determineHttpStatus(RuntimeException ex) {
        String message = ex.getMessage();
        System.out.println("🔴 Analizando mensaje para status: " + message);

        if (message != null) {
            if (message.contains("no encontrado") ||
                message.contains("no encontrada") ||
                message.contains("Menú o Proceso no encontrado")) {
                return HttpStatus.NOT_FOUND;
            } else if (message.contains("Ya existe") ||
                       message.contains("duplicado") ||
                       message.contains("duplicada")) {
                return HttpStatus.CONFLICT;
            }
        }
        return HttpStatus.BAD_REQUEST;
    }
    private String getUserFriendlyMessage(RuntimeException ex) {
        String message = ex.getMessage();
        if (message != null) {
            if (message.contains("no encontrado") || message.contains("no encontrada")) {
                return "Recurso no encontrado";
            } else if (message.contains("Ya existe")) {
                return "Recurso duplicado";
            } else if (message.contains("Menú o Proceso no encontrado")) {
                return "Menú o proceso no encontrado";
            }
        }
        return "Error en la operación";
    }

}
