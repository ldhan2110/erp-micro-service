package com.clt.erp.hrm.service;

import com.clt.erp.hrm.dto.EmployeeDto;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Service for managing employee data.
 * Currently returns sample data for demonstration purposes.
 */
@Service
public class EmployeeService {

    /**
     * Retrieves a list of all employees.
     * 
     * @return List of employee DTOs
     */
    public List<EmployeeDto> getAllEmployees() {
        List<EmployeeDto> employees = new ArrayList<>();
        
        employees.add(new EmployeeDto(
            1L,
            "EMP001",
            "John",
            "Doe",
            "john.doe@company.com",
            "+1-555-0101",
            "Engineering",
            "Senior Software Engineer",
            LocalDate.of(2020, 3, 15),
            new BigDecimal("95000.00"),
            "ACTIVE"
        ));
        
        employees.add(new EmployeeDto(
            2L,
            "EMP002",
            "Jane",
            "Smith",
            "jane.smith@company.com",
            "+1-555-0102",
            "Marketing",
            "Marketing Manager",
            LocalDate.of(2019, 6, 20),
            new BigDecimal("85000.00"),
            "ACTIVE"
        ));
        
        employees.add(new EmployeeDto(
            3L,
            "EMP003",
            "Michael",
            "Johnson",
            "michael.johnson@company.com",
            "+1-555-0103",
            "Sales",
            "Sales Representative",
            LocalDate.of(2021, 1, 10),
            new BigDecimal("65000.00"),
            "ACTIVE"
        ));
        
        employees.add(new EmployeeDto(
            4L,
            "EMP004",
            "Emily",
            "Williams",
            "emily.williams@company.com",
            "+1-555-0104",
            "Human Resources",
            "HR Specialist",
            LocalDate.of(2018, 9, 5),
            new BigDecimal("70000.00"),
            "ACTIVE"
        ));
        
        employees.add(new EmployeeDto(
            5L,
            "EMP005",
            "David",
            "Brown",
            "david.brown@company.com",
            "+1-555-0105",
            "Finance",
            "Financial Analyst",
            LocalDate.of(2022, 2, 28),
            new BigDecimal("72000.00"),
            "ACTIVE"
        ));
        
        employees.add(new EmployeeDto(
            6L,
            "EMP006",
            "Sarah",
            "Davis",
            "sarah.davis@company.com",
            "+1-555-0106",
            "Engineering",
            "Software Engineer",
            LocalDate.of(2021, 8, 12),
            new BigDecimal("80000.00"),
            "ACTIVE"
        ));
        
        employees.add(new EmployeeDto(
            7L,
            "EMP007",
            "Robert",
            "Miller",
            "robert.miller@company.com",
            "+1-555-0107",
            "Operations",
            "Operations Manager",
            LocalDate.of(2017, 11, 30),
            new BigDecimal("90000.00"),
            "ACTIVE"
        ));
        
        employees.add(new EmployeeDto(
            8L,
            "EMP008",
            "Lisa",
            "Wilson",
            "lisa.wilson@company.com",
            "+1-555-0108",
            "Engineering",
            "DevOps Engineer",
            LocalDate.of(2020, 4, 22),
            new BigDecimal("88000.00"),
            "ACTIVE"
        ));
        
        employees.add(new EmployeeDto(
            9L,
            "EMP009",
            "James",
            "Moore",
            "james.moore@company.com",
            "+1-555-0109",
            "Sales",
            "Sales Manager",
            LocalDate.of(2019, 2, 14),
            new BigDecimal("92000.00"),
            "ACTIVE"
        ));
        
        employees.add(new EmployeeDto(
            10L,
            "EMP010",
            "Patricia",
            "Taylor",
            "patricia.taylor@company.com",
            "+1-555-0110",
            "Marketing",
            "Content Writer",
            LocalDate.of(2023, 1, 5),
            new BigDecimal("60000.00"),
            "ACTIVE"
        ));
        
        return employees;
    }
}
