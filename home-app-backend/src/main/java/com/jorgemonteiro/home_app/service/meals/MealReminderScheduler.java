package com.jorgemonteiro.home_app.service.meals;

import com.jorgemonteiro.home_app.model.entities.meals.*;
import com.jorgemonteiro.home_app.repository.meals.MealPlanRepository;
import com.jorgemonteiro.home_app.service.notifications.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Scheduler that sends reminders for upcoming meal assignments.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MealReminderScheduler {

    private final MealPlanRepository mealPlanRepository;
    private final NotificationService notificationService;

    /**
     * Runs every 15 minutes to check for upcoming meals.
     * Reminds users 30 minutes before the meal start time.
     */
    @Scheduled(cron = "0 0/15 * * * *")
    @Transactional(readOnly = true)
    public void sendMealReminders() {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();
        DayOfWeek dayOfWeek = today.getDayOfWeek();

        mealPlanRepository.findByWeekStartDate(today.with(DayOfWeek.MONDAY)).ifPresent(plan -> {
            if (plan.getStatus() == MealPlanStatus.PENDING) return;

            for (MealPlanEntry entry : plan.getEntries()) {
                if (entry.getDayOfWeek() != dayOfWeek || entry.getIsDone()) continue;

                // Find schedule for today
                entry.getMealTime().getSchedules().stream()
                        .filter(s -> s.getDayOfWeek() == dayOfWeek)
                        .findFirst()
                        .ifPresent(schedule -> {
                            long minutesUntil = ChronoUnit.MINUTES.between(now, schedule.getStartTime());
                            
                            // Remind if exactly 30 mins away (or between 15-30 if we just started)
                            if (minutesUntil > 0 && minutesUntil <= 30) {
                                log.info("Sending reminders for meal: {}", entry.getMealTime().getName());
                                notifyAssignees(entry, schedule);
                            }
                        });
            }
        });
    }

    private void notifyAssignees(MealPlanEntry entry, MealTimeSchedule schedule) {
        for (MealPlanEntryRecipe recipeAssignment : entry.getRecipes()) {
            if (recipeAssignment.getUser() != null) {
                notificationService.createNotification(
                        recipeAssignment.getUser(),
                        null,
                        "MEAL_REMINDER",
                        "Meal Reminder: " + entry.getMealTime().getName(),
                        "You are assigned to prepare '" + recipeAssignment.getRecipe().getName() + "' at " + schedule.getStartTime(),
                        "/recipes/" + recipeAssignment.getRecipe().getId()
                );
            }
        }
    }
}
