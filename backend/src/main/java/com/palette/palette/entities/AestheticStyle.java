package com.palette.palette.entities;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "aesthetic_styles")
public class AestheticStyle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;  // e.g., "Boho", "Minimalist", "Desi"

    @Column(length = 500)
    private String description;

    @JsonIgnore
    @OneToMany(mappedBy = "style", cascade = CascadeType.ALL)
    private List<FurnitureBundle> bundles;

    @JsonIgnore // 3. (Highly Recommended) Add this here too so Designers don't loop later!
    @OneToMany(mappedBy = "preferredStyle", cascade = CascadeType.ALL)
    private List<Designer> designers;

    // ── Constructors ──────────────────────────────────────────────────────────
    public AestheticStyle() {}

    public AestheticStyle(String name, String description) {
        this.name = name;
        this.description = description;
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<FurnitureBundle> getBundles() { return bundles; }
    public void setBundles(List<FurnitureBundle> bundles) { this.bundles = bundles; }

    public List<Designer> getDesigners() { return designers; }
    public void setDesigners(List<Designer> designers) { this.designers = designers; }

    // ── equals & hashCode ─────────────────────────────────────────────────────
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AestheticStyle that = (AestheticStyle) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }

    @Override
    public String toString() {
        return "AestheticStyle{" +
                "id=" + id +
                ", name='" + name + '\'' +
                '}';
    }
}