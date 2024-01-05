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
  <Field ref="templateSettingsObserver" v-slot="{errors}" slim>
    <div>
      <div class="form-group">
        <b-tabs class="h-100">
          <b-tab active>
            <template v-slot:title>
              <div data-cy="htmlHeaderTitle">
                <span class="label" v-show="htmlHeaderRequired" :class="hHeaderTitleClass">* </span>
                <label class="label" for="htmlEmailHeader">
                  HTML Header <inline-help :tab-index="false" target-id="htmlEmailHeaderHelp" msg="HTML (and in-line css) to display as a header for outgoing emails"/>
                </label>
              </div>
            </template>
            <div class="mt-2 content-height">
              <Field :rules="{'noscript':true,'max':3000, 'required':htmlHeaderRequired}" vid="htmlHeader" name="HTML Header" v-slot="{ field }" v-model="htmlHeader">
                <textarea class="form-control" name="htmlEmailHeader" data-cy="htmlEmailHeader" rows="3"
                          id="htmlEmailHeader"
                          v-bind="field"
                          :aria-invalid="errors && Object.keys(errors).length > 0"
                          aria-errormessage="htmlEmailHeaderError" aria-describedby="htmlEmailHeaderError"/>
                  <p role="alert" class="text-danger" data-cy="htmlEmailHeaderError" id="htmlEmailHeaderError">
                    <ErrorMessage name="HTML Header" />
                  </p>
                  <p role="alert" class="text-danger"
                     v-show="htmlHeaderRequired && !htmlHeader"
                     data-cy="htmlEmailHeaderRequired">HTML Header is required</p>
              </Field>
            </div>
          </b-tab>
          <b-tab>
            <template v-slot:title>
              <div data-cy="ptHeaderTitle">
                <span class="label" v-show="plaintextHeaderRequired" :class="pHeaderTitleClass">* </span>
                <label class="label" for="plaintextEmailHeader">
                  Plaintext Header <inline-help :tab-index="false" target-id="plaintextEmailHeaderHelp" msg="Plaintext to display as a header for outgoing emails"/>
                </label>
              </div>
            </template>
            <div class="mt-2 content-height">
              <Field :rules="{'noscript':true,'max':3000, 'required':plaintextHeaderRequired}" vid="plaintextHeader" name="Plaintext Header" v-slot="{ field }" v-model="plainTextHeader">
                <textarea class="form-control" name="plaintextEmailHeader" data-cy="plaintextEmailHeader" rows="3"
                          id="plaintextEmailHeader"
                          v-bind="field"
                          :aria-invalid="errors && Object.keys(errors).length > 0"
                          aria-errormessage="plaintextEmailHeaderError" aria-describedby="plaintextEmailHeaderError"/>
                  <p role="alert" class="text-danger" data-cy="plaintextEmailHeaderError" id="plaintextEmailHeaderError">
                    <ErrorMessage name="Plaintext Header" />
                  </p>
                  <p role="alert" class="text-danger"
                     v-show="plaintextHeaderRequired && !plainTextHeader"
                     data-cy="plaintextEmailHeaderRequired">Plaintext Header is required</p>
              </Field>
            </div>
          </b-tab>
        </b-tabs>
      </div>

      <div class="form-group">
        <b-tabs class="h-100">
          <b-tab active>
            <template v-slot:title>
              <div data-cy="htmlFooterTitle">
                <span class="label" v-if="htmlFooterRequired" :class="hFooterTitleClass">* </span>
                <label class="label" for="htmlEmailFooter">
                  HTML Footer <inline-help :tab-index="false" target-id="htmlEmailFooterHelp" msg="HTML (and in-line css) to display as a footer for outgoing emails"/>
                </label>
              </div>
            </template>
            <div class="mt-2 content-height">
              <Field :rules="{'noscript':true,'max':3000, 'required':htmlFooterRequired}" vid="htmlFooter" name="HTML Footer" v-slot="{ field }" v-model="htmlFooter">
              <textarea class="form-control" name="htmlEmailFooter" data-cy="htmlEmailFooter" rows="3"
                        id="htmlEmailFooter"
                        :aria-invalid="errors && Object.keys(errors).length > 0"
                        v-bind="field"
                        aria-errormessage="htmlEmailFooterError" aria-describedby="htmlEmailFooterError"/>
                <p role="alert" class="text-danger" data-cy="htmlEmailFooterError" id="htmlEmailFooterError">
                  <ErrorMessage name="HTML Footer" />
                </p>
                <p role="alert" class="text-danger"
                   v-show="htmlFooterRequired && !htmlFooter"
                   data-cy="htmlEmailFooterRequired">HTML Footer is required</p>
              </Field>
            </div>
          </b-tab>
          <b-tab>
            <template v-slot:title>
              <div data-cy="ptFooterTitle">
                <span class="label" v-if="plaintextFooterRequired" :class="pFooterTitleClass">* </span>
                <label class="label" for="plaintextEmailFooter">
                  Plaintext Footer <inline-help :tab-index="false" target-id="plaintextEmailFooterHelp" msg="Plaintext to display as a footer for outgoing emails"/>
                </label>
              </div>
            </template>
            <div class="mt-2 content-height">
              <Field :rules="{'noscript':true,'max':3000, 'required':plaintextFooterRequired}" v-model="plainTextFooter" vid="plaintextFooter" name="Plaintext Footer" v-slot="{ field }">
              <textarea class="form-control" name="plaintextEmailFooter" data-cy="plaintextEmailFooter" rows="3"
                        id="plaintextEmailFooter"
                        v-bind="field"
                        :aria-invalid="errors && Object.keys(errors).length > 0"
                        aria-errormessage="plaintextEmailFooterError" aria-describedby="plaintextEmailFooterError"/>
                <p role="alert" class="text-danger" data-cy="plaintextEmailFooterError" id="plaintextEmailFooterError">
                  <ErrorMessage name="Plaintext Footer" />
                </p>
                <p role="alert" class="text-danger"
                   v-show="plaintextFooterRequired && !plainTextFooter"
                   data-cy="plaintextEmailFooterRequired">Plaintext Footer is required</p>
              </Field>
            </div>
          </b-tab>
        </b-tabs>
      </div>

      <div>
        <button class="btn btn-outline-success"
                type="button"
                v-on:click="saveTemplateSettings"
                :disabled="invalid || isSaving"
                data-cy="emailTemplateSettingsSave">
          Save
          <i :class="[isSaving ? 'fa fa-circle-notch fa-spin fa-3x-fa-fw' : 'fas fa-arrow-circle-right']"></i>
        </button>
      </div>
    </div>
  </Field>
</template>

<script>
  import { defineRule } from 'vee-validate';
  import { max, required } from '@vee-validate/rules';
  import SettingsService from './SettingsService';
  import ToastSupport from '../utils/ToastSupport';
  import InlineHelp from '../utils/InlineHelp';

  defineRule('max', max);
  defineRule('required', required);

  const scriptRegex = /<[^>]*script/;
  const errorMessage = '<script> tags are not allowed';
  defineRule('noscript', (value, params, field) => {
    if (value) {
      const scriptTags = value.match(scriptRegex);
      if (scriptTags) {
        return errorMessage;
      } else {
        return true;
      }
    }
    return errorMessage;
  });

  const settingGroup = 'GLOBAL.EMAIL';
  export default {
    name: 'EmailTemplateSettings',
    mixins: [ToastSupport],
    components: { InlineHelp },
    data() {
      return {
        htmlHeader: '',
        htmlFooter: '',
        plainTextHeader: '',
        plainTextFooter: '',
        isSaving: false,
      };
    },
    mounted() {
      this.loadEmailSettings();
    },
    computed: {
      invalid() {
        return false;
      },
      htmlHeaderRequired() {
        return !!this.plainTextHeader && !this.htmlHeader;
      },
      plaintextHeaderRequired() {
        return !!this.htmlHeader && !this.plainTextHeader;
      },
      htmlFooterRequired() {
        return !!this.plainTextFooter && !this.htmlFooter;
      },
      plaintextFooterRequired() {
        return !!this.htmlFooter && !this.plainTextFooter;
      },
      hHeaderTitleClass() {
        return {
          'text-danger': this.htmlHeaderRequired && !this.htmlHeader,
        };
      },
      pHeaderTitleClass() {
        return {
          'text-danger': this.plaintextHeaderRequired && !this.plainTextHeader,
        };
      },
      hFooterTitleClass() {
        return {
          'text-danger': this.htmlFooterRequired && !this.htmlFooter,
        };
      },
      pFooterTitleClass() {
        return {
          'text-danger': this.plaintextFooterRequired && !this.plainTextFooter,
        };
      },
    },
    methods: {
      saveTemplateSettings() {
        this.$refs.templateSettingsObserver.validate().then((res) => {
          if (res) {
            this.isSaving = true;
            const settings = this.convertToSettings();
            SettingsService.saveGlobalSettings(settings).then((result) => {
              if (result) {
                if (result.success) {
                  this.successToast('Saved', 'Email Template Settings Saved!');
                }
              }
            })
              .catch(() => {
                this.errorToast('Failure', 'Failed to Save the Email Template Settings!');
              })
              .finally(() => {
                this.isSaving = false;
              });
          }
        });
      },
      convertToSettings() {
        return [{
                  settingGroup,
                  setting: 'email.htmlHeader',
                  value: this.htmlHeader,
                },
                {
                  settingGroup,
                  setting: 'email.htmlFooter',
                  value: this.htmlFooter,
                },
                {
                  settingGroup,
                  setting: 'email.plaintextHeader',
                  value: this.plainTextHeader,
                },
                {
                  settingGroup,
                  setting: 'email.plaintextFooter',
                  value: this.plainTextFooter,
                }];
      },
      convertFromSettings(settings) {
        this.htmlHeader = settings.find((setting) => setting.setting === 'email.htmlHeader')?.value;
        this.htmlFooter = settings.find((setting) => setting.setting === 'email.htmlFooter')?.value;
        this.plainTextHeader = settings.find((setting) => setting.setting === 'email.plaintextHeader')?.value;
        this.plainTextFooter = settings.find((setting) => setting.setting === 'email.plaintextFooter')?.value;
      },
      loadEmailSettings() {
        SettingsService.getGlobalSettings(settingGroup).then((response) => {
          this.convertFromSettings(response);
        });
      },
    },
  };
</script>

<style scoped>

</style>
