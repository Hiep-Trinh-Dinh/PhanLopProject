-- Kiểm tra xem cột is_email_verified đã tồn tại chưa
SET @exist := (SELECT COUNT(*) 
               FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_SCHEMA = 'dinhhiep' 
               AND TABLE_NAME = 'users' 
               AND COLUMN_NAME = 'is_email_verified');

-- Thêm cột nếu chưa tồn tại
SET @query = IF(@exist = 0, 
               'ALTER TABLE users ADD COLUMN is_email_verified BOOLEAN DEFAULT false',
               'SELECT "Cột is_email_verified đã tồn tại"');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Cập nhật giá trị cho các người dùng đã tồn tại
UPDATE users SET is_email_verified = true WHERE id IN (1, 2, 3, 4, 5, 6, 7, 101, 102, 103, 104, 105, 106);

-- Kiểm tra dữ liệu đã cập nhật
SELECT id, first_name, last_name, is_email_verified FROM users WHERE id IN (1, 2, 3, 4, 5, 6, 7, 101, 102, 103, 104, 105, 106); 