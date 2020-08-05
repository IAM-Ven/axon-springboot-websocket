package com.mycompany.restaurantservice.repository;

import com.mycompany.axoneventcommons.restaurant.RestaurantAddedEvent;
import com.mycompany.axoneventcommons.restaurant.RestaurantDeletedEvent;
import com.mycompany.axoneventcommons.restaurant.RestaurantDishAddedEvent;
import com.mycompany.axoneventcommons.restaurant.RestaurantDishDeletedEvent;
import com.mycompany.axoneventcommons.restaurant.RestaurantDishUpdatedEvent;
import com.mycompany.axoneventcommons.restaurant.RestaurantUpdatedEvent;
import com.mycompany.restaurantservice.exception.RestaurantNotFoundException;
import com.mycompany.restaurantservice.model.Dish;
import com.mycompany.restaurantservice.model.Restaurant;
import com.mycompany.restaurantservice.query.GetRestaurantQuery;
import com.mycompany.restaurantservice.query.GetRestaurantsQuery;
import lombok.RequiredArgsConstructor;
import org.axonframework.eventhandling.EventHandler;
import org.axonframework.queryhandling.QueryHandler;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@RequiredArgsConstructor
@Service
public class RestaurantRepositoryProjector {

    private final RestaurantRepository restaurantRepository;

    @QueryHandler
    public List<Restaurant> handle(GetRestaurantsQuery query) {
        return restaurantRepository.findAll();
    }

    @QueryHandler
    public Restaurant handle(GetRestaurantQuery query) {
        return restaurantRepository.findById(query.getId())
                .orElseThrow(() -> new RestaurantNotFoundException(query.getId()));
    }

    @EventHandler
    public void handle(RestaurantAddedEvent event) {
        Restaurant restaurant = new Restaurant();
        restaurant.setId(event.getId());
        restaurant.setName(event.getName());
        restaurant.setDishes(Collections.emptyList());
        restaurantRepository.save(restaurant);
    }

    @EventHandler
    public void handle(RestaurantUpdatedEvent event) {
        restaurantRepository.findById(event.getId())
                .ifPresent(r -> {
                    r.setName(event.getName());
                    restaurantRepository.save(r);
                });
    }

    @EventHandler
    public void handle(RestaurantDeletedEvent event) {
        restaurantRepository.findById(event.getId()).ifPresent(restaurantRepository::delete);
    }

    @EventHandler
    public void handle(RestaurantDishAddedEvent event) {
        restaurantRepository.findById(event.getRestaurantId())
                .ifPresent(r -> {
                    Dish dish = new Dish(event.getDishId(), event.getDishName(), event.getDishPrice());
                    r.getDishes().add(dish);
                    restaurantRepository.save(r);
                });
    }

    @EventHandler
    public void handle(RestaurantDishUpdatedEvent event) {
        restaurantRepository.findById(event.getRestaurantId())
                .ifPresent(r -> r.getDishes().stream().filter(d -> d.getId().equals(event.getDishId())).findAny()
                        .ifPresent(d -> {
                            d.setName(event.getDishName());
                            d.setPrice(event.getDishPrice());
                            restaurantRepository.save(r);
                        }));
    }

    @EventHandler
    public void handle(RestaurantDishDeletedEvent event) {
        restaurantRepository.findById(event.getRestaurantId())
                .ifPresent(r -> {
                    r.getDishes().removeIf(d -> d.getId().equals(event.getDishId()));
                    restaurantRepository.save(r);
                });
    }

}
