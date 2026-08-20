package com.campusconnect.campusconnect.mapper;

import com.campusconnect.campusconnect.dto.AnnouncementResponse;
import com.campusconnect.campusconnect.model.Announcement;
import org.springframework.stereotype.Component;

@Component
public class AnnouncementMapper {

    public AnnouncementResponse toResponse(Announcement announcement) {

        AnnouncementResponse response = new AnnouncementResponse();

        response.setId(announcement.getId());
        response.setTitle(announcement.getTitle());
        response.setMessage(announcement.getMessage());

        return response;
    }
}