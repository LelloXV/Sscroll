package com.project.scroll.controller;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;
import org.springframework.core.io.ByteArrayResource;

@RestController
@RequestMapping("/api/collaborate")
public class CollaborateController {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String redazioneEmail;

    public CollaborateController(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @PostMapping
    public Mono<Void> sendArticle(
            @RequestParam("userEmail") String userEmail,
            @RequestParam("text") String text,
            @RequestParam(value = "articleTitle", required = false) String articleTitle,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        if (userEmail == null || !userEmail.matches("^[^@]+@[^@]+\\.[^@]+$")) {
            throw new RuntimeException("Email non valida");
        }
        if (text == null || text.isBlank()) {
            throw new RuntimeException("Testo vuoto");
        }
        if (text.length() > 50000) {
            throw new RuntimeException("Testo troppo lungo");
        }
        return Mono.fromRunnable(() -> {
            try {
                String subject = (articleTitle != null && !articleTitle.isBlank())
                        ? "Risposta a: " + articleTitle
                        : "Bozza Articolo da: " + userEmail;

                // 1. Mail alla redazione (con eventuale allegato)
                MimeMessage toRedazione = mailSender.createMimeMessage();
                MimeMessageHelper helperRedazione = new MimeMessageHelper(toRedazione, true, "UTF-8");
                helperRedazione.setFrom(redazioneEmail);
                helperRedazione.setTo(redazioneEmail);
                helperRedazione.setSubject(subject);
                helperRedazione.setText(text + "\n\n---\nAutore: " + userEmail);
                if (file != null && !file.isEmpty()) {
                    final byte[] fileBytes = file.getBytes();
                    helperRedazione.addAttachment(
                            file.getOriginalFilename(),
                            new ByteArrayResource(fileBytes) {
                                @Override
                                public String getFilename() {
                                    return file.getOriginalFilename();
                                }
                            }
                    );
                }
                mailSender.send(toRedazione);

                // 2. Conferma all'utente
                MimeMessage toUser = mailSender.createMimeMessage();
                MimeMessageHelper helperUser = new MimeMessageHelper(toUser, false, "UTF-8");
                helperUser.setFrom(redazioneEmail);
                helperUser.setTo(userEmail);
                helperUser.setSubject("Abbiamo ricevuto il tuo articolo");
                helperUser.setText(
                        "Ciao,\n\n" +
                                "Grazie per aver inviato il tuo contributo a Sscroll.\n" +
                                "La redazione valuterà la tua bozza e ti ricontatterà presto.\n\n" +
                                "— La Redazione di Sscroll"
                );
                mailSender.send(toUser);

            } catch (Exception e) {
                throw new RuntimeException("Errore invio mail", e);
            }
        });
    }
}