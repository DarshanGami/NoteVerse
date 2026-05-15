package com.noteverse.repository;

import com.noteverse.model.SharedLink;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SharedLinkRepository extends MongoRepository<SharedLink, String> {

    Optional<SharedLink> findByToken(String token);

    List<SharedLink> findByNoteId(String noteId);

    List<SharedLink> findByNoteIdAndIsActiveTrue(String noteId);

    void deleteByNoteId(String noteId);
}
