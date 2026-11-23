package com.palette.palette.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.palette.palette.entities.Cart;

import jakarta.persistence.LockModeType; //represent a value that may or may not exist

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    // Singleton CartManager uses this to find the persistent cart for a user
    Optional<Cart> findByUserId(Long userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from Cart c where c.id = :id")
    Optional<Cart> findByIdForUpdate(@Param("id") Long id);
}
