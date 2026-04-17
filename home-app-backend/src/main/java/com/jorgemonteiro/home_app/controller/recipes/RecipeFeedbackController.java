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

    private final RecipeRepository recipeRepository;
    private final RecipeCommentRepository commentRepository;
    private final RecipeRatingRepository ratingRepository;
    private final UserRepository userRepository;
    private final RecipeAdapter recipeAdapter;

    @GetMapping("/comments")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<RecipeCommentDTO> getComments(@PathVariable Long recipeId) {
        return commentRepository.findAllByRecipeIdOrderByCreatedAtDesc(recipeId).stream()
                .map(recipeAdapter::toCommentDTO)
                .collect(Collectors.toList());
    }

    @PostMapping("/comments")
    @org.springframework.transaction.annotation.Transactional
    public RecipeCommentDTO addComment(@PathVariable Long recipeId, @RequestBody RecipeCommentDTO dto, @AuthenticationPrincipal OAuth2User principal) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ObjectNotFoundException("Recipe with id " + recipeId + " not found"));
        User user = getUser(principal);

        RecipeComment comment = new RecipeComment();
        comment.setRecipe(recipe);
        comment.setUser(user);
        comment.setComment(dto.getComment());

        return recipeAdapter.toCommentDTO(commentRepository.save(comment));
    }

    @DeleteMapping("/comments/{commentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteComment(@PathVariable Long recipeId, @PathVariable Long commentId, @AuthenticationPrincipal OAuth2User principal) {
        User user = getUser(principal);
        RecipeComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ObjectNotFoundException("Comment with id " + commentId + " not found"));

        if (!comment.getUser().getId().equals(user.getId())) {
            throw new com.jorgemonteiro.home_app.exception.AuthenticationException("You can only delete your own comments");
        }

        commentRepository.delete(comment);
    }

    @GetMapping("/rating")
    public RecipeRatingDTO getUserRating(@PathVariable Long recipeId, @AuthenticationPrincipal OAuth2User principal) {
        User user = getUser(principal);
        return ratingRepository.findByRecipeIdAndUserId(recipeId, user.getId())
                .map(recipeAdapter::toRatingDTO)
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

        return recipeAdapter.toRatingDTO(ratingRepository.save(rating));
    }

    private User getUser(OAuth2User principal) {
        String email = principal.getAttribute("email");
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ObjectNotFoundException("User with email " + email + " not found"));
    }
}
