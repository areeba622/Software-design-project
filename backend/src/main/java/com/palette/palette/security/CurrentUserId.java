package com.palette.palette.security;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Injects the id of the logged-in user (taken from the JWT) into a controller
 * method parameter. The user id is never read from the URL or request body,
 * so one user cannot act on another user's cart, orders or rooms.
 *
 * <pre>
 * &#64;GetMapping
 * public CartResponseDTO getCart(&#64;CurrentUserId Long userId) { ... }
 * </pre>
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
public @interface CurrentUserId {

    /** When false, the parameter is {@code null} for anonymous requests instead of a 401. */
    boolean required() default true;
}
