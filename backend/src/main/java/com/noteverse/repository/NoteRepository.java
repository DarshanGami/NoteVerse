package com.noteverse.repository;

import com.noteverse.model.Note;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteRepository extends MongoRepository<Note, String> {

    Page<Note> findByUserIdAndIsDeletedFalse(String userId, Pageable pageable);

    List<Note> findByUserIdAndIsDeletedFalse(String userId);

    List<Note> findByUserIdAndIsFavouriteTrue(String userId);

    List<Note> findByUserIdAndIsPinnedTrue(String userId);

    List<Note> findByUserIdAndIsDeletedTrue(String userId);

    List<Note> findByUserIdAndFolderIdAndIsDeletedFalse(String userId, String folderId);

    @Query("{ 'userId': ?0, 'isDeleted': false, $or: [ { 'title': { $regex: ?1, $options: 'i' } }, { 'content': { $regex: ?1, $options: 'i' } } ] }")
    List<Note> searchByTitleOrContent(String userId, String query);

    Page<Note> findByUserIdAndIsFavouriteTrueAndIsDeletedFalse(String userId, Pageable pageable);

    Page<Note> findByUserIdAndIsPinnedTrueAndIsDeletedFalse(String userId, Pageable pageable);

    Page<Note> findByUserIdAndFolderIdAndIsDeletedFalse(String userId, String folderId, Pageable pageable);

    long countByUserIdAndIsDeletedFalse(String userId);

    Page<Note> findByUserIdAndTagsContainingAndIsDeletedFalse(String userId, String tagId, Pageable pageable);

    @Query("{ 'collaborators.userId': ?0, 'isDeleted': false }")
    List<Note> findSharedWithUser(String userId);
}
