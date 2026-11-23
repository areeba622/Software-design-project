package com.palette.palette.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.palette.palette.dto.DesignerDTO;
import com.palette.palette.services.DesignerService;

/**
 * REST Controller for Interior Designer gallery and profile endpoints.
 */
@RestController
@RequestMapping("/api/designers")
public class DesignerController {

    private final DesignerService designerService;

    public DesignerController(DesignerService designerService) {
        this.designerService = designerService;
    }

    @GetMapping
    public ResponseEntity<List<DesignerDTO>> getAllDesigners() {
        List<DesignerDTO> designers = designerService.getAllDesigners();
        return ResponseEntity.ok(designers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DesignerDTO> getDesignerById(@PathVariable Long id) {
        DesignerDTO designer = designerService.getDesignerById(id);
        return ResponseEntity.ok(designer);
    }
}