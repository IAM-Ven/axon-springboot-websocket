package com.mycompany.customerservice.model;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import java.util.LinkedList;
import java.util.List;

@Data
@ToString(exclude = "orders")
@EqualsAndHashCode(exclude = "orders")
@Entity
@Table(name = "customers")
public class Customer {

    @Id
    private String id;
    private String name;
    private String address;

    //@OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    @OneToMany(fetch = FetchType.EAGER, mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Order> orders = new LinkedList<>();

}
