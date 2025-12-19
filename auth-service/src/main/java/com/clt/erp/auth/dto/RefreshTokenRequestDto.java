package com.clt.erp.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class RefreshTokenRequestDto {
	@NotBlank(message = "Refresh token is required")
	String refreshToken;
}
