package com.clt.erp.auth.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.clt.erp.auth.mapper.AuthMapper;
import com.clt.erp.auth.model.UserInfo;
import com.clt.erp.common.exception.BizException;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class AuthService implements UserDetailsService {
	@Autowired
	private AuthMapper authMapper;
	
	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        String companyId = username.split("::")[0];
		UserInfo userInfo = authMapper.loadUserByUsername(username);
		if (userInfo == null) {
			throw new UsernameNotFoundException("User not found");
		}
        if (authMapper.isActiveCompany(companyId) == null) {
			throw new BizException("INACTIVE_COMPANY", null, "Company is not active");
		}
		if (authMapper.isActiveUser(username) == null) {
			throw new BizException("INACTIVE_USER", null, "User is not active");
		}
		return userInfo;
	}	
}
