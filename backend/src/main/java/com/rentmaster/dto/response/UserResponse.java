package com.rentmaster.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO response cho thông tin User.
 * KHÔNG BAO GIỜ chứa trường password.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String fullName;
    private String phoneNumber;
    private String email;
    private String role;
    private Long landlordId;
    private String status;
    private LocalDateTime createdAt;
}
