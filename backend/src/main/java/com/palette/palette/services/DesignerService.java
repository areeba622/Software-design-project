package com.palette.palette.services;

import com.palette.palette.dto.DesignerDTO;
import com.palette.palette.entities.Designer;
import com.palette.palette.exceptions.ResourceNotFoundException;
import com.palette.palette.repository.DesignerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer for Designer gallery and profile operations.
 */
@Service
public class DesignerService {

    private final DesignerRepository designerRepository;

    public DesignerService(DesignerRepository designerRepository) {
        this.designerRepository = designerRepository;
    }

    /**
     * STEP 1: Fetch all designers for gallery grid view.
     * Frontend: GET /api/designers
     */
    @Transactional(readOnly = true)
    public List<DesignerDTO> getAllDesigners() {
        List<Designer> designers = designerRepository.findAll();
        return designers.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * STEP 3: Fetch single designer for profile detail page.
     * Frontend: GET /api/designers/{id}
     *
     * @throws ResourceNotFoundException if designer not found
     */
    @Transactional(readOnly = true)
    public DesignerDTO getDesignerById(Long id) {
        Designer designer = designerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Designer not found with id: " + id));
        return convertToDTO(designer);
    }

    /**
     * Maps Designer entity to DesignerDTO.
     */
    private DesignerDTO convertToDTO(Designer designer) {
        return new DesignerDTO(
                designer.getId(),
                designer.getName(),
                designer.getEmail(),
                designer.getBio(),
                designer.getPortfolioUrl(),
                designer.getHourlyRatePKR(),
                designer.getSpecialty(),
                designer.getPreferredStyle() != null
                        ? designer.getPreferredStyle().getName()
                        : "Unknown"
        );
    }
}