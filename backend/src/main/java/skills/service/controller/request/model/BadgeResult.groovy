package skills.service.controller.request.model

import com.fasterxml.jackson.annotation.JsonFormat
import groovy.transform.Canonical

@Canonical
class BadgeResult {

    Integer id

    String badgeId

    String projectId

    String name

    int totalPoints

    String description

    int numSkills
    int numUsers
    int pointsPercentage

    int displayOrder

    String iconClass

    @JsonFormat(pattern = "MM-dd-yyyy")
    Date startDate
    @JsonFormat(pattern = "MM-dd-yyyy")
    Date endDate

    List<SkillDefRes> requiredSkills = []
}
