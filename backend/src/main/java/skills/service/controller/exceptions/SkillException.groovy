package skills.service.controller.exceptions

import groovy.transform.CompileStatic

@CompileStatic
class SkillException extends RuntimeException{

    String projectId
    String skillId

    SkillException(String msg) {
        this(msg, "N/A", "N/A")
    }

    SkillException(String msg, String projectId) {
        this(msg, projectId, "N/A")
    }

    SkillException(String msg, String projectId, String skillId) {
        super(msg)
        this.projectId = projectId
        this.skillId = skillId
    }

    SkillException(String msg, Throwable var2, String projectId, String skillId) {
        super(msg, var2)
        this.projectId = projectId
        this.skillId = skillId
    }

    SkillException(Throwable msg, String projectId, String skillId) {
        super(msg)
        this.projectId = projectId
        this.skillId = skillId
    }

    SkillException(String msg, Throwable var2, boolean var3, boolean var4, String projectId, String skillId) {
        super(msg, var2, var3, var4)
        this.projectId = projectId
        this.skillId = skillId
    }
}
