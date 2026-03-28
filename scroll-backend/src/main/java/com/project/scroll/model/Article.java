package com.project.scroll.model;

public class Article {
    private String type;
    private String category;
    private String title;
    private String subtitle;
    private String extract;
    private String fullContent;
    private String backgroundImage;

    public Article() {} // Costruttore vuoto per Firestore/Jackson

    // Getter e Setter
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSubtitle() { return subtitle; }
    public void setSubtitle(String subtitle) { this.subtitle = subtitle; }

    public String getExtract() { return extract; }
    public void setExtract(String extract) { this.extract = extract; }

    public String getFullContent() { return fullContent; }
    public void setFullContent(String fullContent) { this.fullContent = fullContent; }

    public String getBackgroundImage() { return backgroundImage; }
    public void setBackgroundImage(String backgroundImage) { this.backgroundImage = backgroundImage; }
}