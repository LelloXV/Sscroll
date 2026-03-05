package com.project.scroll.model;

import com.google.cloud.firestore.annotation.DocumentId;
import com.google.cloud.spring.data.firestore.Document;
import java.time.Instant;
import java.util.List;

@Document(collectionName = "editions")
public class Edition {

    @DocumentId
    private String id;
    private String title; // Nome interno usato dall'admin (es. "Lancio Marzo")
    private String issueNumber; // es. "43"
    private String date; // es. "24 FEB 2026"
    private Instant uploadDate;

    // Ecco la magia NoSQL: una lista di oggetti complessi
    private List<Article> articles;

    public Edition() {}

    // Getter e Setter
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getIssueNumber() { return issueNumber; }
    public void setIssueNumber(String issueNumber) { this.issueNumber = issueNumber; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public Instant getUploadDate() { return uploadDate; }
    public void setUploadDate(Instant uploadDate) { this.uploadDate = uploadDate; }

    public List<Article> getArticles() { return articles; }
    public void setArticles(List<Article> articles) { this.articles = articles; }
}