package com.noteverse.repository;

import com.noteverse.model.Tag;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TagRepository extends MongoRepository<Tag, String> {

    List<Tag> findByUserId(String userId);

    Optional<Tag> findByUserIdAndName(String userId, String name);

    boolean existsByUserIdAndName(String userId, String name);
}
