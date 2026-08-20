package com.rentmaster.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "service_meters", indexes = {
        @Index(name = "idx_meters_landlord", columnList = "landlord_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceMeter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "landlord_id", nullable = false)
    private User landlord;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(name = "record_month", nullable = false)
    private Integer recordMonth;

    @Column(name = "record_year", nullable = false)
    private Integer recordYear;

    @Column(name = "old_electric", nullable = false)
    private Integer oldElectric;

    @Column(name = "new_electric", nullable = false)
    private Integer newElectric;

    @Column(name = "old_water", nullable = false)
    private Integer oldWater;

    @Column(name = "new_water", nullable = false)
    private Integer newWater;

    @Column(name = "recorded_at", updatable = false)
    private LocalDateTime recordedAt;

    @PrePersist
    protected void onCreate() {
        this.recordedAt = LocalDateTime.now();
    }
}
