package com.Proyecto.backEnd.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/fotos/**")
        .addResourceLocations(
                "file:src/uploads/fotos/",
                // Fallback to classpath static assets (e.g., placeholder images)
                "classpath:/static/");

registry.addResourceHandler("/**")
        .addResourceLocations(
                "classpath:/static/",
                "classpath:/public/",
                "classpath:/resources/",
                "classpath:/META-INF/resources/");
    }
}

