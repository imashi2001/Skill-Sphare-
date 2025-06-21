package com.aspira.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aspira.backend.service.DatabaseService;

@RestController
public class DatabaseController {

    @Autowired
    private DatabaseService databaseService;

    @GetMapping("/test-database-connection")
    public String testConnection() {
        boolean isConnected = databaseService.checkConnection();
        if (isConnected) {
            return "Database connection is successful!";
        } else {
            return "Database connection failed!";
        }
    }
    
}
