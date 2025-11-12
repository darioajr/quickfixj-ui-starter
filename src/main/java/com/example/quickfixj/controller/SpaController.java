package com.example.quickfixj.controller;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@Order(Integer.MAX_VALUE) // Menor prioridade que tudo
@ConditionalOnProperty(name = "quickfixj-ui.internal.enabled", havingValue = "true")
public class SpaController {

    @GetMapping(value = "/{path:^(?!api|ws).*}")
    public String spa() {
        return "forward:/index.html";
    }
}