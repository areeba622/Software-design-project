package com.palette.palette.dto;

/**
 * DTO for Designer — used for both gallery list and profile detail responses.
 */
public class DesignerDTO {

    private Long id;
    private String name;
    private String email;
    private String bio;
    private String portfolioUrl;
    private Double hourlyRatePKR;
    private String specialty;
    private String preferredStyleName;

    // ─── Constructors ───────────────────────────────────────────────────────────

    public DesignerDTO() {}

    public DesignerDTO(Long id, String name, String email, String bio,
                       String portfolioUrl, Double hourlyRatePKR,
                       String specialty, String preferredStyleName) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.bio = bio;
        this.portfolioUrl = portfolioUrl;
        this.hourlyRatePKR = hourlyRatePKR;
        this.specialty = specialty;
        this.preferredStyleName = preferredStyleName;
    }

    // ─── Getters ────────────────────────────────────────────────────────────────

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getBio() { return bio; }
    public String getPortfolioUrl() { return portfolioUrl; }
    public Double getHourlyRatePKR() { return hourlyRatePKR; }
    public String getSpecialty() { return specialty; }
    public String getPreferredStyleName() { return preferredStyleName; }

    // ─── Setters ────────────────────────────────────────────────────────────────

    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    public void setBio(String bio) { this.bio = bio; }
    public void setPortfolioUrl(String portfolioUrl) { this.portfolioUrl = portfolioUrl; }
    public void setHourlyRatePKR(Double hourlyRatePKR) { this.hourlyRatePKR = hourlyRatePKR; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }
    public void setPreferredStyleName(String preferredStyleName) { this.preferredStyleName = preferredStyleName; }

    // ─── toString ───────────────────────────────────────────────────────────────

    @Override
    public String toString() {
        return "DesignerDTO{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", specialty='" + specialty + '\'' +
                ", preferredStyleName='" + preferredStyleName + '\'' +
                '}';
    }
}