package com.campusconnect.campusconnect.mapper;

import com.campusconnect.campusconnect.dto.CompanyResponse;
import com.campusconnect.campusconnect.model.Company;
import org.springframework.stereotype.Component;

@Component
public class CompanyMapper {

    public CompanyResponse toResponse(Company company) {

        CompanyResponse response = new CompanyResponse();

        response.setId(company.getId());
        response.setCompanyName(company.getCompanyName());
        response.setRole(company.getRole());
        response.setPackageName(company.getPackageName());
        response.setLocation(company.getLocation());
        response.setEligibility(company.getEligibility());

        response.setApplicationDeadline(
                company.getApplicationDeadline()
        );

        return response;
    }
}