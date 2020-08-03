package com.mycompany.restaurantservice.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RestaurantDishDeletedEvent {

    private String restaurantId;
    private String dishId;

}
