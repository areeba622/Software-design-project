package com.palette.palette.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "designers")
public class Designer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(length = 500)
    private String bio;

    @Column(length = 500)
    private String portfolioUrl;

    @Column(name = "hourly_rate_pkr", nullable = false)
    private Double hourlyRatePKR;

    @Column(nullable = false)
    private String specialty;  // e.g., "Minimalist", "Bohemian", "Scanvandian"

    // Bridge pattern: Designer linked to one aesthetic style
    @ManyToOne
    @JoinColumn(name = "preferred_style_id", nullable = false)
    private AestheticStyle preferredStyle;

    // ── Constructors ──────────────────────────────────────────────────────────
    public Designer() {}

    public Designer(String name, String email, Double hourlyRatePKR, String specialty, 
                    AestheticStyle preferredStyle) {
        this.name = name;
        this.email = email;
        this.hourlyRatePKR = hourlyRatePKR;
        this.specialty = specialty;
        this.preferredStyle = preferredStyle;
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getPortfolioUrl() { return portfolioUrl; }
    public void setPortfolioUrl(String portfolioUrl) { this.portfolioUrl = portfolioUrl; }

    public Double getHourlyRatePKR() { return hourlyRatePKR; }
    public void setHourlyRatePKR(Double hourlyRatePKR) { this.hourlyRatePKR = hourlyRatePKR; }

    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }

    public AestheticStyle getPreferredStyle() { return preferredStyle; }
    public void setPreferredStyle(AestheticStyle preferredStyle) { this.preferredStyle = preferredStyle; }

    // ── equals & hashCode ─────────────────────────────────────────────────────
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Designer designer = (Designer) o;
        return id != null && id.equals(designer.id);
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }

    @Override
    public String toString() {
        return "Designer{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", specialty='" + specialty + '\'' +
                ", hourlyRatePKR=" + hourlyRatePKR +
                '}';
    }
}