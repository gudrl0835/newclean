package com.cleanmatching.backend.domain.user.repository;

import com.cleanmatching.backend.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    long countByRole(User.Role role);

    List<User> findAllByOrderByCreatedAtDesc();
}
