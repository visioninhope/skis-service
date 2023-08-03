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
package skills.auth.inviteOnly

import groovy.transform.CompileStatic
import groovy.util.logging.Slf4j
import org.apache.commons.lang3.StringUtils
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import skills.controller.exceptions.SkillsValidator
import skills.services.settings.Settings
import skills.services.settings.SettingsDataAccessor

@CompileStatic
@Slf4j
@Component
class IsInviteOnlyAccessor {

    @Autowired
    SettingsDataAccessor settingsDataAccessor

    @Transactional(readOnly = true)
    boolean isInviteOnlyProject(String projectId) {
        SkillsValidator.isNotNull(projectId, "projectId")
        if (StringUtils.EMPTY == projectId) {
            return false
        }

        return settingsDataAccessor.getProjectSetting(projectId, Settings.INVITE_ONLY_PROJECT.settingName)?.isEnabled()
    }
}
