/**
 * Copyright 2020 SkillTree
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package skills.auth

import callStack.profiler.Profile
import groovy.util.logging.Slf4j
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.context.SecurityContext
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.context.SecurityContextRepository
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import skills.services.AccessSettingsStorageService
import skills.services.admin.ProjAdminService
import skills.services.inception.InceptionProjectService
import skills.storage.model.UserAttrs
import skills.storage.model.auth.RoleName
import skills.storage.model.auth.User
import skills.storage.model.auth.UserRole
import skills.storage.repos.UserRepo
import skills.storage.repos.UserRoleRepo

@Component
@Slf4j
class UserAuthService {

    private static Collection<GrantedAuthority> EMPTY_ROLES = new ArrayList<>()

    @Autowired
    UserRepo userRepository

    @Autowired
    UserInfoAndRoleService userInfoAndRoleService

    @Autowired
    UserRoleRepo userRoleRepo

    @Autowired
    AccessSettingsStorageService accessSettingsStorageService

    @Autowired
    InceptionProjectService inceptionProjectService

    @Autowired
    ProjAdminService projAdminService

    // injected by skills.auth.form.FormSecurityConfiguration.httpSessionSecurityContextRepository
    SecurityContextRepository securityContextRepository

    @Value('#{securityConfig.authMode}}')
    AuthMode authMode = AuthMode.DEFAULT_AUTH_MODE


    @Transactional(readOnly = true)
    Collection<GrantedAuthority> loadAuthorities(String userId) {
        List<UserRole> userRoles = userRoleRepo.findAllByUserId(userId?.toLowerCase())
        return userInfoAndRoleService.convertRoles(userRoles)
    }

    @Transactional(readOnly = true)
    @Profile
    UserInfo loadByUserId(String userId) {
        return userInfoAndRoleService.loadByUserId(userId)
    }

    private UserInfo createUserInfo(User user, UserAttrs userAttrs) {
        userInfoAndRoleService.createUserInfo(user, userAttrs)
    }

    @Transactional
    UserInfo createUser(UserInfo userInfo) {
        accessSettingsStorageService.createAppUser(userInfo, false)
        return loadByUserId(userInfo.username)
    }

    @Transactional
    @Profile
    UserInfo createOrUpdateUser(UserInfo userInfo, boolean refreshSecurityContext=true) {
        AccessSettingsStorageService.UserAndUserAttrsHolder userAndUserAttrs = accessSettingsStorageService.createAppUser(userInfo, true)
        UserInfo updatedUserInfo = createUserInfo(userAndUserAttrs.user, userAndUserAttrs.userAttrs)
        if (authMode == AuthMode.FORM && refreshSecurityContext) {
            SecurityContext securityContext = SecurityContextHolder.getContext()
            Authentication authentication = securityContext?.getAuthentication()
            if (authentication && authentication instanceof UsernamePasswordAuthenticationToken && authentication.getPrincipal() instanceof UserInfo) {
                Authentication updatedAuth = new UsernamePasswordAuthenticationToken(updatedUserInfo, authentication.getCredentials(), updatedUserInfo.getAuthorities())
                securityContext.setAuthentication(updatedAuth)
                securityContextRepository.saveContext(securityContext, HttpServletUtil.servletRequest, HttpServletUtil.servletResponse)
            }
        }
        return updatedUserInfo
    }

    List<String> getProjectsUserIsAdminFor(String userId) {
        return userRoleRepo.getProjectIdByUserIdAndRoleName(userId, RoleName.ROLE_PROJECT_ADMIN)
    }

    /**
     * Loads information for the specified user from the database but DOES NOT create a user
     * if no record already exists
     *
     * @param userInfo
     * @return
     */
    @Transactional(readOnly=true)
    @Profile
    UserInfo get(UserInfo userInfo) {
        AccessSettingsStorageService.UserAndUserAttrsHolder userAndUserAttrs = accessSettingsStorageService.get(userInfo)
        if (userAndUserAttrs) {
            return createUserInfo(userAndUserAttrs.user, userAndUserAttrs.userAttrs)
        }
        return null
    }

    @Transactional(readOnly = true)
    boolean rootExists() {
        return accessSettingsStorageService.rootAdminExists()
    }

    @Transactional
    void grantRoot(String userId) {
        accessSettingsStorageService.grantRoot(userId)

        // super user gets assigned to Inception project
        inceptionProjectService.createInceptionAndAssignUser(userId)

        projAdminService.pinAllExistingProjectsWhereUserIsAdminExceptInception(userId)
    }

    @Transactional(readOnly = true)
    boolean userExists(String userId) {
        return userRepository.existsByUserIdIgnoreCase(userId)
    }
}
