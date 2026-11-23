package com.palette.palette.exceptions;

/**
 * Wrong email or password. Mapped to 401 with one generic message, so the
 * response never reveals whether an email has an account.
 */
public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException() {
        super("Invalid email or password.");
    }
}
