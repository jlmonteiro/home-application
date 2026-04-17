package com.jorgemonteiro.home_app.controller.recipes;

import com.jorgemonteiro.home_app.model.dtos.recipes.LabelDTO;
import com.jorgemonteiro.home_app.service.recipes.LabelService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST controller for managing labels.
 */
@RestController
@RequestMapping("/api/labels")
@RequiredArgsConstructor
public class LabelController {

    private final LabelService labelService;

    /**
     * Searches for labels matching the query.
     * @param query the search term.
     * @return a list of matching LabelDTOs.
     */
    @GetMapping
    public List<LabelDTO> searchLabels(@RequestParam(name = "q", defaultValue = "") String query) {
        return labelService.searchLabels(query).stream()
                .map(l -> new LabelDTO(l.getName()))
                .collect(Collectors.toList());
    }
}
