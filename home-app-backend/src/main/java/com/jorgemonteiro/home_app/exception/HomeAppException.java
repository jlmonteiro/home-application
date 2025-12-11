package com.jorgemonteiro.home_app.exception;

public class HomeAppException extends RuntimeException {
    public HomeAppException(String message) {
        super(message);
    }
    
    public HomeAppException(String message, Throwable cause) {
        super(message, cause);
    }
}