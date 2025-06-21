package com.aspira.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class DatabaseService {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public boolean checkConnection() {
        try {
            String sql = "SELECT 1"; // Simple query to test the connection
            jdbcTemplate.queryForObject(sql, Integer.class);
            return true; // Connection successful
        } catch (Exception e) {
            e.printStackTrace();
            return false; // Connection failed
        }
    }
}
