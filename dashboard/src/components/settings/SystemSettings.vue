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
  <div>
    <sub-page-header title="System Settings"/>

    <div class="card">
      <div class="card-header">System</div>
      <Form ref="observer" v-slot="{errors}" slim>
        <div class="card-body">
          <div class="form-group">
            <label class="label" for="resetTokenExpiration">* Token Expiration <InlineHelp target-id="resetTokenExpirationHelp" msg="How long password reset and email confirmation tokens remain valid before they expire"/></label>
            <Field rules="required|iso8601" name="Token Expiration" v-slot="{ field }" :debounce=500 v-model="resetTokenExpiration">
              <input class="form-control" type="text" name="resetTokenExpiration"
                     data-cy="resetTokenExpiration" aria-required="true"
                      id="resetTokenExpiration"
                     v-bind="field"
                      :aria-invalid="errors && errors.length > 0"
                      aria-errormessage="resetTokenExpirationError" aria-describedby="resetTokenExpirationError"/>
              <small class="text-info" id="resetTokenExpirationFormat">supports ISO 8601 time duration format, e.g., 2H, 30M, 1H30M, 1M42S, etc</small>
              <p role="alert" class="text-danger" v-show="errors[0]" data-cy="resetTokenExpirationError" id="resetTokenExpirationError">
                <ErrorMessage name="Token Expiration" />
              </p>
            </Field>
          </div>

          <div class="form-group">
            <label class="label" for="customHeader">Custom Header <InlineHelp target-id="customHeaderHelp" msg="HTML (and in-line css) to display as a header for the dashboard application"/></label>
            <Field rules="noscript|max:3000" name="Custom Header" v-slot="{ field }" v-model="customHeader">
              <textarea class="form-control" name="customHeader" data-cy="customHeader" rows="3"
                  id="customHeader" v-bind="field"
                  :aria-invalid="errors && errors.length > 0"
                  aria-errormessage="customHeaderError" aria-describedby="customHeaderError"/>
              <p role="alert" class="text-danger" v-show="errors[0]" data-cy="customHeaderError" id="customHeaderError">
                <ErrorMessage name="Custom Header" />
              </p>
            </Field>
          </div>

          <div class="form-group">
            <label class="label" for="customFooter">Custom Footer <InlineHelp target-id="customFooterHelp" msg="HTML (and in-line css) to display as a footer for the dashboard application"/></label>
            <Field rules="noscript|max:3000" name="Custom Footer" v-slot="{ field }" v-model="customFooter">
              <textarea class="form-control" name="customFooter" data-cy="customFooter" rows="3"
                        id="customFooter"
                        v-bind="field"
                        :aria-invalid="errors && errors.length > 0"
                        aria-errormessage="customFooterError" aria-describedby="customFooterError"/>
              <p role="alert" class="text-danger" v-show="errors[0]" data-cy="customFooterError" id="customFooterError">
                <ErrorMessage name="Custom Footer" />
              </p>
            </Field>
          </div>

          <div class="form-group">
            <Field rules="noscript" v-slot="{field}" name="User Agreement" v-model="userAgreement">
              <markdown-editor @input="updateUserAgreement"
                               label="User Agreement"
                               :allow-attachments="false"
                               :resizable="true"
                               v-bind="field"
                               aria-errormessage="userAgreementError"
                               aria-describedby="userAgreementError"
                               :aria-invalid="errors && errors.length > 0">
              </markdown-editor>
              <small role="alert" id="userAgreementError" class="form-text text-danger mb-3" data-cy="userAgreement">
                <ErrorMessage name="User Agreement" />
              </small>
            </Field>
          </div>

          <p v-if="invalid && overallErrMsg" class="text-center text-danger" role="alert">***{{ overallErrMsg }}***</p>
          <div>
            <button class="btn btn-outline-success" type="button" v-on:click="saveSystemSettings" :disabled="invalid"
                    data-cy="saveSystemSettings">
              Save
              <i :class="[isSaving ? 'fa fa-circle-notch fa-spin fa-3x-fa-fw' : 'fas fa-arrow-circle-right']"></i>
            </button>
          </div>
        </div>
      </Form>
    </div>

  </div>
</template>

<script>
  import { max, email } from '@vee-validate/rules';
  import { Form, Field, ErrorMessage, defineRule } from 'vee-validate';
  import MarkdownEditor from '@/common-components/utilities/MarkdownEditor';
  import SubPageHeader from '../utils/pages/SubPageHeader';
  import SettingsService from './SettingsService';
  import ToastSupport from '../utils/ToastSupport';
  import InlineHelp from '../utils/InlineHelp';

  defineRule('email', email);
  defineRule('max', max);

  export default {
    name: 'SystemSettings',
    mixins: [ToastSupport],
    components: {
      SubPageHeader,
      InlineHelp,
      MarkdownEditor,
      Form,
      Field,
      ErrorMessage,
    },
    data() {
      return {
        resetTokenExpiration: '2H',
        isSaving: false,
        overallErrMsg: '',
        customHeader: '',
        customFooter: '',
        userAgreement: '',
      };
    },
    mounted() {
      this.loadSystemSettings();
    },
    computed: {
      invalid() {
        return false;
      },
    },
    methods: {
      saveSystemSettings() {
        this.$refs.observer.validate().then((res) => {
          if (res) {
            this.isSaving = true;

            const {
              customHeader,
              customFooter,
              userAgreement,
            } = this;
            let { resetTokenExpiration } = this;
            if (!resetTokenExpiration.toLowerCase().startsWith('pt')) {
              resetTokenExpiration = `PT${resetTokenExpiration}`;
            }

            SettingsService.saveSystemSettings({
              resetTokenExpiration,
              customHeader,
              customFooter,
              userAgreement,
            }).then(() => {
              this.successToast('Saved', 'System Settings Successful!');
              this.$store.dispatch('loadConfigState');
            }).catch(() => {
              this.errorToast('Failure', 'Failed to Save System Settings!');
            }).finally(() => {
              this.isSaving = false;
            });
          } else {
            this.overallErrMsg = 'Whoops, something is wrong with the information you entered. Please try again.';
          }
        });
      },
      loadSystemSettings() {
        SettingsService.loadSystemSettings().then((resp) => {
          if (resp) {
            if (resp.resetTokenExpiration) {
              this.resetTokenExpiration = resp.resetTokenExpiration.replace('PT', '');
            }

            if (resp.customHeader) {
              this.customHeader = resp.customHeader;
            }
            if (resp.customFooter) {
              this.customFooter = resp.customFooter;
            }
            if (resp.userAgreement) {
              this.userAgreement = resp.userAgreement;
            }
          }
          this.$nextTick(() => {
            this.$refs.observer.validate();
          });
        });
      },
      updateUserAgreement(event) {
        this.userAgreement = event;
      },
    },
  };

  const timePeriodRegex = /^(PT)?(?=(?:0\.)?\d+[HMS])((?:0\.)?\d+H)?((?:0\.)?\d+M)?((?:0\.)?\d+S)?$/;
  defineRule('iso8601', (value, params, field) => {
    if (value) {
      return value.match(timePeriodRegex) !== null;
    }
    return 'Invalid ISO 8601 Time Duration';
  });

  const scriptRegex = /<[^>]*script/;
  defineRule('noscript', (value, params, field) => {
    if (value) {
      return value.match(scriptRegex) === null;
    }
    return '<script> tags are not allowed';
  });

</script>

<style scoped>

</style>
