package com.library.controller;

import com.library.dto.AuditLogDto;
import com.library.dto.PageResponse;
import com.library.entity.AuditLog;
import com.library.repository.AuditLogRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/audit-logs")
@RequiredArgsConstructor
@Tag(name = "Audit Logs")
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping
    @Operation(summary = "List audit logs, optionally filtered by entityType")
    public PageResponse<AuditLogDto> list(@RequestParam(required = false) String entityType,
                                          @PageableDefault(size = 50) Pageable pageable) {
        Page<AuditLog> page = (entityType == null || entityType.isBlank())
                ? auditLogRepository.findAllByOrderByCreatedAtDesc(pageable)
                : auditLogRepository.findByEntityTypeOrderByCreatedAtDesc(entityType, pageable);
        return PageResponse.from(page, AuditLogDto::fromEntity);
    }
}
