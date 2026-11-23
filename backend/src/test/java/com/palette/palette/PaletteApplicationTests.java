package com.palette.palette;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Boots the whole application against the Flyway schema.
 * Because ddl-auto=validate, this fails if any JPA entity no longer matches
 * the tables created by the migrations.
 */
@SpringBootTest
class PaletteApplicationTests {

    @Test
    void contextLoadsAndEntitiesMatchSchema() {
    }
}
