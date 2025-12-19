package com.clt.erp.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class LoginRequestDto {
	@NotBlank(message = "Username is required")
	String username;
	
	@NotBlank(message = "Password is required")
	String password;
}
