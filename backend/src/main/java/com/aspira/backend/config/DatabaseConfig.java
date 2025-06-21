package com.aspira.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import javax.sql.DataSource;
//import org.springframework.beans.factory.annotation.Autowired;

@Configuration
public class DatabaseConfig {
   // @Autowired
   // public DataSource dataSource;  

    @Bean

     public DataSource dataSource() {
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName("org.postgresql.Driver");
        dataSource.setUrl(System.getProperty("DB_URL"));
        dataSource.setUsername(System.getProperty("DB_USERNAME"));
        dataSource.setPassword(System.getProperty("DB_PASSWORD"));
        return dataSource;
    }


    public JdbcTemplate jdbcTemplate(DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }
    
}
