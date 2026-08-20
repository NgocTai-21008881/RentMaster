package com.rentmaster.controller;

import com.rentmaster.dto.response.ApiResponse;
import com.rentmaster.dto.response.UserResponse;
import com.rentmaster.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * Lấy thông tin người dùng hiện tại.
     * Endpoint: GET /api/v1/users/me
     *
     * [STUB] Version cho Member A: nhận userId qua @RequestParam.
     * Khi B tích hợp JWT, sẽ đổi thành:
     *   - Bỏ @RequestParam userId
     *   - Lấy userId từ SecurityContextHolder.getContext().getAuthentication()
     *
     * @param userId ID người dùng (tạm thời qua query param)
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            @RequestParam Long userId) {

        UserResponse userResponse = userService.getCurrentUser(userId);

        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin thành công", userResponse));
    }
}
