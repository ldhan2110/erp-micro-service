# LBS - Common Library

This is a common library project for shared DTOs and utilities used across the ERP project.

## Project Information

- **Group**: `com.clt.erp`
- **Artifact**: `lbs`
- **Version**: `0.0.1-SNAPSHOT`
- **Java Version**: 21
- **Build Tool**: Gradle

## Features

- ✅ Lombok support for reducing boilerplate code
- ✅ Jackson annotations for JSON serialization
- ✅ Jakarta Validation API support
- ✅ Common DTO base classes
- ✅ Standard API response wrapper

## Building the Project

To build the JAR file:

```bash
./gradlew build
```

The JAR file will be generated in `build/libs/lbs-0.0.1-SNAPSHOT.jar`

## Using in Other Projects

### Option 1: Local File Dependency (Development)

Add the following to your `build.gradle`:

```gradle
dependencies {
    implementation files('../common-libs/lbs/build/libs/lbs-0.0.1-SNAPSHOT.jar')
    // Or use project dependency if in a multi-project setup:
    // implementation project(':lbs')
}
```

### Option 2: Publish to Local Maven Repository

1. Publish the library to your local Maven repository:
   ```bash
   ./gradlew publishToMavenLocal
   ```

2. Add to your `build.gradle`:
   ```gradle
   repositories {
       mavenLocal()
   }
   
   dependencies {
       implementation 'com.clt.erp:lbs:0.0.1-SNAPSHOT'
   }
   ```

### Option 3: Multi-Project Setup

If you want to use this as a subproject in a multi-project Gradle build:

1. Add to your root `settings.gradle`:
   ```gradle
   include 'common-libs:lbs'
   ```

2. Add to your project's `build.gradle`:
   ```gradle
   dependencies {
       implementation project(':common-libs:lbs')
   }
   ```

## Project Structure

```
lbs/
├── src/
│   ├── main/
│   │   └── java/
│   │       └── com/
│   │           └── clt/
│   │               └── erp/
│   │                   └── lbs/
│   │                       └── dto/
│   │                           ├── BaseDto.java
│   │                           └── ApiResponse.java
│   └── test/
│       └── java/
│           └── com/
│               └── clt/
│                   └── erp/
│                       └── lbs/
│                           └── dto/
│                               ├── BaseDtoTest.java
│                               └── ApiResponseTest.java
├── build.gradle
├── settings.gradle
└── README.md
```

## Example Usage

### Using BaseDto

```java
package com.clt.erp.yourproject.dto;

import com.clt.erp.lbs.dto.BaseDto;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class UserDto extends BaseDto {
    private String username;
    private String email;
}
```

### Using ApiResponse

```java
import com.clt.erp.lbs.dto.ApiResponse;

// Success response
ApiResponse<UserDto> response = ApiResponse.success(userDto);
ApiResponse<UserDto> response = ApiResponse.success("User created successfully", userDto);

// Error response
ApiResponse<Void> errorResponse = ApiResponse.error("User not found");
```

## Dependencies

- **Lombok**: 1.18.34 - For reducing boilerplate code
- **Jackson Annotations**: 2.18.2 - For JSON serialization
- **Jakarta Validation API**: 3.1.0 - For validation annotations

## Notes

- This is a library project (not a Spring Boot application)
- All classes are designed to be serializable
- Lombok annotations are used throughout for cleaner code
