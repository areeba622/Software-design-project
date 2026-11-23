package com.palette.palette.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.palette.palette.dto.RegisterRequestDTO;
import com.palette.palette.patterns.singleton.PaymentManager;
import com.palette.palette.services.TestUsers;

/** HTTP-level checks: who can call what, and that the user always comes from the token. */
@SpringBootTest
@AutoConfigureMockMvc
class ApiSecurityTest {

    @Autowired private MockMvc mvc;
    @Autowired private ObjectMapper json;
    @Autowired private ApplicationContext context;

    // ── public vs protected ──────────────────────────────────────────────────

    @Test
    void catalogueIsPublic() throws Exception {
        mvc.perform(get("/api/products/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Minimalist Platform Bed"))
                .andExpect(jsonPath("$.bundle").doesNotExist());
        mvc.perform(get("/api/designers")).andExpect(status().isOk());
    }

    @Test
    void quizWorksForGuests() throws Exception {
        mvc.perform(post("/api/design-quiz/submit").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"style\":\"BOHEMIAN\",\"roomType\":\"BEDROOM\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.aestheticStyle").value("BOHEMIAN"));
    }

    @Test
    void userDataNeedsALogin() throws Exception {
        for (String url : new String[] { "/api/cart", "/api/order", "/api/design-quiz/latest", "/api/room-builder" }) {
            mvc.perform(get(url))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.message").exists());
        }
        mvc.perform(post("/api/order/create")).andExpect(status().isUnauthorized());
    }

    @Test
    void aForgedTokenIsRejected() throws Exception {
        mvc.perform(get("/api/cart").header("Authorization", "Bearer not.a.real.token"))
                .andExpect(status().isUnauthorized());
    }

    // ── login ────────────────────────────────────────────────────────────────

    @Test
    void registerReturnsATokenThatOpensTheUsersCart() throws Exception {
        JsonNode user = register();

        assertThat(user.get("token").asText()).isNotBlank();
        mvc.perform(get("/api/design-quiz/latest").header("Authorization", bearer(user)))
                .andExpect(status().isNoContent()); // hasn't taken the quiz yet
        mvc.perform(get("/api/cart").header("Authorization", bearer(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(user.get("userId").asLong()));
    }

    @Test
    void loginWorksWithAnyEmailCasing() throws Exception {
        RegisterRequestDTO registration = TestUsers.newRegistration();
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(registration))).andExpect(status().isCreated());

        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody(registration.getEmail().toUpperCase(), TestUsers.PASSWORD)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    void wrongPasswordAndUnknownEmailGiveTheSameAnswer() throws Exception {
        JsonNode user = register();

        String wrongPassword = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody(user.get("email").asText(), "nope-nope")))
                .andExpect(status().isUnauthorized())
                .andReturn().getResponse().getContentAsString();
        String unknownEmail = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody("nobody@example.com", "nope-nope")))
                .andExpect(status().isUnauthorized())
                .andReturn().getResponse().getContentAsString();

        assertThat(json.readTree(wrongPassword).get("message"))
                .isEqualTo(json.readTree(unknownEmail).get("message"));
    }

    // ── the user comes from the token, not the request ───────────────────────

    @Test
    void aUserIdInTheUrlIsIgnored() throws Exception {
        JsonNode alice = register();
        JsonNode bob = register();

        mvc.perform(get("/api/cart").param("userId", bob.get("userId").asText()).header("Authorization", bearer(alice)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(alice.get("userId").asLong()));
    }

    @Test
    void paymentChargesTheOrderTotalEvenIfTheClientSendsAnotherAmount() throws Exception {
        JsonNode user = register();
        mvc.perform(post("/api/cart/add").header("Authorization", bearer(user)).contentType(MediaType.APPLICATION_JSON)
                .content("{\"itemId\":1,\"quantity\":1,\"itemType\":\"PRODUCT\",\"unitPrice\":1}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.grandTotal").value(45_000.0));
        String order = mvc.perform(post("/api/order/create").header("Authorization", bearer(user)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long orderId = json.readTree(order).get("orderId").asLong();

        mvc.perform(post("/api/payment/process").header("Authorization", bearer(user)).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"orderId\":" + orderId + ",\"gatewayType\":\"JAZZCASH\",\"amountInPKR\":1}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.amountInPKR").value(45_000.0));

        mvc.perform(post("/api/payment/process").header("Authorization", bearer(user)).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"orderId\":" + orderId + ",\"gatewayType\":\"JAZZCASH\"}"))
                .andExpect(status().isConflict());
    }

    @Test
    void springUsesTheRealPaymentManagerSingleton() {
        assertThat(context.getBean(PaymentManager.class)).isSameAs(PaymentManager.getInstance());
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private JsonNode register() throws Exception {
        String body = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(TestUsers.newRegistration())))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return json.readTree(body);
    }

    private static String bearer(JsonNode user) {
        return "Bearer " + user.get("token").asText();
    }

    private String loginBody(String email, String password) throws Exception {
        return json.writeValueAsString(java.util.Map.of("email", email, "password", password));
    }
}
