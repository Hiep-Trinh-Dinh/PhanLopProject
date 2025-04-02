USE dinhhiep;

-- =============================================
-- BẢNG USERS: Lưu thông tin người dùng
-- =============================================
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,  -- ID tự động tăng của người dùng
    -- Thông tin đăng nhập
    username VARCHAR(50) UNIQUE NOT NULL,   -- Tên đăng nhập, không được trùng lặp
    email VARCHAR(255) UNIQUE NOT NULL,     -- Email, không được trùng lặp
    password VARCHAR(255) NOT NULL,         -- Mật khẩu đã được mã hóa
    name VARCHAR(100) NOT NULL,             -- Tên hiển thị của người dùng
    
    -- Thông tin cá nhân
    date_of_birth DATE,                     -- Ngày sinh
    gender ENUM('MALE', 'FEMALE', 'OTHER'), -- Giới tính
    avatar VARCHAR(255),                    -- URL ảnh đại diện
    cover VARCHAR(255),                     -- URL ảnh bìa
    bio TEXT,                               -- Tiểu sử người dùng
    location VARCHAR(255),                  -- Địa chỉ
    phone VARCHAR(20),                      -- Số điện thoại
    
    -- Trạng thái tài khoản
    is_online BOOLEAN DEFAULT FALSE,        -- Trạng thái online
    last_seen TIMESTAMP,                    -- Thời gian hoạt động cuối cùng
    is_verified BOOLEAN DEFAULT FALSE,      -- Trạng thái xác thực tài khoản
    is_active BOOLEAN DEFAULT TRUE,         -- Trạng thái hoạt động của tài khoản
    is_email_verified BOOLEAN DEFAULT FALSE, -- Trạng thái xác thực email
    
    -- Bảo mật
    reset_password_token VARCHAR(255),      -- Token để reset mật khẩu
    reset_password_expires TIMESTAMP,       -- Thời gian hết hạn token reset
    
    -- Thông tin profile
    relationship_status ENUM('SINGLE', 'IN_RELATIONSHIP', 'MARRIED', 'COMPLICATED'), -- Tình trạng mối quan hệ
    hometown VARCHAR(255),                  -- Quê quán
    work_place VARCHAR(255),                -- Nơi làm việc
    education VARCHAR(255),                 -- Học vấn
    
    -- Thống kê
    following_count INT DEFAULT 0,          -- Số người đang theo dõi
    followers_count INT DEFAULT 0,          -- Số người theo dõi
    posts_count INT DEFAULT 0,              -- Số bài đăng
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    -- Thời gian tạo tài khoản
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP  -- Thời gian cập nhật cuối
);

-- =============================================
-- BẢNG POSTS: Lưu thông tin bài đăng
-- =============================================
CREATE TABLE posts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,   -- ID tự động tăng của bài đăng
    user_id BIGINT NOT NULL,                -- ID người đăng bài
    content TEXT,                           -- Nội dung bài đăng
    privacy ENUM('PUBLIC', 'FRIENDS', 'PRIVATE') DEFAULT 'PUBLIC',  -- Chế độ riêng tư
    
    -- Thống kê
    like_count INT DEFAULT 0,               -- Số lượt thích
    comment_count INT DEFAULT 0,            -- Số bình luận
    share_count INT DEFAULT 0,              -- Số lượt chia sẻ
    view_count INT DEFAULT 0,               -- Số lượt xem
    
    -- Trạng thái
    is_featured BOOLEAN DEFAULT FALSE,      -- Bài đăng nổi bật
    is_archived BOOLEAN DEFAULT FALSE,      -- Bài đăng đã lưu trữ
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    -- Thời gian đăng bài
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  -- Thời gian cập nhật cuối
    
    FOREIGN KEY (user_id) REFERENCES users(id)  -- Liên kết với bảng users
);

-- =============================================
-- BẢNG POST_MEDIA: Lưu thông tin media của bài đăng
-- =============================================
CREATE TABLE post_media (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,   -- ID tự động tăng của media
    post_id BIGINT NOT NULL,                -- ID bài đăng
    media_url VARCHAR(255) NOT NULL,        -- URL của file media
    media_type ENUM('IMAGE', 'VIDEO', 'AUDIO', 'FILE') NOT NULL,  -- Loại media
    thumbnail_url VARCHAR(255),             -- URL ảnh thumbnail (cho video)
    duration INT,                           -- Thời lượng (cho video/audio)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    -- Thời gian tạo
    FOREIGN KEY (post_id) REFERENCES posts(id)  -- Liên kết với bảng posts
);

-- =============================================
-- BẢNG POST_LIKES: Lưu thông tin lượt thích bài đăng
-- =============================================
CREATE TABLE post_likes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,   -- ID tự động tăng của lượt thích
    post_id BIGINT NOT NULL,                -- ID bài đăng
    user_id BIGINT NOT NULL,                -- ID người thích
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    -- Thời gian thích
    
    FOREIGN KEY (post_id) REFERENCES posts(id),  -- Liên kết với bảng posts
    FOREIGN KEY (user_id) REFERENCES users(id),  -- Liên kết với bảng users
    UNIQUE KEY unique_post_like (post_id, user_id)  -- Đảm bảo mỗi người chỉ thích một bài đăng một lần
);

-- =============================================
-- BẢNG POST_COMMENTS: Lưu thông tin bình luận bài đăng
-- =============================================
CREATE TABLE post_comments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,   -- ID tự động tăng của bình luận
    post_id BIGINT NOT NULL,                -- ID bài đăng
    user_id BIGINT NOT NULL,                -- ID người bình luận
    content TEXT NOT NULL,                  -- Nội dung bình luận
    like_count INT DEFAULT 0,               -- Số lượt thích
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    -- Thời gian bình luận
    
    FOREIGN KEY (post_id) REFERENCES posts(id),  -- Liên kết với bảng posts
    FOREIGN KEY (user_id) REFERENCES users(id)  -- Liên kết với bảng users
);

-- =============================================
-- BẢNG COMMENT_REPLIES: Lưu thông tin phản hồi bình luận
-- =============================================
CREATE TABLE comment_replies (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,   -- ID tự động tăng của phản hồi
    comment_id BIGINT NOT NULL,             -- ID bình luận
    user_id BIGINT NOT NULL,                -- ID người phản hồi
    content TEXT NOT NULL,                  -- Nội dung phản hồi
    like_count INT DEFAULT 0,               -- Số lượt thích
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    -- Thời gian phản hồi
    
    FOREIGN KEY (comment_id) REFERENCES post_comments(id),  -- Liên kết với bảng post_comments
    FOREIGN KEY (user_id) REFERENCES users(id)  -- Liên kết với bảng users
);

-- =============================================
-- BẢNG POST_TAGS: Lưu thông tin tags của bài đăng
-- =============================================
CREATE TABLE post_tags (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,   -- ID tự động tăng của tag
    post_id BIGINT NOT NULL,                -- ID bài đăng
    tag VARCHAR(255) NOT NULL,              -- Nội dung tag
    
    FOREIGN KEY (post_id) REFERENCES posts(id)  -- Liên kết với bảng posts
);

-- =============================================
-- BẢNG STORIES: Lưu thông tin tin nhắn thoáng qua
-- =============================================
CREATE TABLE stories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,   -- ID tự động tăng của story
    user_id BIGINT NOT NULL,                -- ID người đăng story
    media_url VARCHAR(255) NOT NULL,        -- URL của file media
    thumbnail_url VARCHAR(255),             -- URL ảnh thumbnail
    media_type ENUM('IMAGE', 'VIDEO') NOT NULL,  -- Loại media
    duration INT,                           -- Thời lượng (cho video)
    
    -- Thống kê
    view_count INT DEFAULT 0,               -- Số lượt xem
    like_count INT DEFAULT 0,               -- Số lượt thích
    reply_count INT DEFAULT 0,              -- Số lượt trả lời
    
    -- Trạng thái
    is_archived BOOLEAN DEFAULT FALSE,      -- Story đã lưu trữ
    is_highlight BOOLEAN DEFAULT FALSE,     -- Story nổi bật
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    -- Thời gian tạo
    expires_at TIMESTAMP,                   -- Thời gian hết hạn (24h)
    
    FOREIGN KEY (user_id) REFERENCES users(id)  -- Liên kết với bảng users
);

-- =============================================
-- BẢNG STORY_VIEWS: Lưu thông tin người xem story
-- =============================================
CREATE TABLE story_views (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,   -- ID tự động tăng của lượt xem
    story_id BIGINT NOT NULL,               -- ID của story
    user_id BIGINT NOT NULL,                -- ID người xem
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Thời gian xem
    view_duration INT,                      -- Thời gian xem (giây)
    
    FOREIGN KEY (story_id) REFERENCES stories(id),  -- Liên kết với bảng stories
    FOREIGN KEY (user_id) REFERENCES users(id)  -- Liên kết với bảng users
);

-- =============================================
-- BẢNG VIDEOS: Lưu thông tin video
-- =============================================
CREATE TABLE videos (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,   -- ID tự động tăng của video
    user_id BIGINT NOT NULL,                -- ID người đăng video
    title VARCHAR(255) NOT NULL,            -- Tiêu đề video
    description TEXT,                       -- Mô tả video
    video_url VARCHAR(255) NOT NULL,        -- URL của file video
    thumbnail_url VARCHAR(255),             -- URL ảnh thumbnail
    duration INT,                           -- Thời lượng video (giây)
    
    -- Thống kê
    view_count INT DEFAULT 0,               -- Số lượt xem
    like_count INT DEFAULT 0,               -- Số lượt thích
    comment_count INT DEFAULT 0,            -- Số bình luận
    share_count INT DEFAULT 0,              -- Số lượt chia sẻ
    
    -- Trạng thái
    is_featured BOOLEAN DEFAULT FALSE,      -- Video nổi bật
    is_archived BOOLEAN DEFAULT FALSE,      -- Video đã lưu trữ
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    -- Thời gian tạo
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  -- Thời gian cập nhật cuối
    
    FOREIGN KEY (user_id) REFERENCES users(id)  -- Liên kết với bảng users
);

-- =============================================
-- BẢNG VIDEO_TAGS: Lưu thông tin tags của video
-- =============================================
CREATE TABLE video_tags (
    video_id BIGINT NOT NULL,               -- ID của video
    tag VARCHAR(50) NOT NULL,               -- Nội dung tag
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    -- Thời gian tạo
    PRIMARY KEY (video_id, tag),            -- Khóa chính kết hợp
    FOREIGN KEY (video_id) REFERENCES videos(id)  -- Liên kết với bảng videos
);

-- =============================================
-- BẢNG NOTIFICATIONS: Lưu thông tin thông báo
-- =============================================
CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,   -- ID tự động tăng của thông báo
    user_id BIGINT NOT NULL,                -- ID người nhận thông báo
    actor_id BIGINT,                        -- ID người tạo thông báo
    type ENUM('POST_LIKE', 'POST_COMMENT', 'POST_MENTION', 'POST_SHARE',
              'FRIEND_REQUEST', 'FRIEND_ACCEPTED', 'FRIEND_SUGGESTION',
              'GROUP_INVITE', 'GROUP_JOIN_REQUEST', 'GROUP_JOIN_ACCEPTED',
              'GROUP_MENTION', 'MESSAGE_RECEIVED', 'MESSAGE_READ', 'SYSTEM') NOT NULL,  -- Loại thông báo
    content TEXT NOT NULL,                  -- Nội dung thông báo
    link VARCHAR(255),                      -- Link liên kết
    is_read BOOLEAN DEFAULT FALSE,          -- Trạng thái đã đọc
    is_deleted BOOLEAN DEFAULT FALSE,       -- Trạng thái đã xóa
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    -- Thời gian tạo
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  -- Thời gian cập nhật cuối
    
    FOREIGN KEY (user_id) REFERENCES users(id),  -- Liên kết với bảng users
    FOREIGN KEY (actor_id) REFERENCES users(id)  -- Liên kết với bảng users
);

-- =============================================
-- BẢNG MESSAGES: Lưu thông tin tin nhắn
-- =============================================
CREATE TABLE messages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,   -- ID tự động tăng của tin nhắn
    sender_id BIGINT NOT NULL,              -- ID người gửi
    receiver_id BIGINT NOT NULL,            -- ID người nhận
    content TEXT NOT NULL,                  -- Nội dung tin nhắn
    media_url VARCHAR(255),                 -- URL của file media (nếu có)
    message_type ENUM('TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'FILE', 'STICKER', 'SYSTEM') DEFAULT 'TEXT',  -- Loại tin nhắn
    is_read BOOLEAN DEFAULT FALSE,          -- Trạng thái đã đọc
    is_deleted BOOLEAN DEFAULT FALSE,       -- Trạng thái đã xóa
    deleted_for BIGINT,                     -- ID người xóa tin nhắn
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    -- Thời gian gửi
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  -- Thời gian cập nhật cuối
    
    FOREIGN KEY (sender_id) REFERENCES users(id),  -- Liên kết với bảng users
    FOREIGN KEY (receiver_id) REFERENCES users(id)  -- Liên kết với bảng users
);

-- =============================================
-- BẢNG SOCIAL_GROUPS: Lưu thông tin nhóm
-- =============================================
CREATE TABLE social_groups (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,   -- ID tự động tăng của nhóm
    name VARCHAR(255) NOT NULL,             -- Tên nhóm
    description TEXT,                       -- Mô tả nhóm
    avatar VARCHAR(255),                    -- URL ảnh đại diện
    cover VARCHAR(255),                     -- URL ảnh bìa
    privacy ENUM('PUBLIC', 'PRIVATE') DEFAULT 'PUBLIC',  -- Chế độ riêng tư
    
    -- Thống kê
    member_count INT DEFAULT 0,             -- Số thành viên
    post_count INT DEFAULT 0,               -- Số bài đăng
    media_count INT DEFAULT 0,              -- Số media
    
    -- Thông tin tạo nhóm
    created_by BIGINT NOT NULL,             -- ID người tạo nhóm
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    -- Thời gian tạo
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  -- Thời gian cập nhật cuối
    
    FOREIGN KEY (created_by) REFERENCES users(id)  -- Liên kết với bảng users
);

-- =============================================
-- BẢNG GROUP_RULES: Lưu thông tin quy định của nhóm
-- =============================================
CREATE TABLE group_rules (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,   -- ID tự động tăng của quy định
    group_id BIGINT NOT NULL,               -- ID của nhóm
    rule TEXT NOT NULL,                     -- Nội dung quy định
    FOREIGN KEY (group_id) REFERENCES social_groups(id)  -- Liên kết với bảng social_groups
);

-- =============================================
-- BẢNG GROUP_MEMBERS: Lưu thông tin thành viên nhóm
-- =============================================
CREATE TABLE group_members (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,   -- ID tự động tăng của thành viên
    group_id BIGINT NOT NULL,               -- ID của nhóm
    user_id BIGINT NOT NULL,                -- ID người dùng
    role ENUM('ADMIN', 'MODERATOR', 'MEMBER') DEFAULT 'MEMBER',  -- Vai trò trong nhóm
    is_notified BOOLEAN DEFAULT TRUE,       -- Trạng thái nhận thông báo
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Thời gian tham gia
    last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Thời gian hoạt động cuối
    
    -- Thống kê
    post_count INT DEFAULT 0,               -- Số bài đăng
    media_count INT DEFAULT 0,              -- Số media
    
    FOREIGN KEY (group_id) REFERENCES social_groups(id),  -- Liên kết với bảng social_groups
    FOREIGN KEY (user_id) REFERENCES users(id),  -- Liên kết với bảng users
    UNIQUE KEY unique_group_member (group_id, user_id)  -- Đảm bảo mỗi người chỉ tham gia nhóm một lần
);

-- =============================================
-- BẢNG FRIENDSHIPS: Lưu thông tin kết bạn
-- =============================================
CREATE TABLE friendships (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,   -- ID tự động tăng của kết bạn
    user_id BIGINT NOT NULL,                -- ID người dùng
    friend_id BIGINT NOT NULL,              -- ID người bạn
    status ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'BLOCKED') DEFAULT 'PENDING',  -- Trạng thái kết bạn
    mutual_friends_count INT DEFAULT 0,     -- Số bạn chung
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    -- Thời gian tạo
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  -- Thời gian cập nhật cuối
    
    FOREIGN KEY (user_id) REFERENCES users(id),  -- Liên kết với bảng users
    FOREIGN KEY (friend_id) REFERENCES users(id),  -- Liên kết với bảng users
    UNIQUE KEY unique_friendship (user_id, friend_id)  -- Đảm bảo mỗi cặp kết bạn chỉ tồn tại một lần
);