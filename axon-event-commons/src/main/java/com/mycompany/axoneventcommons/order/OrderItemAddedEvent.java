package com.mycompany.axoneventcommons.order;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderItemAddedEvent implements OrderEvent {

    private String orderId;
    private String itemId;
    private String dishId;
    private String dishName;
    private BigDecimal dishPrice;
    private Short quantity;

}
