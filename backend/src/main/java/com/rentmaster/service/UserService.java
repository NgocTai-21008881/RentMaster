package com.rentmaster.service;

import com.rentmaster.dto.response.UserResponse;
import com.rentmaster.entity.User;
import com.rentmaster.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AuthService authService;

    /**
     * Lấy thông tin User hiện tại.
     *
     * [STUB] Version cho Member A: nhận userId trực tiếp.
     * Khi B tích hợp JWT, sẽ đổi thành lấy userId từ SecurityContextHolder.
     *
     * @param userId ID người dùng (stub: từ @RequestParam, production: từ JWT)
     * @return UserResponse không chứa password
     */
    public UserResponse getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + userId));

        return authService.mapToUserResponse(user);
    }
}
