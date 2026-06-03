package com.palette.palette.repository;

import com.palette.palette.entities.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional; //represent a value that may or may not exist

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    // Singleton CartManager uses this to find the persistent cart for a user
    Optional<Cart> findByUserId(Long userId);
}

/*
There are only two possible scenarios:

The cart exists: The user was shopping earlier, and their cart row is sitting inside pgAdmin.

The cart does NOT exist: This is a brand new user who has never added an item to a basket before.

By returning Optional<Cart>, the repository is explicitly telling your application: "I might return a valid Cart object, or I might return an empty container because no cart exists for this user ID."
*/