package com.project.scroll.service;

import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Storage storage;

    @Value("${gcp.storage.bucket-name}")
    private String bucketName;

    public FileStorageService(Storage storage) {
        this.storage = storage;
    }

    public String uploadFile(MultipartFile file) throws IOException {
        // Generiamo un nome unico per il file per evitare sovrascritture
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();

        // Creiamo il "Blob" su Firebase Storage
        BlobInfo blobInfo = BlobInfo.newBuilder(bucketName, fileName)
                .setContentType(file.getContentType())
                .build();

        storage.create(blobInfo, file.getBytes(), Storage.BlobTargetOption.predefinedAcl(Storage.PredefinedAcl.PUBLIC_READ));

        // Restituiamo il link al file (configurato per essere pubblico)
        return String.format("https://storage.googleapis.com/%s/%s", bucketName, fileName);
    }
}