package com.campusconnect.campusconnect.mapper;

import com.campusconnect.campusconnect.dto.ApplicationResponse;
import com.campusconnect.campusconnect.model.Application;

public class ApplicationMapper {

    public static ApplicationResponse toResponse(Application application) {

        ApplicationResponse response = new ApplicationResponse();

        response.setId(application.getId());
        response.setStudentId(application.getStudentId());
        response.setCompanyId(application.getCompanyId());
        response.setAppliedAt(application.getAppliedAt());

        return response;
    }
}