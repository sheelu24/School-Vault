package com.library.controller;

import com.library.dto.MemberDto;
import com.library.dto.MemberRequest;
import com.library.dto.PageResponse;
import com.library.service.MemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/v1/members")
@RequiredArgsConstructor
@Tag(name = "Members")
public class MemberController {

    private final MemberService memberService;

    @GetMapping
    @Operation(summary = "Search/list members with pagination")
    public PageResponse<MemberDto> list(@RequestParam(name = "q", required = false) String query,
                                        @PageableDefault(size = 20, sort = "name") Pageable pageable) {
        return memberService.search(query, pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get member by id")
    public MemberDto getById(@PathVariable Long id) {
        return memberService.getById(id);
    }

    @PostMapping
    @Operation(summary = "Add a new member")
    public ResponseEntity<MemberDto> create(@Valid @RequestBody MemberRequest request) {
        MemberDto created = memberService.create(request);
        return ResponseEntity.created(URI.create("/v1/members/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a member")
    public MemberDto update(@PathVariable Long id, @Valid @RequestBody MemberRequest request) {
        return memberService.update(id, request);
    }

    @PostMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate a member")
    public MemberDto deactivate(@PathVariable Long id) {
        return memberService.deactivate(id);
    }
}
