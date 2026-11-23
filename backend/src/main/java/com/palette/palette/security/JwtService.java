package com.palette.palette.security;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.stereotype.Service;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import com.palette.palette.entities.User;

/**
 * Issues signed login tokens (HS256 JWTs).
 * The token subject is the user's id; {@link SecurityConfig} verifies tokens
 * with the same secret.
 */
@Service
public class JwtService {

    static final MacAlgorithm ALGORITHM = MacAlgorithm.HS256;
    private static final String ISSUER = "palette";

    private final NimbusJwtEncoder encoder;
    private final Duration lifetime;

    public JwtService(@Value("${palette.jwt.secret}") String secret,
                      @Value("${palette.jwt.lifetime:PT24H}") Duration lifetime) {
        this.encoder = new NimbusJwtEncoder(new ImmutableSecret<>(secretKey(secret)));
        this.lifetime = lifetime;
    }

    /** Builds the HMAC key and refuses secrets too short to be safe for HS256. */
    static SecretKey secretKey(String secret) {
        byte[] bytes = secret == null ? new byte[0] : secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException(
                    "palette.jwt.secret (env JWT_SECRET) must be at least 32 characters long");
        }
        return new SecretKeySpec(bytes, "HmacSHA256");
    }

    public String issueToken(User user) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(ISSUER)
                .subject(String.valueOf(user.getId()))
                .claim("email", user.getEmail())
                .issuedAt(now)
                .expiresAt(now.plus(lifetime))
                .build();
        JwsHeader header = JwsHeader.with(ALGORITHM).build();
        return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }
}
