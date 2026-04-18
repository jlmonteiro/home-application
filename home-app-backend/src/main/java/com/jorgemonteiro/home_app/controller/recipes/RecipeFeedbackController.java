package com.jorgemonteiro.home_app.controller.recipes;

import com.jorgemonteiro.home_app.model.adapter.recipes.RecipeAdapter;
import com.jorgemonteiro.home_app.model.dtos.recipes.RecipeCommentDTO;
import com.jorgemonteiro.home_app.model.dtos.recipes.RecipeRatingDTO;
import com.jorgemonteiro.home_app.service.recipes.RecipeFeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST controller for recipe comments and ratings.
 */
@RestController
@RequestMapping("/api/recipes/{recipeId}")
@RequiredArgsConstructor
public class RecipeFeedbackController {

    private final RecipeFeedbackService feedbackService;
    private final RecipeAdapter recipeAdapter;

    @GetMapping("/comments")
    public List<RecipeCommentDTO> getComments(@PathVariable Long recipeId) {
        return feedbackService.getComments(recipeId).stream()
                .map(recipeAdapter::toCommentDTO)
                .collect(Collectors.toList());
    }

    @PostMapping("/comments")
    public RecipeCommentDTO addComment(@PathVariable Long recipeId, @RequestBody RecipeCommentDTO dto, @AuthenticationPrincipal OAuth2User principal) {
        return recipeAdapter.toCommentDTO(feedbackService.addComment(recipeId, dto.getComment(), principal));
    }

    @DeleteMapping("/comments/{commentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteComment(@PathVariable Long recipeId, @PathVariable Long commentId, @AuthenticationPrincipal OAuth2User principal) {
        feedbackService.deleteComment(commentId, principal);
    }

    @GetMapping("/rating")
    public RecipeRatingDTO getUserRating(@PathVariable Long recipeId, @AuthenticationPrincipal OAuth2User principal) {
        return recipeAdapter.toRatingDTO(feedbackService.getUserRating(recipeId, principal));
    }

    @PostMapping("/rating")
    public RecipeRatingDTO rateRecipe(@PathVariable Long recipeId, @RequestBody RecipeRatingDTO dto, @AuthenticationPrincipal OAuth2User principal) {
        return recipeAdapter.toRatingDTO(feedbackService.rateRecipe(recipeId, dto.getRating(), principal));
    }
}
