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
import org.springframework.stereotype.Component
import org.springframework.util.StreamUtils
import software.amazon.awssdk.core.ResponseInputStream
import software.amazon.awssdk.core.SdkBytes
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.GetObjectResponse
import software.amazon.awssdk.services.secretsmanager.SecretsManagerClient
import software.amazon.awssdk.services.secretsmanager.model.GetSecretValueRequest
import software.amazon.awssdk.services.secretsmanager.model.GetSecretValueResponse

@Slf4j
@Component
@ConfigurationProperties("skills.aws")
class AWSSecretsManagerBeanPostProcessor implements BeanPostProcessor {

    @Autowired(required = false)
    SecretsManagerClient secretsManagerClient;

    @Autowired(required = false)
    S3Client s3Client

    // injected by @ConfigurationProperties
    List<String> downloadToFiles

    private boolean firstRun = true

    private static class SecretFile {
        String secretName
        File file
    }

    private static class S3File {
        String s3BucketName
        String s3FileName
        File file
    }

    private List<SecretFile> loadSecretFileFromProps() {
        downloadToFiles.findAll({ it.startsWith("secret:") }) collect {
            String[] split = it.substring(7).split("=>")
            String secretName = split[0]
            String fileLocation = split[1]

            if (!secretName || !fileLocation) {
                throw new IllegalArgumentException("File [skills.aws.downloadToFile] property must follow secret:<secret-name>=><file-location> format")
            }
            File fileDest = new File(fileLocation)
            if (fileDest.exists()) {
                throw new IllegalArgumentException("File [${fileDest.absolutePath}] already exists from [${it}] property")
            }
            return new SecretFile(secretName: secretName, file: fileDest)
        }
    }

    private List<S3File> loadS3FilesFromProps() {
        downloadToFiles.findAll({ it.startsWith("s3:") }) collect {
            String[] split = it.substring(3).split("=>")
            String s3Location = split[0]
            String fileLocation = split[1]

            String expectedFormat = "File [skills.aws.downloadToFile] property must follow s3:<bucket-name>/<file-name>=><file-location> format instead was"
            if (!s3Location || !fileLocation) {
                throw new IllegalArgumentException("${expectedFormat} [${it}]")
            }
            String[] s3LocSplit = s3Location.split("/")
            String s3BucketName = s3LocSplit[0]
            String s3FileName = s3LocSplit[1]
            if (!s3BucketName || !s3FileName) {
                throw new IllegalArgumentException("${expectedFormat} [${it}]")
            }
            File fileDest = new File(fileLocation)
            if (fileDest.exists()) {
                throw new IllegalArgumentException("File [${fileDest.absolutePath}] already exists from [${it}] property")
            }
            return new S3File(s3BucketName: s3BucketName, s3FileName: s3FileName, file: fileDest)
        }
    }

    @Override
    Object postProcessBeforeInitialization(Object bean, String beanName) {

        // Code to be executed after properties are loaded but before beans are initialized
        if (firstRun && downloadToFiles) {
            firstRun = false
            List<SecretFile> secretFiles = loadSecretFileFromProps()
            List<S3File> s3Files = loadS3FilesFromProps()

            secretFiles.each {
                log.info("Downloading secret [{}] to [{}]", it.secretName, it.file.absolutePath)
                GetSecretValueRequest request = GetSecretValueRequest.builder().secretId(it.secretName).build()
                GetSecretValueResponse secretValueResponse = secretsManagerClient.getSecretValue(request)
                SdkBytes sdkBytes = secretValueResponse.secretBinary()
                FileUtils.writeByteArrayToFile(it.file, sdkBytes.asByteArray())
            }

            s3Files.each {
                log.info("Downloading s3 file [{}] to [{}]", "${it.s3BucketName}/${it.s3FileName}", it.file.absolutePath)
                ResponseInputStream<GetObjectResponse> response = s3Client.getObject(
                        request -> request.bucket(it.s3BucketName).key(it.s3FileName));
                byte [] bytes = StreamUtils.copyToByteArray (response)
                FileUtils.writeByteArrayToFile(it.file, bytes)
            }
        }
        return bean
    }
}
