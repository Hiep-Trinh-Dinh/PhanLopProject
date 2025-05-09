package com.example.server.services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    /**
     * Gửi email chứa mã xác minh 6 số
     */
    public void sendVerificationEmail(String toEmail, String code) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("🔐 Xác minh tài khoản của bạn");

            String htmlContent = "<div style='font-family: Arial, sans-serif; padding: 20px;'>"
                    + "<h2 style='color: #2E86C1;'>Chào bạn,</h2>"
                    + "<p>Cảm ơn bạn đã đăng ký! Đây là mã xác minh của bạn:</p>"
                    + "<div style='font-size: 24px; font-weight: bold; color: #E74C3C; margin: 20px 0;'>" + code + "</div>"
                    + "<p>Vui lòng nhập mã này vào ứng dụng để xác minh tài khoản. Mã sẽ hết hạn sau <strong>15 phút</strong>.</p>"
                    + "<hr style='margin-top:30px;'>"
                    + "<p style='font-size: 12px; color: #999;'>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>"
                    + "<p>Trân trọng,<br><em>Đội ngũ hỗ trợ</em></p>"
                    + "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(mimeMessage);
            logger.info("Email xác minh (HTML) đã được gửi thành công đến {}", toEmail);
        } catch (MessagingException | MailException e) {
            logger.error("Lỗi khi gửi email xác minh đến {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Không thể gửi email xác minh: " + e.getMessage());
        }
    }

    /**
     * Gửi email đặt lại mật khẩu (HTML)
     */
    public void sendResetPasswordEmail(String toEmail, String resetLink) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("🔑 Đặt lại mật khẩu của bạn");

            String htmlContent = "<div style='font-family: Arial, sans-serif; padding: 20px;'>"
                    + "<h2 style='color: #27AE60;'>Xin chào,</h2>"
                    + "<p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>"
                    + "<p>Vui lòng nhấp vào nút bên dưới để đặt lại mật khẩu:</p>"
                    + "<a href='" + resetLink + "' style='display: inline-block; padding: 12px 24px; background-color: #2980B9; color: white; text-decoration: none; border-radius: 5px;'>Đặt lại mật khẩu</a>"
                    + "<p style='margin-top: 20px;'>Liên kết này sẽ hết hạn sau <strong>5 phút</strong>.</p>"
                    + "<hr style='margin-top:30px;'>"
                    + "<p style='font-size: 12px; color: #999;'>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>"
                    + "<p>Trân trọng,<br><em>Đội ngũ hỗ trợ</em></p>"
                    + "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(mimeMessage);
            logger.info("Email đặt lại mật khẩu (HTML) đã được gửi thành công đến {}", toEmail);
        } catch (MessagingException | MailException e) {
            logger.error("Lỗi khi gửi email đặt lại mật khẩu đến {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Không thể gửi email đặt lại mật khẩu: " + e.getMessage());
        }
    }

    /**
     * Gửi email HTML thông báo chung
     */
    public void sendEmail(String toEmail, String subject, String body) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject(subject);

            String htmlContent = "<div style='font-family: Arial, sans-serif; padding: 20px;'>"
                    + "<p>" + body + "</p>"
                    + "<hr style='margin-top:30px;'>"
                    + "<p style='font-size: 12px; color: #999;'>Đây là email tự động, vui lòng không trả lời.</p>"
                    + "</div>";

            helper.setText(htmlContent, true);
            mailSender.send(mimeMessage);
            logger.info("📧 Email HTML đã được gửi thành công đến {} với tiêu đề: {}", toEmail, subject);
        } catch (MessagingException | MailException e) {
            logger.error("❌ Lỗi khi gửi email HTML đến {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Không thể gửi email: " + e.getMessage());
        }
    }
}