package com.gct.banking_system.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.web.cors.CorsConfigurationSource;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthConverter jwtAuthConverter;
    private final CorsConfigurationSource corsConfigurationSource;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/health", "/health/**", "/info", "/error").permitAll()

                // Account Management
                .requestMatchers(HttpMethod.POST, "/api/accounts").hasAnyRole("ADMIN", "admin", "MAKER", "maker")
                .requestMatchers(HttpMethod.PUT, "/api/accounts/**").hasAnyRole("ADMIN", "admin")
                .requestMatchers(HttpMethod.DELETE, "/api/accounts/**").hasAnyRole("ADMIN", "admin")
                .requestMatchers(HttpMethod.GET, "/api/accounts/**").authenticated()

                // Customer Management
                .requestMatchers(HttpMethod.POST, "/api/customers").hasAnyRole("ADMIN", "admin", "MAKER", "maker")
                .requestMatchers(HttpMethod.PUT, "/api/customers/**").hasAnyRole("ADMIN", "admin", "MAKER", "maker")
                .requestMatchers(HttpMethod.DELETE, "/api/customers/**").hasAnyRole("ADMIN", "admin")
                .requestMatchers(HttpMethod.GET, "/api/customers/**").authenticated()

                // Transaction Processing: POST requires 'admin' or 'maker'
                .requestMatchers(HttpMethod.POST, "/api/accounts/*/transactions").hasAnyRole("ADMIN", "admin", "MAKER", "maker")
                .requestMatchers(HttpMethod.POST, "/api/transactions/**").hasAnyRole("ADMIN", "admin", "MAKER", "maker")
                .requestMatchers(HttpMethod.GET, "/api/accounts/*/transactions").authenticated()

                // Beneficiary Management
                .requestMatchers(HttpMethod.POST, "/api/beneficiaries").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/beneficiaries/**").hasAnyRole("ADMIN", "admin", "MAKER", "maker")
                .requestMatchers(HttpMethod.DELETE, "/api/beneficiaries/**").hasAnyRole("ADMIN", "admin", "CHECKER", "checker")
                .requestMatchers(HttpMethod.GET, "/api/beneficiaries/**").authenticated()

                // All other API endpoints
                .requestMatchers("/api/**").authenticated()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthConverter))
                .authenticationEntryPoint(customAuthenticationEntryPoint())
                .accessDeniedHandler(customAccessDeniedHandler())
            )
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(customAuthenticationEntryPoint())
                .accessDeniedHandler(customAccessDeniedHandler())
            );

        return http.build();
    }

    @Bean
    public AuthenticationEntryPoint customAuthenticationEntryPoint() {
        return (request, response, authException) -> {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);

            Map<String, Object> body = new LinkedHashMap<>();
            body.put("timestamp", LocalDateTime.now().toString());
            body.put("status", HttpServletResponse.SC_UNAUTHORIZED);
            body.put("error", "Unauthorized");
            body.put("message", "Authentication required. Please provide a valid Bearer token from Keycloak.");
            body.put("path", request.getRequestURI());

            objectMapper.writeValue(response.getOutputStream(), body);
        };
    }

    @Bean
    public AccessDeniedHandler customAccessDeniedHandler() {
        return (request, response, accessDeniedException) -> {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);

            Map<String, Object> body = new LinkedHashMap<>();
            body.put("timestamp", LocalDateTime.now().toString());
            body.put("status", HttpServletResponse.SC_FORBIDDEN);
            body.put("error", "Forbidden");
            body.put("message", "Access Denied. You do not have the required role to perform this action.");
            body.put("path", request.getRequestURI());

            objectMapper.writeValue(response.getOutputStream(), body);
        };
    }
}
