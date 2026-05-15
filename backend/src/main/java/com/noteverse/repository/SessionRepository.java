package com.noteverse.repository;

import com.noteverse.model.Session;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SessionRepository extends MongoRepository<Session, String> {

    List<Session> findByUserId(String userId);

    Optional<Session> findByRefreshToken(String refreshToken);

    List<Session> findByUserIdAndIsActiveTrue(String userId);

    void deleteByUserId(String userId);
}
