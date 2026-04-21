package com.jorgemonteiro.home_app.service.meals;

import com.jorgemonteiro.home_app.exception.ObjectNotFoundException;
import com.jorgemonteiro.home_app.model.adapter.meals.MealAdapter;
import com.jorgemonteiro.home_app.model.dtos.meals.MealTimeDTO;
import com.jorgemonteiro.home_app.model.entities.meals.MealTime;
import com.jorgemonteiro.home_app.model.entities.meals.MealTimeSchedule;
import com.jorgemonteiro.home_app.repository.meals.MealTimeRepository;
import com.jorgemonteiro.home_app.repository.meals.MealTimeScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing meal times and their schedules.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class MealTimeService {

    private final MealTimeRepository mealTimeRepository;
    private final MealTimeScheduleRepository mealTimeScheduleRepository;
    private final MealAdapter mealAdapter;

    @Transactional(readOnly = true)
    public List<MealTimeDTO> findAll() {
        return mealTimeRepository.findAllByOrderBySortOrderAsc().stream()
                .map(mealAdapter::toMealTimeDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MealTimeDTO findById(Long id) {
        return mealTimeRepository.findById(id)
                .map(mealAdapter::toMealTimeDTO)
                .orElseThrow(() -> new ObjectNotFoundException("MealTime with id " + id + " not found"));
    }

    public MealTimeDTO create(MealTimeDTO dto) {
        MealTime entity = mealAdapter.toMealTimeEntity(dto);
        syncSchedules(entity, dto);
        return mealAdapter.toMealTimeDTO(mealTimeRepository.save(entity));
    }

    public MealTimeDTO update(Long id, MealTimeDTO dto) {
        MealTime entity = mealTimeRepository.findById(id)
                .orElseThrow(() -> new ObjectNotFoundException("MealTime with id " + id + " not found"));

        entity.setName(dto.getName());
        entity.setSortOrder(dto.getSortOrder());
        syncSchedules(entity, dto);

        return mealAdapter.toMealTimeDTO(mealTimeRepository.save(entity));
    }

    public void delete(Long id) {
        if (!mealTimeRepository.existsById(id)) {
            throw new ObjectNotFoundException("MealTime with id " + id + " not found");
        }
        mealTimeRepository.deleteById(id);
    }

    private void syncSchedules(MealTime entity, MealTimeDTO dto) {
        if (dto.getSchedules() != null) {
            entity.getSchedules().clear();
            entity.getSchedules().addAll(dto.getSchedules().stream()
                    .map(sDto -> {
                        MealTimeSchedule s = mealAdapter.toScheduleEntity(sDto);
                        s.setMealTime(entity);
                        return s;
                    })
                    .collect(Collectors.toList()));
        }
    }
}
