package com.palette.palette.controller;

import java.util.ArrayList;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.palette.palette.dto.DesignQuizRequestDTO;
import com.palette.palette.dto.DesignQuizResponseDTO;
import com.palette.palette.entities.DesignQuiz;
import com.palette.palette.exceptions.ResourceNotFoundException;
import com.palette.palette.patterns.nullobject.NoStyleBundle;
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

        try {
            // ✅ Normal flow - submit quiz
            DesignQuizResponseDTO response = designQuizService.submitQuiz(dto, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalArgumentException e) {
            // ✅ VALIDATION ERROR - Return NoStyleBundle fallback
            System.err.println("Quiz validation error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(createErrorResponse(e.getMessage()));

        } catch (Exception e) {
            // ✅ UNEXPECTED ERROR - Return NoStyleBundle fallback
            System.err.println("Quiz processing error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.OK).body(createErrorResponse("Could not generate recommendations. Please try again."));
        }
    }


    @GetMapping("/latest")
    public ResponseEntity<DesignQuizResponseDTO> getLatestQuiz(
    @RequestParam Long userId) {

    try {
        // Get the user's most recent saved quiz
        DesignQuiz latestQuiz = designQuizService.getLatestQuiz(userId);

        // Reuse the existing recommendation logic
        DesignQuizRequestDTO request = new DesignQuizRequestDTO();
        request.setStyle(latestQuiz.getSelectedStyle());
        request.setRoomType(latestQuiz.getSelectedRoomType());

        DesignQuizResponseDTO response =
                designQuizService.submitQuiz(request);

        return ResponseEntity.ok(response);

    } catch (ResourceNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}

    /**
     * ✅ NULL OBJECT PATTERN: Creates safe fallback response with NoStyleBundle
     * When quiz fails, returns empty recommendations instead of crashing
     */
    private DesignQuizResponseDTO createErrorResponse(String errorMessage) {
        NoStyleBundle noBundle = new NoStyleBundle();

        // Convert NoStyleBundle to BundleDTO
        DesignQuizResponseDTO.BundleDTO bundleDTO = new DesignQuizResponseDTO.BundleDTO(
            null,
            noBundle.getStyleName(),
            noBundle.getStyleDescription(),
            noBundle.getDiscountFactor(),
            0.0  // No price for fallback
        );

        // Create error response
        DesignQuizResponseDTO response = new DesignQuizResponseDTO();
        response.setAestheticStyle("NONE");
        response.setRoomType("GENERIC");
        response.setRecommendationTitle("Default Recommendation");
        response.setMessage(errorMessage + " Showing default catalog options.");
        response.setRecommendedBundle(bundleDTO);
        response.setBundleProducts(new ArrayList<>()); // Empty products list

        return response;
    }
}