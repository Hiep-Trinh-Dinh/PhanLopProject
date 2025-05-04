package com.example.server.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${app.video.storage.path:./uploads/videos}")
    private String videoStoragePath;

    @SuppressWarnings("null")
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        try {
            // Tao duong dan tuyet doi tu cau hinh
            Path videoDir = Paths.get(videoStoragePath).toAbsolutePath().normalize();
            
            // Kiem tra va tao thu muc neu khong ton tai
            File videoDirFile = videoDir.toFile();
            if (!videoDirFile.exists()) {
                System.out.println("Thu muc video khong ton tai, dang tao: " + videoDir);
                Files.createDirectories(videoDir);
            }
    
            if (!videoDirFile.canRead() || !videoDirFile.canWrite()) {
                System.err.println("CANH BAO: Khong co quyen doc/ghi thu muc video: " + videoDir);
            }
    
            String videoAbsolutePath = videoDirFile.getAbsolutePath();
            
            // Dam bao duong dan ket thuc bang dau phan cach
            if (!videoAbsolutePath.endsWith(File.separator)) {
                videoAbsolutePath += File.separator;
            }
            
            // Dang ky resource handler cho video
            registry.addResourceHandler("/videos/**")
                    .addResourceLocations("file:" + videoAbsolutePath)
                    .setCachePeriod(3600); // Cache trong 1 gio
                    
            // Ghi log duong dan de de debug
            System.out.println("=================================================================");
            System.out.println("Video resource configured: /videos/** -> " + videoAbsolutePath);
            System.out.println("Trang thai thu muc: " + (videoDirFile.exists() ? "TON TAI" : "KHONG TON TAI"));
            System.out.println("Quyen doc: " + (videoDirFile.canRead() ? "CO" : "KHONG"));
            System.out.println("Quyen ghi: " + (videoDirFile.canWrite() ? "CO" : "KHONG"));
            System.out.println("=================================================================");
        } catch (Exception e) {
            System.err.println("LOI khi cau hinh thu muc video: " + e.getMessage());
            e.printStackTrace();
        }
    }    
} 