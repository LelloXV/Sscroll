package com.project.scroll.model;

import com.google.cloud.firestore.annotation.DocumentId;
import com.google.cloud.spring.data.firestore.Document;
import java.time.Instant;

@Document(collectionName = "editions")
public class Edition {

    @DocumentId
    private String id;
    private String title;
    private String pdfUrl;
    private String coverUrl;
    private Instant uploadDate;

    // Costruttore vuoto necessario per Firestore
    public Edition() {}

    public Edition(String title, String pdfUrl, String coverUrl, Instant uploadDate) {
        this.title = title;
        this.pdfUrl = pdfUrl;
        this.coverUrl = coverUrl;
        this.uploadDate = uploadDate;
    }

    // Getter e Setter
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getPdfUrl() { return pdfUrl; }
    public void setPdfUrl(String pdfUrl) { this.pdfUrl = pdfUrl; }

    public String getCoverUrl() { return coverUrl; }
    public void setCoverUrl(String coverUrl) { this.coverUrl = coverUrl; }

    public Instant getUploadDate() { return uploadDate; }
    public void setUploadDate(Instant uploadDate) { this.uploadDate = uploadDate; }
}