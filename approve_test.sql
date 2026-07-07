UPDATE companies c
JOIN users u ON c.user_id = u.id
SET c.approval_status = 'APPROVED',
    c.is_verified = 1,
    c.bayesian_rating = 4.5
WHERE u.email IN ('clean1@test.com', 'clean2@test.com', 'clean3@test.com');

SELECT c.company_name, c.approval_status, c.is_verified, c.bayesian_rating
FROM companies c
JOIN users u ON c.user_id = u.id
ORDER BY c.id;
