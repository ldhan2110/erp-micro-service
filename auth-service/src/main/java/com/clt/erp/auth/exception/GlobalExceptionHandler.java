package com.clt.erp.auth.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.security.core.AuthenticationException;

import com.clt.erp.common.dto.ErrorResponseDto;
import com.clt.erp.common.exception.BizException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(AuthenticationException.class)
	@ResponseStatus(value = HttpStatus.FORBIDDEN)
	public ErrorResponseDto AuthenticationException(Exception ex, WebRequest request) {
		log.error("[ERROR]" + "[" + request.getClass().getName() + "]:" + ex.getMessage());
		return new ErrorResponseDto("UNAUTHORIZED", ex.getMessage(), ex.getMessage());
	}

	@ExceptionHandler(BizException.class)
	@ResponseStatus(value = HttpStatus.FORBIDDEN)
	public ErrorResponseDto BizException(Exception ex, WebRequest request) {
		log.error("[ERROR]" + "[" + request.getClass().getName() + "]:" + ex.getMessage());
		return new ErrorResponseDto("UNAUTHORIZED", ex.getMessage(), ex.getMessage());
	}

	@ExceptionHandler(Exception.class)
	@ResponseStatus(value = HttpStatus.INTERNAL_SERVER_ERROR)
	public ErrorResponseDto GlobalException(Exception ex, WebRequest request) {
		log.error("[ERROR]" + "[" + request.getClass().getName() + "]:" + ex.getMessage());
		return new ErrorResponseDto("SYSMESSAGE", "Something went wrong.", ex.getMessage());
	}
}

