package com.jorgemonteiro.home_app.service.meals;

import com.jorgemonteiro.home_app.exception.ObjectNotFoundException;
import com.jorgemonteiro.home_app.model.adapter.meals.MealAdapter;
import com.jorgemonteiro.home_app.model.dtos.meals.MealTimeDTO;
import com.jorgemonteiro.home_app.model.entities.meals.MealTime;
import com.jorgemonteiro.home_app.model.entities.meals.MealTimeSchedule;
import com.jorgemonteiro.home_app.repository.meals.MealTimeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for managing meal times and their schedules.
 */
@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class MealTimeService {

    private final MealTimeRepository mealTimeRepository;

    @Transactional(readOnly = true)
    public List<MealTimeDTO> listAll() {
        return mealTimeRepository.findAllByOrderBySortOrderAsc().stream()
                .map(MealAdapter::toMealTimeDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MealTimeDTO getById(Long id) {
        return mealTimeRepository.findById(id)
                .map(MealAdapter::toMealTimeDTO)
                .orElseThrow(() -> new ObjectNotFoundException("MealTime with id " + id + " not found"));
    }

    public MealTimeDTO create(MealTimeDTO dto) {
        MealTime entity = MealAdapter.toMealTimeEntity(dto);
        syncSchedules(entity, dto);
        return MealAdapter.toMealTimeDTO(mealTimeRepository.save(entity));
    }

    public MealTimeDTO update(Long id, MealTimeDTO dto) {
        MealTime entity = mealTimeRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("MealTime with id " + id + " not found"));
        
        entity.setName(dto.getName());
        entity.setSortOrder(dto.getSortOrder());
        syncSchedules(entity, dto);

        return MealAdapter.toMealTimeDTO(mealTimeRepository.save(entity));
    }

    public void delete(Long id) {
        if (!mealTimeRepository.existsById(id)) {
            throw new ObjectNotFoundException("MealTime with id " + id + " not found");
        }
        mealTimeRepository.deleteById(id);
    }

    private void syncSchedules(MealTime entity, MealTimeDTO dto) {
        if (dto.getSchedules() != null) {
            // Use surgical updates to avoid OptimisticLockingFailureException
            Map<Integer, MealTimeSchedule> existingMap = entity.getSchedules().stream()
                    .collect(Collectors.toMap(MealTimeSchedule::getDayOfWeek, s -> s));

            List<MealTimeSchedule> updatedSchedules = dto.getSchedules().stream()
                    .map(sDto -> {
                        MealTimeSchedule s = existingMap.get(sDto.getDayOfWeek());
                        if (s == null) {
                            s = new MealTimeSchedule();
                            s.setMealTime(entity);
                            s.setDayOfWeek(sDto.getDayOfWeek());
                        }
                        s.setStartTime(sDto.getStartTime());
                        return s;
                    })
                    .collect(Collectors.toList());

            // Clear and add back the same managed instances (or new ones)
            entity.getSchedules().clear();
            entity.getSchedules().addAll(updatedSchedules);
        }
    }
}
