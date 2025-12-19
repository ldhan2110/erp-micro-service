package com.clt.erp.auth.mapper;

import org.apache.ibatis.annotations.Mapper;
import com.clt.erp.auth.model.UserInfo;

@Mapper
public interface AuthMapper {
	UserInfo loadUserByUsername(String username);
	String isActiveCompany(String companyId);
	String isActiveUser(String username);
}
