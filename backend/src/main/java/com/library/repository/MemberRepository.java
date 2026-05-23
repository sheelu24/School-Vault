package com.library.repository;

import com.library.entity.Member;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {

    Optional<Member> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("""
            SELECT m FROM Member m
            WHERE (:q IS NULL OR :q = ''
                   OR LOWER(m.name) LIKE LOWER(CONCAT('%', :q, '%'))
                   OR LOWER(m.email) LIKE LOWER(CONCAT('%', :q, '%')))
            """)
    Page<Member> search(@Param("q") String query, Pageable pageable);
}
