package com.example.quickfixj;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "quickfixj-ui.enabled=false")
class QuickFixJApiApplicationTests {

    @Test
    void contextLoads() {
        // Test that the Spring context loads successfully
    }
}