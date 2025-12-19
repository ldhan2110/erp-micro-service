package com.clt.erp.common.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ErrorResponseDto {
	String errorCode;
	String errorMessage;
	String systemMessage;
}
