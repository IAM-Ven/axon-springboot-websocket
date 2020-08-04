package com.mycompany.foodorderingservice.customer.repository;

import com.mycompany.axoneventcommons.customer.CustomerAddedEvent;
import com.mycompany.axoneventcommons.customer.CustomerDeletedEvent;
import com.mycompany.axoneventcommons.customer.CustomerUpdatedEvent;
import com.mycompany.foodorderingservice.customer.model.Customer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.axonframework.config.ProcessingGroup;
import org.axonframework.eventhandling.EventHandler;
import org.springframework.stereotype.Service;

@Slf4j
@RequiredArgsConstructor
@ProcessingGroup("kafka-axon-event-processor")
@Service
public class CustomerRepositoryProjector {

    private final CustomerRepository customerRepository;

    @EventHandler
    public void on(CustomerAddedEvent event) {
        log.info("Received: {}", event);
        Customer customer = new Customer();
        customer.setId(event.getId());
        customer.setName(event.getName());
        customer.setAddress(event.getAddress());
        customerRepository.save(customer);
    }

    @EventHandler
    public void on(CustomerUpdatedEvent event) {
        log.info("Received: {}", event);
        customerRepository.findById(event.getId())
                .ifPresent(c -> {
                    c.setName(event.getName() == null ? c.getName() : event.getName());
                    c.setAddress(event.getAddress() == null ? c.getAddress() : event.getAddress());
                    customerRepository.save(c);
                });
    }

    @EventHandler
    public void on(CustomerDeletedEvent event) {
        log.info("Received: {}", event);
        customerRepository.findById(event.getId()).ifPresent(customerRepository::delete);
    }

}