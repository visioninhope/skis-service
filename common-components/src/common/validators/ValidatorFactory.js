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
import NumConvertUtil from './NumConvertUtil';

export default {
  newCharLengthValidator(maxLength) {
    return (value, params, field) => {
      if (value && value.length > NumConvertUtil.toInt(maxLength)) {
        return `${field.name} cannot exceed ${maxLength} characters.`;
      }
      return true;
    };
  },
  newCharMinLengthValidator(minLength) {
    return (value, params, field) => {
      if (value && value.length < NumConvertUtil.toInt(minLength)) {
        return `${field.name} cannot be less than ${minLength} characters.`;
      }
      return true;
    };
  },
  newMaxNumValidator(maxNum) {
    return (value, params, field) => {
      if (value && NumConvertUtil.toInt(value) > NumConvertUtil.toInt(maxNum)) {
        return `${field.name} cannot exceed ${maxNum}.`;
      }
      return true;
    };
  },
  newUserObjNoSpacesValidatorInNonPkiMode(isPkiMode) {
    return (value, params, field) => {
        if (isPkiMode || !value.userId) {
          return true;
        }
        const hasSpaces = value.userId.indexOf(' ') >= 0;
        return !hasSpaces;
        if (!hasSpaces) {
          return true;
        } else {
          return `${field.name} may not contain spaces`;
        }
    };
  },
};
