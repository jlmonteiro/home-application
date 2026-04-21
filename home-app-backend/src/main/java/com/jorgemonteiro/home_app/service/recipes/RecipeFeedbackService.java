package com.jorgemonteiro.home_app.service.recipes;

import com.jorgemonteiro.home_app.exception.AuthenticationException;
import com.jorgemonteiro.home_app.exception.ObjectNotFoundException;
import com.jorgemonteiro.home_app.model.entities.profiles.User;
import com.jorgemonteiro.home_app.model.entities.recipes.Recipe;
import com.jorgemonteiro.home_app.model.entities.recipes.RecipeComment;
import com.jorgemonteiro.home_app.model.entities.recipes.RecipeRating;
import com.jorgemonteiro.home_app.repository.profiles.UserRepository;
import com.jorgemonteiro.home_app.repository.recipes.RecipeCommentRepository;
import com.jorgemonteiro.home_app.repository.recipes.RecipeRatingRepository;
import com.jorgemonteiro.home_app.repository.recipes.RecipeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.util.List;

/**
 * Service for managing recipe feedback (comments and ratings).
 */
@Service
@RequiredArgsConstructor
@Transactional
@Validated
@Slf4j
public class RecipeFeedbackService {

    private final RecipeRepository recipeRepository;
    private final RecipeCommentRepository commentRepository;
    private final RecipeRatingRepository ratingRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<RecipeComment> getComments(Long recipeId) {
        return commentRepository.findAllByRecipeIdOrderByCreatedAtDesc(recipeId);
    }

    public RecipeComment addComment(Long recipeId, String content, OAuth2User principal) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ObjectNotFoundException("Recipe with id " + recipeId + " not found"));
        User user = getUser(principal);

        RecipeComment comment = new RecipeComment();
        comment.setRecipe(recipe);
        comment.setUser(user);
        comment.setComment(content);

        return commentRepository.save(comment);
    }

    public void deleteComment(Long commentId, OAuth2User principal) {
        User user = getUser(principal);
        RecipeComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ObjectNotFoundException("Comment with id " + commentId + " not found"));

        if (!comment.getUser().getId().equals(user.getId())) {
            throw new AuthenticationException("You can only delete your own comments");
        }

        commentRepository.delete(comment);
    }

    @Transactional(readOnly = true)
    public RecipeRating getUserRating(Long recipeId, OAuth2User principal) {
        User user = getUser(principal);
        return ratingRepository.findByRecipeIdAndUserId(recipeId, user.getId())
                .orElse(new RecipeRating());
    }

    public RecipeRating rateRecipe(Long recipeId, Integer ratingValue, OAuth2User principal) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ObjectNotFoundException("Recipe with id " + recipeId + " not found"));

        User user = getUser(principal);

        RecipeRating rating = ratingRepository.findByRecipeIdAndUserId(recipeId, user.getId())
                .orElse(new RecipeRating());
        
        rating.setRecipe(recipe);
        rating.setUser(user);
        rating.setRating(ratingValue);

        return ratingRepository.save(rating);
    }

    private User getUser(OAuth2User principal) {
        String email = principal.getAttribute("email");
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ObjectNotFoundException("User with email " + email + " not found"));
    }
}
