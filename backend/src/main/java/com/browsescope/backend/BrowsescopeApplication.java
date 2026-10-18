package com.browsescope.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * BrowseScope backend entry point.
 * Everything here runs locally — no browsing data ever leaves this machine.
 */
@SpringBootApplication
public class BrowsescopeApplication {
    public static void main(String[] args) {
        SpringApplication.run(BrowsescopeApplication.class, args);
    }
}
