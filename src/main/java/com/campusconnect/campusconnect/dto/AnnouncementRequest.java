package com.campusconnect.campusconnect.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AnnouncementRequest {

    @NotBlank(message = "Title is required")
    @Size(
        max = 150,
        message = "Title must not exceed 150 characters"
    )
    private String title;

    @NotBlank(message = "Message is required")
    @Size(
        max = 5000,
        message = "Message must not exceed 5000 characters"
    )
    private String message;

    public AnnouncementRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
