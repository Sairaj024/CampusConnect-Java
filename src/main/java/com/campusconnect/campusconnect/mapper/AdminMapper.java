package com.campusconnect.campusconnect.mapper;

import com.campusconnect.campusconnect.dto.AdminRequest;
import com.campusconnect.campusconnect.model.Admin;
import org.springframework.stereotype.Component;

@Component
public class AdminMapper {

    public Admin toEntity(AdminRequest request) {

        Admin admin = new Admin();

        admin.setUsername(request.getUsername());
        admin.setPassword(request.getPassword());

        return admin;
    }
}