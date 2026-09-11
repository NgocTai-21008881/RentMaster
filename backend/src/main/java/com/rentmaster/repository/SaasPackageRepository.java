package com.rentmaster.repository;

import com.rentmaster.entity.SaasPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SaasPackageRepository extends JpaRepository<SaasPackage, Long> {
}
