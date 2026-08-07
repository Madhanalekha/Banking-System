package com.gct.banking_system.service;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DatabaseStatusService {

    private final JdbcTemplate jdbcTemplate;

    public String getDatabaseStatus() {

        try {

            Integer result = jdbcTemplate.queryForObject(
                    "SELECT 1",
                    Integer.class);

            if (result != null && result == 1) {
                return "UP";
            }

        } catch (Exception e) {

            return "DOWN";
        }

        return "DOWN";
    }

}