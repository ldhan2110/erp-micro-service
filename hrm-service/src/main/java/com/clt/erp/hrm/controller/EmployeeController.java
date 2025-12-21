package com.clt.erp.hrm.controller;

import com.clt.erp.hrm.dto.EmployeeDto;
import com.clt.erp.hrm.service.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for Employee management endpoints.
 * All endpoints require OAuth2 authentication via JWT token.
 * User information is automatically logged by UserLoggingFilter for all requests.
 */
@RestController
@RequestMapping("/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    /**
     * Retrieves a list of all employees.
     * Requires valid JWT token from auth-service.
     * User information is automatically logged by UserLoggingFilter.
     * 
     * @return ResponseEntity containing list of employees
     */
    @GetMapping
    public ResponseEntity<List<EmployeeDto>> getAllEmployees() {
        List<EmployeeDto> employees = employeeService.getAllEmployees();
        return ResponseEntity.ok(employees);
    }
}
