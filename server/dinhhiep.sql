use dinhhiep;
-- Users table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    location VARCHAR(255),
    website VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    birth_date VARCHAR(255),
    password VARCHAR(255),
    image VARCHAR(255),
    bio TEXT,
    background_image VARCHAR(255),
    email_contact VARCHAR(255),
    phone_contact VARCHAR(255),
    is_requesting_user BOOLEAN DEFAULT FALSE,
    login_with_google BOOLEAN DEFAULT FALSE,
    gender VARCHAR(20),
    current_city VARCHAR(255),
    hometown VARCHAR(255),
    relationship_status VARCHAR(50),
    created_at DATETIME,
    updated_at DATETIME
);

-- Verifications table
CREATE TABLE verifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    verification_token VARCHAR(255) NOT NULL UNIQUE,
    verification_expiry DATETIME
);

-- Education table
CREATE TABLE education (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    school VARCHAR(255),
    degree VARCHAR(255),
    is_current BOOLEAN,
    start_year INT,
    end_year INT,
    user_id BIGINT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Work Experience table
CREATE TABLE work_experience (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    position VARCHAR(255),
    company VARCHAR(255),
    is_current BOOLEAN,
    start_year INT,
    end_year INT,
    user_id BIGINT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Friendships table
CREATE TABLE friendships (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    friend_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL,
    mutual_friends_count INT DEFAULT 0,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (friend_id) REFERENCES users(id)
);

-- Group table
CREATE TABLE group_table (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    avatar VARCHAR(255),
    cover VARCHAR(255),
    privacy VARCHAR(20) NOT NULL,
    member_count INT DEFAULT 0,
    post_count INT DEFAULT 0,
    media_count INT DEFAULT 0,
    created_by BIGINT NOT NULL,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Group Rules table
CREATE TABLE group_rules (
    group_id BIGINT,
    rules VARCHAR(255),
    FOREIGN KEY (group_id) REFERENCES group_table(id)
);

-- Group Members table
CREATE TABLE group_members (
    group_id BIGINT,
    user_id BIGINT NOT NULL,
    role VARCHAR(20) NOT NULL,
    is_notified BOOLEAN DEFAULT TRUE,
    joined_at DATETIME,
    last_active_at DATETIME,
    post_count INT DEFAULT 0,
    media_count INT DEFAULT 0,
    FOREIGN KEY (group_id) REFERENCES group_table(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Posts table
CREATE TABLE posts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    content TEXT,
    reply_for_id BIGINT,
    image VARCHAR(255),
    video VARCHAR(255),
    is_post BOOLEAN,
    is_reply BOOLEAN,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (reply_for_id) REFERENCES posts(id)
);

-- Post Media table
CREATE TABLE post_media (
    post_id BIGINT,
    media_type VARCHAR(20) NOT NULL,
    media_url VARCHAR(255) NOT NULL,
    created_at DATETIME,
    FOREIGN KEY (post_id) REFERENCES posts(id)
);

-- Likes table
CREATE TABLE likes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    post_id BIGINT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (post_id) REFERENCES posts(id)
);

-- Notifications table
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    actor_id BIGINT,
    type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    link VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (actor_id) REFERENCES users(id)
);

-- Videos table
CREATE TABLE videos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url VARCHAR(255) NOT NULL,
    thumbnail_url VARCHAR(255),
    duration INT,
    view_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    share_count INT DEFAULT 0,
    is_public BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Video Tags table
CREATE TABLE video_tags (
    video_id BIGINT,
    tags VARCHAR(255),
    FOREIGN KEY (video_id) REFERENCES videos(id)
);

-- User Followers table
CREATE TABLE user_followers (
    user_id BIGINT,
    follower_id BIGINT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (follower_id) REFERENCES users(id)
);