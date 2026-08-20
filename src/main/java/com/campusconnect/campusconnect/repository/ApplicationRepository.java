package com.campusconnect.campusconnect.repository;

import com.campusconnect.campusconnect.model.Application;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository
        extends JpaRepository<Application, Integer> {

    Optional<Application> findByStudentIdAndCompanyId(
            Integer studentId,
            Integer companyId
    );

    List<Application> findByStudentId(
            Integer studentId
    );

    List<Application> findByStudentIdOrderByAppliedAtDesc(
            Integer studentId
    );
}