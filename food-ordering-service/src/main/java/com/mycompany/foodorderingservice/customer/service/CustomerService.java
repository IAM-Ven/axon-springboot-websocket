package com.mycompany.foodorderingservice.customer.service;

import com.mycompany.foodorderingservice.customer.model.Customer;

public interface CustomerService {

    Customer validateAndGetCustomer(String id);

    Customer saveCustomer(Customer customer);

    void deleteCustomer(Customer customer);

}
