package com.gct.banking_system.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;
@RestController
public class InfoController {
    @GetMapping("/api/info")
    public Map<String,String> info(){
        return Map.of(
                "project","mini banking System",
                "version","1.0",
                "Status","Running"
        );
    }

}
