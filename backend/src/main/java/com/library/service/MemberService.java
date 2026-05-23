package com.library.service;

import com.library.dto.MemberDto;
import com.library.dto.MemberRequest;
import com.library.dto.PageResponse;
import com.library.entity.Member;
import com.library.enums.MemberStatus;
import com.library.exception.DuplicateResourceException;
import com.library.exception.ResourceNotFoundException;
import com.library.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public PageResponse<MemberDto> search(String query, Pageable pageable) {
        Page<Member> page = memberRepository.search(query, pageable);
        return PageResponse.from(page, MemberDto::fromEntity);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "members", key = "#id")
    public MemberDto getById(Long id) {
        return MemberDto.fromEntity(loadMember(id));
    }

    @Transactional
    @CacheEvict(value = "members", allEntries = true)
    public MemberDto create(MemberRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (memberRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("A member with email '" + email + "' already exists");
        }
        Member member = Member.builder()
                .name(request.getName().trim())
                .email(email)
                .phone(request.getPhone())
                .status(request.getStatus() == null ? MemberStatus.ACTIVE : request.getStatus())
                .build();
        Member saved = memberRepository.save(member);
        auditService.record("Member", saved.getId(), "CREATE", "Created member " + saved.getEmail());
        return MemberDto.fromEntity(saved);
    }

    @Transactional
    @CacheEvict(value = "members", key = "#id")
    public MemberDto update(Long id, MemberRequest request) {
        Member member = loadMember(id);
        String newEmail = request.getEmail().trim().toLowerCase();
        if (!member.getEmail().equalsIgnoreCase(newEmail)
                && memberRepository.existsByEmail(newEmail)) {
            throw new DuplicateResourceException("A member with email '" + newEmail + "' already exists");
        }
        member.setName(request.getName().trim());
        member.setEmail(newEmail);
        member.setPhone(request.getPhone());
        if (request.getStatus() != null) {
            member.setStatus(request.getStatus());
        }
        auditService.record("Member", member.getId(), "UPDATE", "Updated member " + member.getEmail());
        return MemberDto.fromEntity(member);
    }

    @Transactional
    @CacheEvict(value = "members", key = "#id")
    public MemberDto deactivate(Long id) {
        Member member = loadMember(id);
        member.setStatus(MemberStatus.INACTIVE);
        auditService.record("Member", member.getId(), "DEACTIVATE", "Deactivated " + member.getEmail());
        return MemberDto.fromEntity(member);
    }

    Member loadMember(Long id) {
        return memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with id " + id));
    }
}
