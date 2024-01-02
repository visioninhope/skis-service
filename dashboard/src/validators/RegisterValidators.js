/*
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
import { defineRule, configure } from 'vee-validate';
import { required, email } from '@vee-validate/rules';
import { localize } from '@vee-validate/i18n';
import ValidatorFactory from '@/common-components/validators/ValidatorFactory';
// import '@/common-components/validators/CustomDescriptionValidator';
// import './OptionalNumericValidator';
// import './CustomNameValidator';
// import './IdValidator';
// import './SkillIdValidator';
// import './NotNullValidator';
// import './UrlValidator';
import store from '../store/store';

export default {
  init() {
    defineRule('maxDescriptionLength', ValidatorFactory.newCharLengthValidator(store.getters.config.descriptionMaxLength) );
    defineRule('maxFirstNameLength', ValidatorFactory.newCharLengthValidator(store.getters.config.maxFirstNameLength));
    defineRule('maxLastNameLength', ValidatorFactory.newCharLengthValidator(store.getters.config.maxLastNameLength));
    defineRule('maxNicknameLength', ValidatorFactory.newCharLengthValidator(store.getters.config.maxNicknameLength));

    defineRule('minUsernameLength', ValidatorFactory.newCharMinLengthValidator(store.getters.config.minUsernameLength));

    defineRule('minPasswordLength', ValidatorFactory.newCharMinLengthValidator(store.getters.config.minPasswordLength));
    defineRule('maxPasswordLength', ValidatorFactory.newCharLengthValidator(store.getters.config.maxPasswordLength));

    defineRule('minIdLength', ValidatorFactory.newCharMinLengthValidator(store.getters.config.minIdLength));
    defineRule('maxIdLength', ValidatorFactory.newCharLengthValidator(store.getters.config.maxIdLength));

    defineRule('minNameLength', ValidatorFactory.newCharMinLengthValidator(store.getters.config.minNameLength));

    defineRule('maxBadgeNameLength', ValidatorFactory.newCharLengthValidator(store.getters.config.maxBadgeNameLength));
    defineRule('maxProjectNameLength', ValidatorFactory.newCharLengthValidator(store.getters.config.maxProjectNameLength));
    defineRule('maxQuizNameLength', ValidatorFactory.newCharLengthValidator(store.getters.config.maxQuizNameLength));
    defineRule('maxSkillNameLength', ValidatorFactory.newCharLengthValidator(store.getters.config.maxSkillNameLength));
    defineRule('maxSubjectNameLength', ValidatorFactory.newCharLengthValidator(store.getters.config.maxSubjectNameLength));
    defineRule('maxLevelNameLength', ValidatorFactory.newCharLengthValidator(store.getters.config.maxLevelNameLength));

    defineRule('maxSkillVersion', ValidatorFactory.newMaxNumValidator(store.getters.config.maxSkillVersion));
    defineRule('maxPointIncrement', ValidatorFactory.newMaxNumValidator(store.getters.config.maxPointIncrement));
    defineRule('maxNumPerformToCompletion', ValidatorFactory.newMaxNumValidator(store.getters.config.maxNumPerformToCompletion));
    defineRule('maxNumPointIncrementMaxOccurrences', ValidatorFactory.newMaxNumValidator(store.getters.config.maxNumPointIncrementMaxOccurrences));

    // defineRule('userNoSpaceInUserIdInNonPkiMode', ValidatorFactory.newUserObjNoSpacesValidatorInNonPkiMode(store.getters.isPkiAuthenticated));

    defineRule('required', required);
    defineRule('email', email);
    defineRule('maxSelfReportRejectionMessageLength', ValidatorFactory.newCharLengthValidator(store.getters.config.maxSelfReportRejectionMessageLength));

    defineRule('maxTagValueLengthInApprovalWorkloadConfig', ValidatorFactory.newCharLengthValidator(store.getters.config.maxTagValueLengthInApprovalWorkloadConfig));

    defineRule('maxCustomLabelLength', ValidatorFactory.newCharLengthValidator(store.getters.config.maxCustomLabelLength));
    defineRule('maxSkillTagLength', ValidatorFactory.newCharLengthValidator(store.getters.config.maxSkillTagLength));

    defineRule('maxVideoCaptionsLength', ValidatorFactory.newCharLengthValidator(store.getters.config.maxVideoCaptionsLength));
    defineRule('maxVideoTranscriptLength', ValidatorFactory.newCharLengthValidator(store.getters.config.maxVideoTranscriptLength));

    configure({
      generateMessage: localize({
        en: {
          messages: {
            alpha: '{field} may only contain alphabetic characters',
            alpha_num: '{field} may only contain alpha-numeric characters',
            alpha_dash: '{field} may contain alpha-numeric characters as well as dashes and underscores',
            alpha_spaces: '{field} may only contain alphabetic characters as well as spaces',
            between: '{field} must be between {min} and {max}',
            confirmed: '{field} confirmation does not match',
            digits: '{field} must be numeric and exactly contain {length} digits',
            dimensions: '{field} must be {width} pixels by {height} pixels',
            email: '{field} must be a valid email',
            excluded: '{field} is not a valid value',
            ext: '{field} is not a valid file',
            image: '{field} must be an image',
            integer: '{field} must be an integer',
            length: '{field} must be {length} long',
            max_value: '{field} must be {max} or less',
            max: '{field} may not be greater than {length} characters',
            mimes: '{field} must have a valid file type',
            min_value: '{field} must be {min} or more',
            min: '{field} must be at least {length} characters',
            numeric: '{field} may only contain numeric characters',
            oneOf: '{field} is not a valid value',
            regex: '{field} format is invalid',
            required_if: '{field} is required',
            required: '{field} is required',
            size: '{field} size must be less than {size}KB',
          },
        },
      })
    });
  },
};
