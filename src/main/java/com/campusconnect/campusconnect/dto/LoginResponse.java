package com.campusconnect.campusconnect.dto;

public class LoginResponse {

    private boolean success;
    private String message;
    private Integer adminId;
    private String username;
    private String token;

    public LoginResponse() {
    }

    public LoginResponse(
            boolean success,
            String message,
            Integer adminId,
            String username,
            String token) {

        this.success = success;
        this.message = message;
        this.adminId = adminId;
        this.username = username;
        this.token = token;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Integer getAdminId() {
        return adminId;
    }

    public void setAdminId(Integer adminId) {
        this.adminId = adminId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
