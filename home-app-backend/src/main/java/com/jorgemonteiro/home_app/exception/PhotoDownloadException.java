package com.jorgemonteiro.home_app.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when a profile photo cannot be downloaded or decoded from a remote URL.
 * Callers are expected to catch this and proceed without a photo rather than
 * blocking the authentication flow.
 */
@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class PhotoDownloadException extends HomeAppException {

    /**
     * Creates a new exception with the given message and root cause.
     *
     * @param message human-readable description of the failure
     * @param cause   the underlying I/O or URL parsing exception
     */
    public PhotoDownloadException(String message, Throwable cause) {
        super(message, cause);
    }

    public PhotoDownloadException(String message) {
        super(message);
    }
}