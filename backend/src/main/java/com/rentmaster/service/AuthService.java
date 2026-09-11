package com.rentmaster.service;

import com.rentmaster.dto.request.RegisterLandlordRequest;
import com.rentmaster.dto.response.UserResponse;
import com.rentmaster.entity.User;
import com.rentmaster.entity.enums.Role;
import com.rentmaster.entity.enums.UserStatus;
import com.rentmaster.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Đăng ký tài khoản Chủ nhà (Landlord).
     *
     * Luồng xử lý:
     * 1. Kiểm tra trùng SĐT → throw nếu đã tồn tại
     * 2. Băm mật khẩu bằng BCrypt
     * 3. Lưu User với role = LANDLORD, status = ACTIVE
     * 4. Cập nhật landlord_id = id (quy chuẩn multi-tenant: landlord là tenant chủ thể)
     * 5. Trả về UserResponse (không chứa password)
     */
    @Transactional
    public UserResponse registerLandlord(RegisterLandlordRequest request) {
        // 1. Check trùng SĐT
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new RuntimeException("Số điện thoại đã được đăng ký");
        }

        // 2 & 3. Tạo User entity
        User user = User.builder()
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.LANDLORD)
                .status(UserStatus.ACTIVE)
                .build();

        // Lưu lần 1 để có ID
        user = userRepository.save(user);

        // 4. Cập nhật landlord_id = id của chính user (Multi-tenant key)
        user.setLandlordId(user.getId());
        user = userRepository.save(user);

        // 5. Map sang DTO response
        return mapToUserResponse(user);
    }

    /**
     * Map User entity → UserResponse DTO.
     * Tái sử dụng cho cả AuthService và UserService.
     */
    public UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .email(user.getEmail())
                .role(user.getRole().name())
                .landlordId(user.getLandlordId())
                .status(user.getStatus().name())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
