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

import groovy.transform.CompileStatic
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.web.context.request.RequestContextHolder
import org.springframework.web.context.request.ServletRequestAttributes

@CompileStatic
class HttpServletUtil {

    private static Logger LOG = LoggerFactory.getLogger(HttpServletUtil.class)

    static HttpServletRequest getServletRequest() {
        HttpServletRequest httpServletRequest
        try {
            ServletRequestAttributes currentRequestAttributes = RequestContextHolder.getRequestAttributes() as ServletRequestAttributes
            httpServletRequest = currentRequestAttributes?.getRequest()
        } catch (Exception e) {
            LOG.warn("Unable to access current HttpServletRequest. Error Recieved [$e]", e)
        }
        return httpServletRequest
    }

    static HttpServletResponse getServletResponse() {
        HttpServletResponse httpServletResponse
        try {
            ServletRequestAttributes currentRequestAttributes = RequestContextHolder.getRequestAttributes() as ServletRequestAttributes
            httpServletResponse = currentRequestAttributes?.getResponse()
        } catch (Exception e) {
            LOG.warn("Unable to access current HttpServletResponse. Error Recieved [$e]", e)
        }
        return httpServletResponse
    }
}
