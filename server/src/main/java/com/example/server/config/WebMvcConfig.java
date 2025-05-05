package com.example.server.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
    private static final Logger logger = LoggerFactory.getLogger(WebMvcConfig.class);

    @Value("${app.video.storage.path:./uploads/videos}")
    private String videoStoragePath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        try {
            // Chuyển đổi đường dẫn sang tuyệt đối và chuẩn hóa
            Path videoDir = Paths.get(videoStoragePath).toAbsolutePath().normalize();
            File videoDirFile = videoDir.toFile();

            // Kiểm tra và tạo thư mục nếu không tồn tại
            if (!videoDirFile.exists()) {
                logger.info("Thu muc video khong ton tai, dang tao: {}", videoDir);
                Files.createDirectories(videoDir);
            }

            // Kiểm tra quyền đọc/ghi
            if (!videoDirFile.canRead() || !videoDirFile.canWrite()) {
                System.err.println("CANH BAO: Khong co quyen doc/ghi thu muc video: " + videoDir);
            }

            String videoAbsolutePath = videoDirFile.getAbsolutePath();

            // Đăng ký resource handler cho video
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