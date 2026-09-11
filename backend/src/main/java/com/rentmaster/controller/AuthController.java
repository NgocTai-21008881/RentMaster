package com.rentmaster.controller;

import com.rentmaster.dto.request.RegisterLandlordRequest;
import com.rentmaster.dto.response.ApiResponse;
import com.rentmaster.dto.response.UserResponse;
import com.rentmaster.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Đăng ký tài khoản Chủ nhà.
     * Endpoint: POST /api/v1/auth/register-landlord
     *
     * @param request DTO chứa fullName, phoneNumber, email, password
     * @return UserResponse bọc trong ApiResponse
     */
    @PostMapping("/register-landlord")
    public ResponseEntity<ApiResponse<UserResponse>> registerLandlord(
            @Valid @RequestBody RegisterLandlordRequest request) {

        UserResponse userResponse = authService.registerLandlord(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đăng ký chủ nhà thành công", userResponse));
    }
}
