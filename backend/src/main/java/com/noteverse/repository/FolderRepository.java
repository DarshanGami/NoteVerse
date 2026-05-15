package com.noteverse.repository;

import com.noteverse.model.Folder;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FolderRepository extends MongoRepository<Folder, String> {

    List<Folder> findByUserId(String userId);

    List<Folder> findByUserIdAndParentId(String userId, String parentId);

    List<Folder> findByUserIdAndParentIdIsNull(String userId);
}
