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

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        try {
            // Tạo đường dẫn tuyệt đối từ cấu hình
            Path videoDir = Paths.get(videoStoragePath).toAbsolutePath().normalize();
            
            // Kiểm tra và tạo thư mục nếu không tồn tại
            File videoDirFile = videoDir.toFile();
            if (!videoDirFile.exists()) {
                System.out.println("Thư mục video không tồn tại, đang tạo: " + videoDir);
                Files.createDirectories(videoDir);
            }

            if (!videoDirFile.canRead() || !videoDirFile.canWrite()) {
                System.err.println("CẢNH BÁO: Không có quyền đọc/ghi thư mục video: " + videoDir);
            }

            String videoAbsolutePath = videoDirFile.getAbsolutePath();
            
            // Đảm bảo đường dẫn kết thúc bằng dấu phân cách
            if (!videoAbsolutePath.endsWith(File.separator)) {
                videoAbsolutePath += File.separator;
            }
            
            // Đăng ký resource handler cho video
            registry.addResourceHandler("/videos/**")
                    .addResourceLocations("file:" + videoAbsolutePath)
                    .setCachePeriod(3600); // Cache trong 1 giờ
                    
            // Ghi log đường dẫn để dễ debug
            System.out.println("=================================================================");
            System.out.println("Video resource configured: /videos/** -> " + videoAbsolutePath);
            System.out.println("Trạng thái thư mục: " + (videoDirFile.exists() ? "TỒN TẠI" : "KHÔNG TỒN TẠI"));
            System.out.println("Quyền đọc: " + (videoDirFile.canRead() ? "CÓ" : "KHÔNG"));
            System.out.println("Quyền ghi: " + (videoDirFile.canWrite() ? "CÓ" : "KHÔNG"));
            System.out.println("=================================================================");
        } catch (Exception e) {
            System.err.println("LỖI khi cấu hình thư mục video: " + e.getMessage());
            e.printStackTrace();
        }
    }
} 