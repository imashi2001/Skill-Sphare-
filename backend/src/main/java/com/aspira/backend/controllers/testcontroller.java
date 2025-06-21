package com.aspira.backend.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class testcontroller {
   // Mapping for the root URL ("/")
   @GetMapping("/")
   public String home() {
       return "Backend is up and running!";
   }

   // Example of another endpoint
   @GetMapping("/api/hello")
   public String hello() {
       return "Hello from the backend!";
   }
}
