package com.example.server.controllers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.file.Paths;

@RestController
@RequestMapping("/api/videos")
public class FileController {

    @Value("${app.video.storage.path:/Videos/Web}")
    private String videoStoragePath;

    @GetMapping("/{fileName}")
    public ResponseEntity<Resource> serveVideo(@PathVariable String fileName) {
        Resource file = new FileSystemResource(Paths.get(videoStoragePath, fileName));
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(MediaType.valueOf("video/mp4"))
                .body(file);
    }
}