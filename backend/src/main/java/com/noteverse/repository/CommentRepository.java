package com.noteverse.repository;

import com.noteverse.model.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends MongoRepository<Comment, String> {

    List<Comment> findByNoteId(String noteId);

    List<Comment> findByNoteIdOrderByCreatedAtAsc(String noteId);

    long countByNoteId(String noteId);
}
