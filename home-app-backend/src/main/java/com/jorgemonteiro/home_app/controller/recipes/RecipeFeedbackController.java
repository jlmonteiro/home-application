package com.jorgemonteiro.home_app.controller.recipes;

import com.jorgemonteiro.home_app.exception.ObjectNotFoundException;
import com.jorgemonteiro.home_app.model.adapter.recipes.RecipeAdapter;
import com.jorgemonteiro.home_app.model.dtos.recipes.RecipeCommentDTO;
import com.jorgemonteiro.home_app.model.dtos.recipes.RecipeRatingDTO;
import com.jorgemonteiro.home_app.model.entities.profiles.User;
import com.jorgemonteiro.home_app.model.entities.recipes.Recipe;
import com.jorgemonteiro.home_app.model.entities.recipes.RecipeComment;
import com.jorgemonteiro.home_app.model.entities.recipes.RecipeRating;
import com.jorgemonteiro.home_app.repository.profiles.UserRepository;
import com.jorgemonteiro.home_app.repository.recipes.RecipeCommentRepository;
import com.jorgemonteiro.home_app.repository.recipes.RecipeRatingRepository;
import com.jorgemonteiro.home_app.repository.recipes.RecipeRepository;
import lombok.RequiredArgsConstructor;
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

    private final RecipeRepository recipeRepository;
    private final RecipeCommentRepository commentRepository;
    private final RecipeRatingRepository ratingRepository;
    private final UserRepository userRepository;

    @GetMapping("/comments")
    public List<RecipeCommentDTO> getComments(@PathVariable Long recipeId) {
        return commentRepository.findAllByRecipeIdOrderByCreatedAtDesc(recipeId).stream()
                .map(RecipeAdapter::toCommentDTO)
                .collect(Collectors.toList());
    }

    @PostMapping("/comments")
    public RecipeCommentDTO addComment(@PathVariable Long recipeId, @RequestBody RecipeCommentDTO dto, @AuthenticationPrincipal OAuth2User principal) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ObjectNotFoundException("Recipe with id " + recipeId + " not found"));
        User user = getUser(principal);

        RecipeComment comment = new RecipeComment();
        comment.setRecipe(recipe);
        comment.setUser(user);
        comment.setComment(dto.getComment());

        return RecipeAdapter.toCommentDTO(commentRepository.save(comment));
    }

    @GetMapping("/rating")
    public RecipeRatingDTO getUserRating(@PathVariable Long recipeId, @AuthenticationPrincipal OAuth2User principal) {
        User user = getUser(principal);
        return ratingRepository.findByRecipeIdAndUserId(recipeId, user.getId())
                .map(RecipeAdapter::toRatingDTO)
                .orElse(new RecipeRatingDTO());
    }

    @PostMapping("/rating")
    public RecipeRatingDTO rateRecipe(@PathVariable Long recipeId, @RequestBody RecipeRatingDTO dto, @AuthenticationPrincipal OAuth2User principal) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ObjectNotFoundException("Recipe with id " + recipeId + " not found"));
        User user = getUser(principal);

        RecipeRating rating = ratingRepository.findByRecipeIdAndUserId(recipeId, user.getId())
                .orElse(new RecipeRating());
        
        rating.setRecipe(recipe);
        rating.setUser(user);
        rating.setRating(dto.getRating());

        return RecipeAdapter.toRatingDTO(ratingRepository.save(rating));
    }

    private User getUser(OAuth2User principal) {
        String email = principal.getAttribute("email");
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ObjectNotFoundException("User with email " + email + " not found"));
    }
}
