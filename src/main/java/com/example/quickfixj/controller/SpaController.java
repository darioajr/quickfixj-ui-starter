package com.example.quickfixj.controller;

import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@Order(2) // Menor prioridade que resource handlers
public class SpaController {

    @GetMapping({"/ui", "/ui/"})
    public String ui() {
        return "forward:/ui/index.html";
    }
}