package com.palette.palette.controller;

import com.palette.palette.dto.DesignerDTO;
import com.palette.palette.services.DesignerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    /**
     * STEP 1: GET /api/designers
     * Returns all designers for the gallery grid.
     *
     * @return 200 OK with List<DesignerDTO>
     */
    @GetMapping
    public ResponseEntity<List<DesignerDTO>> getAllDesigners() {
        List<DesignerDTO> designers = designerService.getAllDesigners();
        return ResponseEntity.ok(designers);
    }

    /**
     * STEP 3: GET /api/designers/{id}
     * Returns a single designer's full profile.
     *
     * @param id designer ID
     * @return 200 OK with DesignerDTO, or 404 if not found
     */
    @GetMapping("/{id}")
    public ResponseEntity<DesignerDTO> getDesignerById(@PathVariable Long id) {
        DesignerDTO designer = designerService.getDesignerById(id);
        return ResponseEntity.ok(designer);
    }
}