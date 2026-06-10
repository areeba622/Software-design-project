package com.palette.palette.repository;

import com.palette.palette.entities.Designer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for Designer entity.
 * Inherits findAll() and findById() from JpaRepository.
 */
@Repository
public interface DesignerRepository extends JpaRepository<Designer, Long> {
    // No custom queries needed
}