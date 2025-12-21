import type { AxiosInstance } from 'axios'

/**
 * Employee data structure matching the backend EmployeeDto
 */
export interface Employee {
  id: number
  employeeCode: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  department: string
  position: string
  hireDate: string // ISO date string
  salary: number
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE'
}

/**
 * Employee API service factory
 * Creates service functions that use the provided axios instance
 */
export const createEmployeeService = (apiClient: AxiosInstance) => ({
  /**
   * Get all employees
   * @returns Promise resolving to an array of employees
   */
  getAllEmployees: async (): Promise<Employee[]> => {
    const response = await apiClient.get<Employee[]>('/api/hrm/employees')
    return response.data
  },
})
