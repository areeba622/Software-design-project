package com.palette.palette.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.palette.palette.entities.DesignQuiz;

@Repository
public interface DesignQuizRepository extends JpaRepository<DesignQuiz, Long> {

    // Find quiz by user
    List<DesignQuiz> findByUserId(Long userId);

    // Find most recent quiz for user
    Optional<DesignQuiz> findFirstByUserIdOrderByCreatedAtDesc(Long userId);

    // Find quizzes by preferred style
   // List<DesignQuiz> findByPreferredStyle(String style);

    // Find quizzes by room type
   // List<DesignQuiz> findByRoomType(String roomType);


 List<DesignQuiz> findBySelectedStyle(String style);       // was findByPreferredStyle

    List<DesignQuiz> findBySelectedRoomType(String roomType); // was findByRoomType
}

