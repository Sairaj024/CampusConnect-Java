package com.campusconnect.campusconnect.service;

import com.campusconnect.campusconnect.model.Announcement;
import com.campusconnect.campusconnect.repository.AnnouncementRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;

    public AnnouncementService(AnnouncementRepository announcementRepository) {
        this.announcementRepository = announcementRepository;
    }

    public List<Announcement> getAllAnnouncements() {
        return announcementRepository.findAll();
    }

    public Announcement getAnnouncementById(Integer id) {
        return announcementRepository.findById(id).orElse(null);
    }

    public Announcement saveAnnouncement(Announcement announcement) {

        if (announcement.getCreatedAt() == null) {
            announcement.setCreatedAt(LocalDateTime.now());
        }

        return announcementRepository.save(announcement);
    }

    public void deleteAnnouncement(Integer id) {
        announcementRepository.deleteById(id);
    }
}