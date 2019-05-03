package skills.service.auth.aop

import org.aspectj.lang.ProceedingJoinPoint
import org.aspectj.lang.annotation.Around
import org.aspectj.lang.annotation.Aspect
import org.aspectj.lang.reflect.CodeSignature
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.support.MessageSourceAccessor
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.core.SpringSecurityMessageSource
import org.springframework.stereotype.Component
import skills.service.auth.UserAuthService
import skills.service.auth.UserInfoService
import skills.service.auth.UserSkillsGrantedAuthority
import skills.storage.model.auth.RoleName

@Aspect
@Component
class AuthorizationAspect {

    static final String USER_ID_PARAM = 'userId'

    MessageSourceAccessor messages = SpringSecurityMessageSource.getAccessor()

    @Autowired
    UserAuthService userAuthService

    @Autowired
    UserInfoService userInfoService

    @Around(value='@within(AdminUsersOnlyWhenUserIdSupplied) || @annotation(AdminUsersOnlyWhenUserIdSupplied)')
    def authorizeAdmin(ProceedingJoinPoint joinPoint) {
        String userIdProvided = getUserIdParam(joinPoint)
        if (userIdProvided) {
            List<UserSkillsGrantedAuthority> authorities = userInfoService.currentUser?.authorities
            if (!authorities?.find { it.role.roleName == RoleName.ROLE_PROJECT_ADMIN }) {
                throw new AccessDeniedException(messages.getMessage(
                        "AbstractAccessDecisionManager.accessDenied", "Access is denied"))
            }
        }
        return joinPoint.proceed()
    }

    private String getUserIdParam(ProceedingJoinPoint joinPoint) {
        String userId
        CodeSignature codeSignature = joinPoint.getSignature()
        def parameterNames = codeSignature.parameterNames
        paramLoop: for (int i = 0; i < codeSignature.parameterNames.length; i++) {
            if (USER_ID_PARAM == parameterNames[i]) {
                userId = joinPoint.getArgs()[i]
                break paramLoop
            }
        }
        return  userId
    }
}
