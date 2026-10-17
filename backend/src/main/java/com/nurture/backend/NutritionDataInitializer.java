package com.nurture.backend;

import com.nurture.backend.entity.NutritionFood;
import com.nurture.backend.repository.NutritionFoodRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class NutritionDataInitializer {
    @Bean
    CommandLineRunner seedNutritionFoods(NutritionFoodRepository repository) {
        return args -> {
            // Approximate values per 100 g; edit these values if you adopt a verified nutrition dataset.
            addIfMissing(repository, new NutritionFood("Apple", 52, 0.3, 13.8, 0.2, 2.4, 0.12, 6));
            addIfMissing(repository, new NutritionFood("Banana", 89, 1.1, 22.8, 0.3, 2.6, 0.26, 5));
            addIfMissing(repository, new NutritionFood("Boiled egg", 155, 12.6, 1.1, 10.6, 0, 1.2, 50));
            addIfMissing(repository, new NutritionFood("Brown rice, cooked", 123, 2.7, 25.6, 1.0, 1.6, 0.56, 10));
            addIfMissing(repository, new NutritionFood("Carrot", 41, 0.9, 9.6, 0.2, 2.8, 0.3, 33));
            addIfMissing(repository, new NutritionFood("Chapati", 297, 9.0, 46.0, 7.5, 7.0, 2.5, 25));
            addIfMissing(repository, new NutritionFood("Chicken breast, cooked", 165, 31.0, 0, 3.6, 0, 1.0, 15));
            addIfMissing(repository, new NutritionFood("Curd, plain", 61, 3.5, 4.7, 3.3, 0, 0.05, 121));
            addIfMissing(repository, new NutritionFood("Dal, cooked", 116, 9.0, 20.1, 0.4, 7.9, 3.3, 19));
            addIfMissing(repository, new NutritionFood("Milk, whole", 61, 3.2, 4.8, 3.3, 0, 0.03, 113));
            addIfMissing(repository, new NutritionFood("Oats, dry", 389, 16.9, 66.3, 6.9, 10.6, 4.7, 54));
            addIfMissing(repository, new NutritionFood("Orange", 47, 0.9, 11.8, 0.1, 2.4, 0.1, 40));
            addIfMissing(repository, new NutritionFood("Paneer", 265, 18.3, 1.2, 20.8, 0, 0.2, 208));
            addIfMissing(repository, new NutritionFood("Peanuts", 567, 25.8, 16.1, 49.2, 8.5, 4.6, 92));
            addIfMissing(repository, new NutritionFood("Rice, cooked", 130, 2.7, 28.2, 0.3, 0.4, 0.2, 10));
            addIfMissing(repository, new NutritionFood("Spinach, cooked", 23, 3.0, 3.8, 0.3, 2.4, 3.6, 136));
            addIfMissing(repository, new NutritionFood("Sweet potato, boiled", 76, 1.4, 17.7, 0.1, 2.5, 0.7, 27));
            addIfMissing(repository, new NutritionFood("Tomato", 18, 0.9, 3.9, 0.2, 1.2, 0.27, 10));
            addIfMissing(repository, new NutritionFood("Whole wheat bread", 247, 13.0, 41.0, 4.2, 7.0, 3.6, 107));
            addIfMissing(repository, new NutritionFood("Yogurt, plain", 59, 10.0, 3.6, 0.4, 0, 0.1, 110));
        };
    }

    private void addIfMissing(NutritionFoodRepository repository, NutritionFood food) {
        if (repository.findByFoodNameIgnoreCase(food.getFoodName()).isEmpty()) {
            repository.save(food);
        }
    }
}
