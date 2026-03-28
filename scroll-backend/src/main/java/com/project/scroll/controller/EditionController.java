package com.project.scroll.controller;

import com.project.scroll.model.Edition;
import com.project.scroll.repository.EditionRepository;
import com.project.scroll.service.FileStorageService;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;

@RestController
@RequestMapping("/api/editions")
//@CrossOrigin(origins = "*") // Permette al frontend React di comunicare col backend, DA CAMBIARE CON L'INDIRIZZO DEL SITO
public class EditionController {

    private final EditionRepository editionRepository;
    //private final FileStorageService fileStorageService;

    public EditionController(EditionRepository editionRepository, FileStorageService fileStorageService) {
        this.editionRepository = editionRepository;
        //this.fileStorageService = fileStorageService;
    }

    // Prendi tutti i giornali (Archivio)
    @GetMapping
    public Flux<Edition> getAllEditions() {
        return editionRepository.findAll();
    }

    // Carica un nuovo giornale
    @PostMapping
    public Mono<Edition> createEdition(
            //@RequestParam("title") String title,
            //@RequestParam("file") MultipartFile file
            @RequestBody Edition edition) {

        try {
            if (edition.getTitle() == null || edition.getTitle().isBlank()) {
                return Mono.error(new IllegalArgumentException("Titolo mancante"));
            }
            if (edition.getArticles() == null || edition.getArticles().isEmpty()) {
                return Mono.error(new IllegalArgumentException("Articoli mancanti"));
            }
            // Limita numero articoli per evitare payload enormi
            if (edition.getArticles().size() > 20) {
                return Mono.error(new IllegalArgumentException("Troppi articoli"));
            }
            edition.setUploadDate(Instant.now());
            return editionRepository.save(edition);

        } catch (Exception e) {
            return Mono.error(e);
        }
    }
}