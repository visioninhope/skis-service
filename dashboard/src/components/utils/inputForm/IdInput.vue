/*
Copyright 2020 SkillTree

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
<template>
  <div class="form-group mt-0 mb-0">
    <div class="row">
      <div class="col">
        <label for="idInput">* {{ label }}</label>
      </div>
      <div class="col text-right" data-cy="idInputEnableControl">
        <b-form-checkbox v-model="canEdit"
                         class="d-inline-block mr-1"
                         name="Enable Id"
                         aria-label="Enable to edit identifier's value"
                         :disabled="canEdit"
                         data-cy="enableIdInput"
                         @change="notifyAboutEditStateChange"
                         switch>
          Enable
        </b-form-checkbox>
        <i class="fas fa-question-circle mr-1 text-secondary"
           id="idInputHelp"
           aria-label="Enable ID input to override auto-generated value."
           role="alert"
           tabindex="0"
           @keydown.esc="handleEscape"/>

        <b-tooltip target="idInputHelp"
                   title="Enable to override auto-generated value."
                   placement="left"
                   @shown="tooltipShown"
                   @hidden="tooltipHidden"/>
      </div>
    </div>
    <Field :rules="rules" v-slot="{ field }" :debounce="500" :name="label" ref="idVp">
      <input type="text" class="form-control" id="idInput" v-model="internalValue" :disabled="!canEdit"
              @input="dataChanged" aria-required="true"
              aria-errormessage="idError"
              aria-describedby="idError"
             data-cy="idInputValue">
    <!--              :aria-invalid="errors && errors.length > 0"-->
      <small role="alert" class="form-text text-danger" data-cy="idError" id="idError">
        <ErrorMessage :name="label" />
      </small>
    </Field>
  </div>
</template>

<script>
  import { Field, ErrorMessage, defineRule } from 'vee-validate';
  // eslint-disable-next-line camelcase
  import { alpha_num } from '@vee-validate/rules';
  import debounce from 'lodash.debounce';

  defineRule('alpha_num', alpha_num);

  export default {
    name: 'IdInput',
    components: {
      Field,
      ErrorMessage,
    },
    props: {
      label: String,
      value: String,
      isSkillId: {
        type: Boolean,
        default: false,
      },
      additionalValidationRules: [String],
      nextFocusEl: HTMLElement,
    },
    data() {
      return {
        rules: `required|minIdLength|maxIdLength|nullValueNotAllowed|${this.isSkillId ? 'skill_id_validator' : 'id_validator'}`,
        canEdit: false,
        internalValue: this.value,
      };
    },
    mounted() {
      if (this.additionalValidationRules) {
        this.rules = `${this.rules}|${this.additionalValidationRules}`;
      }
    },
    methods: {
      notifyAboutEditStateChange(newValue) {
        this.$emit('can-edit', newValue);
      },
      dataChanged() {
        this.$emit('input', this.internalValue);
      },
      tooltipShown(e) {
        this.$emit('shown', e);
      },
      tooltipHidden(e) {
        this.$emit('hidden', e);
      },
      handleEscape() {
        document.activeElement.blur();
        this.nextFocusEl?.focus();
      },
      // validateOnChange: debounce(function validate(val) {
      //   if (this.$refs.idVp) {
      //     this.$refs.idVp.syncValue(val);
      //     this.$refs.idVp.validate().then((validationResult) => {
      //       if (this.$refs.idVp) {
      //         this.$refs.idVp.applyResult(validationResult);
      //       }
      //     });
      //   }
      // }, 200),
    },
    watch: {
      value(newVal) {
        this.internalValue = newVal;
      },
      internalValue(newVal) {
        // this.validateOnChange(newVal);
      },
    },
  };
</script>

<style scoped>

</style>
