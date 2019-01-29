package skills.service.controller

import groovy.transform.CompileStatic
import groovy.util.logging.Slf4j
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.web.bind.annotation.*
import skills.service.auth.UserInfoService
import skills.service.controller.exceptions.SkillException
import skills.service.controller.request.model.AddSkillRequest
import skills.service.datastore.services.UserAdminService
import skills.service.skillsManagement.SkillsManagementFacade

@RestController
@RequestMapping("/server")
@Slf4j
@CompileStatic
class ServerSkillsController {

    static Logger LOG = LoggerFactory.getLogger(ServerSkillsController)

    @Autowired
    SkillsManagementFacade skillsManagementFacade

    @Autowired
    UserInfoService userInfoService

    @Autowired
    UserAdminService userAdminService

    @Autowired
    UserDetailsService userDetailsService

    @RequestMapping(value = "/projects/{projectId}/skills/{skillId}", method = RequestMethod.POST, produces = "application/json")
    @ResponseBody
    def addSkill(
            @PathVariable("projectId") String projectId,
            @PathVariable("skillId") String skillId,
            @RequestBody AddSkillRequest skillRequest) {
        try {
            assert skillRequest?.userId
            Date incomingDate = skillRequest.timestamp != null ? new Date(skillRequest.timestamp) : null

            return skillsManagementFacade.addSkill(projectId, skillId, lookupUserId(skillRequest.userId), incomingDate)
        } catch (Exception e) {
            LOG.error("Failed for projetId=[$projectId], skillId=[$skillId]", e)
            throw new SkillException(e.message, projectId, skillId)
        }
    }

    private String lookupUserId(String userId) {
        String retVal
        if (userId) {
            if (userAdminService.isValidExistingUserId(userId)) {
                retVal = userId
            } else {
                // TODO - fix me, check if PKI authMode, and if so lookup user,
                // otherwise just add the skill for the passed in userId
                throw new RuntimeException("Unknown user")
                retVal = userDetailsService.loadUserByUsername(userId).username
            }
        } else {
            retVal = userInfoService.getCurrentUser().username
        }
        return retVal
    }
}
