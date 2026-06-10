package com.palette.palette.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.palette.palette.dto.DesignQuizRequestDTO;
import com.palette.palette.dto.DesignQuizResponseDTO;
import com.palette.palette.services.DesignQuizService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/design-quiz")
public class DesignQuizController {

    private final DesignQuizService designQuizService;

    public DesignQuizController(DesignQuizService designQuizService) {
        this.designQuizService = designQuizService;
    }

    @PostMapping("/submit")
    public ResponseEntity<DesignQuizResponseDTO> submitQuiz(
            @Valid @RequestBody DesignQuizRequestDTO dto,
            @RequestParam(required = false) Long userId) {

        DesignQuizResponseDTO response = designQuizService.submitQuiz(dto, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}