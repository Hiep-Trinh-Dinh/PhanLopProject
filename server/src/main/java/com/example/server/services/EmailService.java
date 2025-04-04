package com.example.server.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    /**
     * Gửi email chứa mã xác minh 6 số
     * @param toEmail Địa chỉ email của người nhận
     * @param code Mã xác minh 6 số
     */
    public void sendVerificationEmail(String toEmail, String code) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Mã xác minh tài khoản của bạn");
            message.setText("Chào bạn,\n\n" +
                    "Cảm ơn bạn đã đăng ký! Dưới đây là mã xác minh của bạn:\n\n" +
                    "Mã: " + code + "\n\n" +
                    "Vui lòng nhập mã này vào ứng dụng để xác minh tài khoản. " +
                    "Mã này sẽ hết hạn sau 15 phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.\n\n" +
                    "Trân trọng,\n" +
                    "Đội ngũ hỗ trợ");

            mailSender.send(message);
            logger.info("Email xac minh da duoc gui thanh cong den {}", toEmail);
        } catch (MailException e) {
            logger.error("Lỗi khi gửi email xác minh đến {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Không thể gửi email xác minh: " + e.getMessage());
        }
    }

    /**
     * Gửi email thông báo chung
     * @param toEmail Địa chỉ email của người nhận
     * @param subject Tiêu đề email
     * @param body Nội dung email
     */
    public void sendEmail(String toEmail, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
            logger.info("📧 Email đã được gửi thành công đến {} với tiêu đề: {}", toEmail, subject);
        } catch (MailException e) {
            logger.error("❌ Lỗi khi gửi email đến {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Không thể gửi email: " + e.getMessage());
        }
    }
}
