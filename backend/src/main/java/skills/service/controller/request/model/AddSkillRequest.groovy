package skills.service.controller.request.model

import groovy.transform.Canonical

@Canonical
class AddSkillRequest {
    String userId
    Long timestamp
}
