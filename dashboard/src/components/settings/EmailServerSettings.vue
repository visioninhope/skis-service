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
  <Form ref="observer" v-slot="{errors}" slim>
    <div>
          <div class="form-group">
            <label class="label" for="publicUrl">* Public URL <InlineHelp target-id="publicUrlHelp" msg="Because it is possible for the SkillTree dashboard
            to be deployed behind a load balancer or proxy, it is necessary to configure the public url so that email
            based communications from the system can provide valid links back to the SkillTree dashboard."/></label>
            <Field rules="required" name="Public URL" v-slot="{ field }" :debounce=500 v-model="emailInfo.publicUrl">
              <input class="form-control" type="text" name="publicUrl"
                     data-cy="publicUrlInput" aria-required="true"
                    id="publicUrl"
                     v-bind="field"
                    :aria-invalid="errors && Object.keys(errors).length > 0"
                    aria-errormessage="publicUrlError" aria-describedby="publicUrlError"/>
              <p role="alert" class="text-danger" v-show="errors[0]" id="publicUrlError" data-cy="publicUrlError">
                <ErrorMessage name="Public URL" />
              </p>
            </Field>
          </div>
          <div class="form-group">
            <label class="label" for="fromEmail">* From Email <InlineHelp target-id="fromEmailHelp" msg="The From email address used in all email originating from the SkillTree application"/></label>
            <Field :rules="{email:{require_tld:false,allow_ip_domain:true}}" name="From Email" v-slot="{ field }" :debounce=500 v-model="emailInfo.fromEmail">
              <input class="form-control" type="text" name="fromEmail"
                     data-cy="fromEmailInput" id="fromEmail"
                     v-bind="field"
                    :aria-invalid="errors && Object.keys(errors).length  > 0"
                    aria-errormessage="fromEmailError" aria-describedby="fromEmailError"/>
              <p role="alert" class="text-danger" v-show="errors[0]" data-cy="fromEmailError" id="fromEmailError">
                <ErrorMessage name="From Email" />
              </p>
            </Field>
          </div>
      <div class="form-group">
        <label class="label" for="emailHost">* Host</label>
        <Field name="Host" :debounce=500 v-slot="{field}" rules="required" v-model="emailInfo.host">
          <input class="form-control" type="text" name="host"
                 data-cy="hostInput" aria-required="true"
                 v-bind="field"
                  :aria-invalid="errors && Object.keys(errors).length > 0"
                  aria-errormessage="hostError" aria-describedby="hostError"
                  id="emailHost"/>
          <p role="alert" class="text-danger" v-show="errors[0]" data-cy="hostError" id="hostError">
            <ErrorMessage name="Host" />
          </p>
        </Field>
      </div>
      <div class="form-group">
        <label class="label" for="emailPort">* Port</label>
        <Field name="Port" :debounce=500 v-slot="{field}" v-model="emailInfo.port" rules="required|min_value:1|max_value:65535">
          <input class="form-control" type="text" name="port"
                 data-cy="portInput" aria-required="true"
                 v-bind="field"
                  :aria-invalid="errors && Object.keys(errors).length > 0"
                  aria-errormessage="portError" aria-describedby="portError"
                  id="emailPort"/>
          <p role="alert" class="text-danger" v-show="errors[0]" data-cy="portError" id="portError">
            <ErrorMessage name="Port" />
          </p>
        </Field>
      </div>
      <div class="form-group">
        <label class="label" for="emailProtocol">* Protocol</label>
        <Field name="Protocol" :debounce=500 v-slot="{field}" rules="required" v-model="emailInfo.protocol">
          <input class="form-control" type="text" name="protocol"
                 data-cy="protocolInput" aria-required="true"
                 v-bind="field"
                  :aria-invalid="errors && Object.keys(errors).length > 0"
                  aria-errormessage="protocolError" aria-describedby="protocolError"
                  id="emailProtocol"/>
          <p role="alert" class="text-danger" v-show="errors[0]" data-cy="protocolError" id="protocolError">
            <ErrorMessage name="Protocol" />
          </p>
        </Field>
      </div>
      <div class="form-group">
        <b-form-checkbox v-model="emailInfo.tlsEnabled" switch data-cy="tlsSwitch">
          {{ emailInfo.tlsEnabled ? 'TLS Enabled' : 'TLS Disabled' }}
        </b-form-checkbox>
      </div>
      <div class="form-group">
        <b-form-checkbox v-model="emailInfo.authEnabled" switch data-cy="authSwitch">
          {{ emailInfo.authEnabled ? 'Authentication Enabled' : 'Authentication Disabled' }}
        </b-form-checkbox>
      </div>
      <div id="auth-div" v-if="emailInfo.authEnabled">
        <div class="form-group">
          <label class="label" for="emailUsername">* Username</label>
          <Field name="Username" :debounce=500 v-slot="{field}" rules="required" v-model="emailInfo.username">
            <input class="form-control" type="text" name="username"
                   data-cy="emailUsername" aria-required="true"
                   v-bind="field"
                   :aria-invalid="errors && Object.keys(errors).length > 0"
                    aria-errormessage="emailUsernameError" aria-describedby="emailUsernameError"
                    id="emailUsername"/>
            <p role="alert" class="text-danger" v-show="errors[0]" data-cy="emailUsernameError" id="emailUsernameError">
              <ErrorMessage name="Username" />
            </p>
          </Field>
        </div>
        <div class="form-group">
          <label class="label" for="emailPassword">* Password</label>
          <Field name="Password" :debounce=500 v-slot="{field}" rules="required" v-model="emailInfo.password">
            <input class="form-control" type="text" name="password"
                   data-cy="emailPassword" aria-required="true"
                   v-bind="field"
                    :aria-invalid="errors && Object.keys(errors).length > 0"
                    aria-errormessage="emailPasswordError" aria-describedby="emailPasswordError"
                    id="emailPassword"/>
            <p role="alert" class="text-danger" v-show="errors[0]" data-cy="emailPasswordError" id="emailPasswordError">
              <ErrorMessage name="Password" />
            </p>
          </Field>
        </div>
      </div>

      <p v-if="connectionError" class="text-danger" data-cy="connectionError" role="alert">
        Connection to Email server failed due to: {{connectionError}}
      </p>

      <div>
        <button class="btn btn-outline-info mr-1" type="button"
                v-on:click="testConnection" :disabled="invalid || missingRequiredValues() || isTesting || isSaving"
                data-cy="emailSettingsTest"
                aria-roledescription="test email server settings button">
          Test
          <i :class="testButtonClass"></i>
        </button>
        <button class="btn btn-outline-success" type="button" v-on:click="saveEmailSettings" :disabled="invalid || missingRequiredValues() || isSaving || isTesting" data-cy="emailSettingsSave">
          Save
          <i :class="[isSaving ? 'fa fa-circle-notch fa-spin fa-3x-fa-fw' : 'fas fa-arrow-circle-right']"></i>
        </button>
      </div>
    </div>
  </Form>
</template>

<script>
  import { defineRule } from 'vee-validate';
  // eslint-disable-next-line camelcase
  import { min_value, max_value } from '@vee-validate/rules';
  import SettingsService from './SettingsService';
  import ToastSupport from '../utils/ToastSupport';
  import InlineHelp from '../utils/InlineHelp';

  defineRule('min_value', min_value);
  defineRule('max_value', max_value);
  // defineRule('min_value', {
  //   // eslint-disable-next-line camelcase
  //   ...min_value,
  //   message: (fieldname, placeholders) => `${fieldname} must be ${placeholders.min} or greater`,
  // });
  // defineRule('max_value', {
  //   // eslint-disable-next-line camelcase
  //   ...max_value,
  //   message: (fieldname, placeholders) => `${fieldname} must be ${placeholders.max} or less`,
  // });

  export default {
    name: 'EmailServerSettings',
    mixins: [ToastSupport],
    components: {
      InlineHelp,
    },
    data() {
      return {
        emailInfo: {
          host: 'localhost',
          port: '25',
          protocol: 'smtp',
          username: '',
          password: '',
          authEnabled: false,
          tlsEnabled: false,
          publicUrl: '',
          fromEmail: 'no_reply@skilltree',
        },
        isTesting: false,
        isSaving: false,
        connectionError: '',
        testFailed: false,
        testSuccess: false,
      };
    },
    mounted() {
      this.loadEmailSettings();
    },
    computed: {
      testButtonClass() {
        if (this.isTesting) {
          return ['fa fa-circle-notch fa-spin fa-3x-fa-fw'];
        }

        if (this.testSuccess) {
          return ['fa fa-check-circle'];
        }

        if (this.testFailed) {
          return ['fa fa-times-circle'];
        }

        return ['fa fa-question-circle'];
      },
      invalid() {
        return false;
      },
    },
    methods: {
      testConnection() {
        this.isTesting = true;
        SettingsService.testConnection(this.emailInfo).then((response) => {
          if (response) {
            this.successToast('Connection Status', 'Email Connection Successful!');
            this.testSuccess = true;
            this.testFailed = false;
          } else {
            this.errorToast('Connection Status', 'Email Connection Failed');
            this.testSuccess = false;
            this.testFailed = true;
          }
        })
          .catch(() => {
            this.errorToast('Failure', 'Failed to Test the Email Connection');
          })
          .finally(() => {
            this.isTesting = false;
          });
      },
      saveEmailSettings() {
        this.isSaving = true;
        if (this.emailInfo.authEnabled === false || this.emailInfo.authEnabled === 'false') {
          this.emailInfo.username = '';
          this.emailInfo.password = '';
        }
        SettingsService.saveEmailSettings(this.emailInfo).then((result) => {
          if (result) {
            if (result.success) {
              this.successToast('Saved', 'Email Connection Successful!');
            } else {
              this.connectionError = result.explanation;
            }
          }
        })
          .catch(() => {
            this.errorToast('Failure', 'Failed to Save the Connection Settings!');
          })
          .finally(() => {
            this.isSaving = false;
          });
      },
      loadEmailSettings() {
        SettingsService.loadEmailSettings().then((response) => {
          this.emailInfo = Object.assign(this.emailInfo, response);
        });
      },
      missingRequiredValues() {
        return !this.isAuthValid() || !this.emailInfo.host || !this.emailInfo.port || !this.emailInfo.protocol || !this.emailInfo.publicUrl || !this.emailInfo.fromEmail;
      },
      isAuthValid() {
        return !this.emailInfo.authEnabled || (this.emailInfo.username && this.emailInfo.password);
      },
    },
  };
</script>

<style scoped>

</style>
