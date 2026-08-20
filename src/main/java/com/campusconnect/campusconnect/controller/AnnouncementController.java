package com.campusconnect.campusconnect.controller;

import com.campusconnect.campusconnect.dto.AnnouncementRequest;
import com.campusconnect.campusconnect.model.Announcement;
import com.campusconnect.campusconnect.service.AnnouncementService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    private final AnnouncementService announcementService;

    public AnnouncementController(
            AnnouncementService announcementService) {

        this.announcementService = announcementService;
    }

    @GetMapping
    public ResponseEntity<List<Announcement>> getAllAnnouncements() {

        return ResponseEntity.ok(
                announcementService.getAllAnnouncements()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Announcement> getAnnouncementById(
            @PathVariable Integer id) {

        Announcement announcement =
                announcementService.getAnnouncementById(id);

        if (announcement == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .build();
        }

        return ResponseEntity.ok(announcement);
    }

    @PostMapping
    public ResponseEntity<Announcement> createAnnouncement(
            @Valid @RequestBody AnnouncementRequest request) {

        Announcement announcement = new Announcement();

        announcement.setTitle(request.getTitle());
        announcement.setMessage(request.getMessage());

        Announcement saved =
                announcementService.saveAnnouncement(announcement);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAnnouncement(
            @PathVariable Integer id) {

        Announcement announcement =
                announcementService.getAnnouncementById(id);

        if (announcement == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .build();
        }

        announcementService.deleteAnnouncement(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}