package com.clt.erp.common.dto;

import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class SortDto {
	@Pattern(regexp = "^[A-Za-z0-9_]+$", message = "Invalid SortField")
	private String sortField;

	@Pattern(regexp = "ASC|DESC", message = "SortType must be ASC or DESC")
	private String sortType;
}
