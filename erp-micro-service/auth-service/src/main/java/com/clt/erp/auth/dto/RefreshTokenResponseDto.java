package com.clt.erp.auth.dto;

import lombok.Data;

@Data
public class RefreshTokenResponseDto {
	String accessToken;
	int accessExpireIn;
	String refreshToken;
	long refreshExpireIn;
}
