package com.devduong.be.configs;

import liquibase.integration.spring.SpringLiquibase;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.hibernate.autoconfigure.HibernatePropertiesCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.DependsOn;

import javax.sql.DataSource;

/*
 * @description: Configuration to ensure Liquibase runs before Hibernate validation.
 */
@Configuration
public class DatabaseConfig {

    /**
     * Tự định nghĩa bean Liquibase và liên kết với prefix 'spring.liquibase' trong application.yml
     */
    @Bean
    @ConfigurationProperties(prefix = "spring.liquibase")
    public SpringLiquibase liquibase(DataSource dataSource) {
        SpringLiquibase liquibase = new SpringLiquibase();
        liquibase.setDataSource(dataSource);
        return liquibase;
    }

    /**
     * Ép buộc Hibernate (EntityManagerFactory) phải phụ thuộc vào bean liquibase vừa tạo ở trên
     */
    @Bean
    @DependsOn("liquibase")
    public HibernatePropertiesCustomizer hibernatePropertiesCustomizer() {
        return hibernateProperties -> {
            // Đảm bảo thứ tự khởi tạo
        };
    }
}
