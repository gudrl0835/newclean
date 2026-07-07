UPDATE companies c JOIN users u ON c.user_id=u.id SET c.approval_status='APPROVED', c.is_verified=1, c.bayesian_rating=4.5 WHERE u.email IN ('clean1@test.com','clean2@test.com','clean3@test.com');
SELECT company_name, approval_status FROM companies LIMIT 10;
