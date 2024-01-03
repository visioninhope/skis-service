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
import { defineRule } from 'vee-validate';

const numericRegex = /^\w+$/;

const validator = (value, params, field) => {
    const testValue = (val) => {
      const strValue = String(val);

      if (strValue) {
        return numericRegex.test(strValue);
      }
      return true;
    };

    let isValid = false;
    if (Array.isArray(value)) {
      isValid = value.every(testValue);
    } else {
      isValid = testValue(value);
    }

    if (isValid) {
      return isValid;
    } else {
      return `${field.name} may only contain alpha-numeric characters`;
    }
};

defineRule('id_validator', validator);

export default validator;
