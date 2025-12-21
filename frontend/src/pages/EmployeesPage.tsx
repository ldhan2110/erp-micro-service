import { useQuery } from '@tanstack/react-query'
import { createEmployeeService, type Employee } from '../services/employeeService'
import { LogoutButton } from '../components/LogoutButton'
import { Link } from 'react-router-dom'
import { useApiClient } from '../contexts/ApiContext'

/**
 * EmployeesPage component that displays a list of employees
 * Uses React Query to fetch and manage employee data
 */
export function EmployeesPage() {
  // Get the authenticated axios instance from context
  const apiClient = useApiClient()
  const employeeService = createEmployeeService(apiClient)

  // Use React Query to fetch employees
  const {
    data: employees,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Employee[], Error>({
    queryKey: ['employees'],
    queryFn: employeeService.getAllEmployees,
  })

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  // Format salary for display
  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(salary)
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return { backgroundColor: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' }
      case 'INACTIVE':
        return { backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' }
      case 'ON_LEAVE':
        return { backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffeaa7' }
      default:
        return { backgroundColor: '#e2e3e5', color: '#383d41', border: '1px solid #d6d8db' }
    }
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid #dee2e6',
      }}>
        <div>
          <h1 style={{
            margin: 0,
            fontSize: '2rem',
            color: '#212529',
            fontWeight: 600,
          }}>
            Employee Management
          </h1>
          <p style={{
            margin: '0.5rem 0 0 0',
            color: '#6c757d',
            fontSize: '1rem',
          }}>
            View and manage employee information
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link
            to="/"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#6c757d',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontSize: '0.9rem',
            }}
          >
            Home
          </Link>
          <LogoutButton />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '4rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '1.2rem',
              color: '#495057',
              marginBottom: '0.5rem',
            }}>
              Loading employees...
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: '#6c757d',
            }}>
              Please wait while we fetch the data
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div style={{
          padding: '2rem',
          backgroundColor: '#f8d7da',
          borderRadius: '8px',
          border: '1px solid #f5c6cb',
          marginBottom: '2rem',
        }}>
          <h3 style={{
            marginTop: 0,
            color: '#721c24',
            fontSize: '1.25rem',
          }}>
            Error Loading Employees
          </h3>
          <p style={{
            color: '#721c24',
            marginBottom: '1rem',
          }}>
            {error?.message || 'An error occurred while fetching employees'}
          </p>
          <button
            onClick={() => refetch()}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Employees Table */}
      {!isLoading && !isError && employees && (
        <>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}>
            <div style={{
              fontSize: '1.1rem',
              color: '#495057',
            }}>
              Total Employees: <strong>{employees.length}</strong>
            </div>
            <button
              onClick={() => refetch()}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              Refresh
            </button>
          </div>

          {employees.length === 0 ? (
            <div style={{
              padding: '3rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #dee2e6',
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: '1.2rem',
                color: '#6c757d',
                marginBottom: '0.5rem',
              }}>
                No employees found
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: '#adb5bd',
              }}>
                There are no employees in the system yet.
              </div>
            </div>
          ) : (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px solid #dee2e6',
              overflow: 'hidden',
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                }}>
                  <thead>
                    <tr style={{
                      backgroundColor: '#f8f9fa',
                      borderBottom: '2px solid #dee2e6',
                    }}>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontWeight: 600,
                        color: '#495057',
                        fontSize: '0.9rem',
                        textTransform: 'uppercase',
                      }}>
                        Code
                      </th>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontWeight: 600,
                        color: '#495057',
                        fontSize: '0.9rem',
                        textTransform: 'uppercase',
                      }}>
                        Name
                      </th>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontWeight: 600,
                        color: '#495057',
                        fontSize: '0.9rem',
                        textTransform: 'uppercase',
                      }}>
                        Email
                      </th>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontWeight: 600,
                        color: '#495057',
                        fontSize: '0.9rem',
                        textTransform: 'uppercase',
                      }}>
                        Department
                      </th>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontWeight: 600,
                        color: '#495057',
                        fontSize: '0.9rem',
                        textTransform: 'uppercase',
                      }}>
                        Position
                      </th>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontWeight: 600,
                        color: '#495057',
                        fontSize: '0.9rem',
                        textTransform: 'uppercase',
                      }}>
                        Hire Date
                      </th>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontWeight: 600,
                        color: '#495057',
                        fontSize: '0.9rem',
                        textTransform: 'uppercase',
                      }}>
                        Salary
                      </th>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontWeight: 600,
                        color: '#495057',
                        fontSize: '0.9rem',
                        textTransform: 'uppercase',
                      }}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((employee, index) => (
                      <tr
                        key={employee.id}
                        style={{
                          borderBottom: index < employees.length - 1 ? '1px solid #dee2e6' : 'none',
                          transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f8f9fa'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white'
                        }}
                      >
                        <td style={{
                          padding: '1rem',
                          color: '#212529',
                          fontFamily: 'monospace',
                          fontSize: '0.9rem',
                        }}>
                          {employee.employeeCode}
                        </td>
                        <td style={{
                          padding: '1rem',
                          color: '#212529',
                          fontWeight: 500,
                        }}>
                          {employee.firstName} {employee.lastName}
                        </td>
                        <td style={{
                          padding: '1rem',
                          color: '#495057',
                        }}>
                          {employee.email}
                        </td>
                        <td style={{
                          padding: '1rem',
                          color: '#495057',
                        }}>
                          {employee.department || 'N/A'}
                        </td>
                        <td style={{
                          padding: '1rem',
                          color: '#495057',
                        }}>
                          {employee.position || 'N/A'}
                        </td>
                        <td style={{
                          padding: '1rem',
                          color: '#495057',
                        }}>
                          {employee.hireDate ? formatDate(employee.hireDate) : 'N/A'}
                        </td>
                        <td style={{
                          padding: '1rem',
                          color: '#212529',
                          fontWeight: 500,
                        }}>
                          {employee.salary ? formatSalary(employee.salary) : 'N/A'}
                        </td>
                        <td style={{
                          padding: '1rem',
                        }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            display: 'inline-block',
                            ...getStatusColor(employee.status),
                          }}>
                            {employee.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
