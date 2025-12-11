package com.Proyecto.backEnd;

import org.springframework.boot.SpringApplication;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
@SpringBootApplication
@ComponentScan(
        basePackages = "com.Proyecto.backEnd",
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.REGEX,
                pattern = "com\\.Proyecto\\.backEnd\\.(service|controller|repository|model)\\.(Dmodalidad.*|Modalidades.*)"
        )
)
public class BackEndApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackEndApplication.class, args);
	}

}
