-- 관리자 계정 생성 (비밀번호: admin1234)
-- BCrypt 암호화된 값
USE cleanmatching;

INSERT INTO users (email, password, name, phone, role, email_verified, created_at, updated_at)
VALUES (
  'admin@cleanmatching.com',
  '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH',
  '관리자',
  '010-0000-0000',
  'ADMIN',
  true,
  NOW(),
  NOW()
);
