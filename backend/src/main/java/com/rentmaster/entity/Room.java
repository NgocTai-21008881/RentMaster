package com.rentmaster.entity;

import com.rentmaster.entity.enums.RoomStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "rooms", indexes = {
        @Index(name = "idx_rooms_landlord", columnList = "landlord_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "landlord_id", nullable = false)
    private User landlord;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(name = "room_number", nullable = false, length = 50)
    private String roomNumber;

    @Column(name = "floor", nullable = false)
    private Integer floor;

    @Column(name = "base_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal basePrice;

    @Column(name = "area", precision = 6, scale = 2)
    private BigDecimal area;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private RoomStatus status = RoomStatus.AVAILABLE;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
