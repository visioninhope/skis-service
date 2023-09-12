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
package skills.aws

import groovy.util.logging.Slf4j
import org.apache.commons.io.FileUtils
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.config.BeanPostProcessor
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.core.env.ConfigurableEnvironment
import org.springframework.stereotype.Component
import software.amazon.awssdk.core.SdkBytes
import software.amazon.awssdk.services.secretsmanager.SecretsManagerClient
import software.amazon.awssdk.services.secretsmanager.model.GetSecretValueRequest
import software.amazon.awssdk.services.secretsmanager.model.GetSecretValueResponse

@Slf4j
@Component
@ConfigurationProperties("skills.aws.secrets-manager.binary")
class AWSSecretsManagerBeanPostProcessor implements BeanPostProcessor {

    SecretsManagerClient secretsManagerClient;

    // injected by @ConfigurationProperties
    List<String> downloadToFiles

    private static class SecretFile {
        String secretName
        File file
    }

    private List<SecretFile> loadSecretFileFromProps() {
        downloadToFiles.collect {
            String[] split = it.split("=>")
            String secretName = split[0]
            String fileLocation = split[1]

            if (!secretName || !fileLocation) {
                throw new IllegalArgumentException("File [skills.aws.secretsManager.binarySecret.downloadToFile] property must follow <secret-name>=><file-location> format")
            }
            File fileDest = new File(fileLocation)
            if (fileDest.exists()) {
                throw new IllegalArgumentException("File [${fileDest.absolutePath}] already exists from [${it}] property")
            }
            return new SecretFile(secretName: secretName, file: fileDest)
        }
    }

    @Override
    Object postProcessBeforeInitialization(Object bean, String beanName) {
        // Code to be executed after properties are loaded but before beans are initialized
        if (bean instanceof ConfigurableEnvironment && downloadToFiles) {
            loadSecretFileFromProps().each {
                log.info("Downloading secret [{}] to [{}]", it.secretName, it.file.absolutePath)
                GetSecretValueRequest request = GetSecretValueRequest.builder().secretId(it.secretName).build()
                GetSecretValueResponse secretValueResponse = secretsManagerClient.getSecretValue(request)
                SdkBytes sdkBytes = secretValueResponse.secretBinary()
                FileUtils.writeByteArrayToFile(it.file, sdkBytes.asByteArray())
            }
        }
        return bean
    }
}
