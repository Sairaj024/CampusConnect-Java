package com.campusconnect.campusconnect.controller;

import com.campusconnect.campusconnect.model.Admin;
import com.campusconnect.campusconnect.service.AdminService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admins")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping
public List<Admin> getAllAdmins() {

    List<Admin> admins = adminService.getAllAdmins();

    admins.forEach(admin -> admin.setPassword(null));

    return admins;
}

    @GetMapping("/{id}")
    public Admin getAdminById(@PathVariable Integer id) {

        Admin admin = adminService.getAdminById(id);

        if (admin == null) {
            return null;
        }

        admin.setPassword(null);

        return admin;
    }

    @PostMapping
    public Admin createAdmin(@RequestBody Admin admin) {

        Admin savedAdmin = adminService.saveAdmin(admin);

        savedAdmin.setPassword(null);

        return savedAdmin;
    }

    @DeleteMapping("/{id}")
    public void deleteAdmin(@PathVariable Integer id) {
        adminService.deleteAdmin(id);
    }
}