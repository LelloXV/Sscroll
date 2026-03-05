package com.project.scroll.repository;

import com.google.cloud.spring.data.firestore.FirestoreReactiveRepository;
import com.project.scroll.model.Edition;
import org.springframework.stereotype.Repository;

@Repository
public interface EditionRepository extends FirestoreReactiveRepository<Edition> {
    /*
    Il codice del metodo findAll() non lo scrivi tu e
    non lo vedi nel tuo progetto. Lo genera Spring a runtime
     */

    // Qui puoi aggiungere metodi personalizzati, ad esempio per cercare per data
}