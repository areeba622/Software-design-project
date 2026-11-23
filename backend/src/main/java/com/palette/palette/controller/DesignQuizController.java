package com.palette.palette.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.palette.palette.dto.DesignQuizRequestDTO;
import com.palette.palette.dto.DesignQuizResponseDTO;
import com.palette.palette.security.CurrentUserId;
import com.palette.palette.services.DesignQuizService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/design-quiz")
@RequiredArgsConstructor
public class DesignQuizController {

    private final DesignQuizService designQuizService;

    /** Open to guests; the result is saved only when the user is logged in. */
    @PostMapping("/submit")
    @ResponseStatus(HttpStatus.CREATED)
    public DesignQuizResponseDTO submitQuiz(@CurrentUserId(required = false) Long userId,
                                            @Valid @RequestBody DesignQuizRequestDTO dto) {
        return designQuizService.submitQuiz(dto.getStyle(), dto.getRoomType(), userId);
    }

    /** The recommendation from the user's most recent quiz, or 204 No Content if they haven't taken it. */
    @GetMapping("/latest")
    public ResponseEntity<DesignQuizResponseDTO> getLatestQuiz(@CurrentUserId Long userId) {
        return designQuizService.getLatestRecommendation(userId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }
}
