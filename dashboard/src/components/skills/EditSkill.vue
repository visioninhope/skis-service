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
  <Form ref="observer" v-slot="{ errors }" slim>
    <b-modal :id="skillInternal.skillId" size="xl" :title="title" v-model="show"
             :no-close-on-backdrop="true" :centered="true"
             header-bg-variant="info" header-text-variant="light" no-fade role="dialog" @hide="publishHidden"
             :aria-label="isEdit?'Edit Skill':'New Skill'">
      <skills-spinner :is-loading="isLoading" />
      <b-container v-if="!isLoading" fluid>
          <ReloadMessage v-if="restoredFromStorage" @discard-changes="discardChanges" />
          <div class="row">
            <div class="col-12 col-lg">
              <div class="form-group">
                <label for="skillName">* Skill Name</label>
                <Field rules="required|minNameLength|maxSkillNameLength|nullValueNotAllowed|uniqueName|customNameValidator" :debounce="250" v-slot="{field}" name="Skill Name" ref="skillNameProvider" v-model="skillInternal.name">
                  <input type="text" class="form-control" id="skillName" @input="updateSkillId"
                         v-focus
                         aria-required="true"
                         v-bind="field"
                         v-on:keydown.enter="saveSkill"
                         data-cy="skillName"
                         aria-describedby="skillNameError"
                         aria-errormessage="skillNameError"
                         :aria-invalid="errors && Object.keys(errors).length > 0">
                  <small role="alert" class="form-text text-danger" data-cy="skillNameError" id="skillNameError">
                    <ErrorMessage name="Skill Name" />
                  </small>
                </Field>
              </div>
            </div>
            <div class="col-12 col-lg">
              <id-input type="text" label="Skill ID" :isSkillId="true" additional-validation-rules="uniqueId"
                        v-model="skillInternal.skillId" @can-edit="canEditSkillId=$event"
                        :next-focus-el="previousFocus"
                        @shown="tooltipShowing=true"
                        @hidden="tooltipShowing=false"
                        v-on:keydown.enter.native="saveSkill"/>
            </div>
            <div class="col-12 col-lg-2 mt-2 mt-lg-0">
              <div class="form-group">
                <label for="skillVersion">Version
                  <inline-help
                    target-id="skillVersionHelp"
                    :next-focus-el="previousFocus"
                    @shown="tooltipShowing=true"
                    @hidden="tooltipShowing=false"
                    msg="An optional version for this skill to allow filtering of available skills for different versions of an application"/>
                </label>
                <Field :rules="{ 'optionalNumeric':true,'min_value':0, 'maxSkillVersion':true, 'maxVersion': !isEdit }" v-slot="{field}" name="Version" v-model="skillInternal.version">
                  <input class="form-control" type="text" id="skillVersion"
                         :disabled="isEdit"
                         v-bind="field"
                         data-cy="skillVersion" v-on:keydown.enter="saveSkill"
                         aria-describedby="skillVersionError"
                         aria-errormessage="skillVersionError"
                         :aria-invalid="errors && Object.keys(errors).length > 0"/>
                  <small role="alert" class="form-text text-danger" data-cy="skillVersionError" id="skillVersionError">
                    <ErrorMessage name="Version" />
                  </small>
                </Field>
              </div>
            </div>
          </div>

          <div class="row mt-3">
            <div class="col-12 col-lg">
              <div class="form-group mb-1">
                <label for="pointIncrement">* Point Increment</label>
                <Field rules="optionalNumeric|required|min_value:1|maxPointIncrement" v-slot="{field}" name="Point Increment" v-model="skillInternal.pointIncrement">
                  <input class="form-control" type="text"
                         aria-required="true"
                         :aria-label="`Point Increment values must range between 1 and ${maxPointIncrement}`"
                         v-bind="field"
                         data-cy="skillPointIncrement" v-on:keydown.enter="saveSkill"
                         id="pointIncrement"
                         aria-describedby="skillPointIncrementError"
                         aria-errormessage="skillPointIncrementError"
                         :aria-invalid="errors && Object.keys(errors).length > 0"/>
                  <small role="alert" class="form-text text-danger" data-cy="skillPointIncrementError" id="skillPointIncrementError">
                    <ErrorMessage name="Point Increment" />
                  </small>
                </Field>
              </div>
            </div>
            <div class="col-12 col-lg">
              <div class="form-group mt-2 mt-lg-0">
                <label for="numPerformToCompletion">* Occurrences to Completion</label>
                <Field vid="totalOccurrences" rules="optionalNumeric|required|min_value:1|maxNumPerformToCompletion|moreThanMaxWindowOccurrences:@windowMaxOccurrence" v-slot="{field}" name="Occurrences to Completion" tag="div" v-model="skillInternal.numPerformToCompletion">
                  <input class="form-control" type="text"
                         data-cy="numPerformToCompletion" aria-required="true"
                         v-on:keydown.enter="saveSkill"
                         v-bind="field"
                         id="numPerformToCompletion"
                         aria-describedby="skillOccurrencesError"
                         aria-errormessage="skillOccurrencesError"
                         :disabled="occurrencesToCompletionDisabled"
                         :aria-label="`Occurrences to Completion values must range between 1 and ${maxPointIncrement}`"
                         :aria-invalid="errors && Object.keys(errors).length > 0"/>
                  <small role="alert" class="form-text text-danger" data-cy="skillOccurrencesError" id="skillOccurrencesError">
                    <ErrorMessage name="Occurrences to Completion" />
                  </small>
                </Field>
              </div>
            </div>
            <div class="col-12 col-lg-3">
              <div class="form-group">
                <label>Total Points
                  <inline-help
                    target-id="totalPointsHelp"
                    :next-focus-el="previousFocus"
                    @shown="tooltipShowing=true"
                    @hidden="tooltipShowing=false"
                    msg="Derived and can't be entered directly. Total Points = Increment x Occurrences."/>
                </label>
                <div class="input-group">
                  <div class="input-group-prepend">
                    <div class="input-group-text"><i class="fas fa-equals"/></div>
                  </div>
                  <div class="form-control font-italic" style="background: #eeeeee;">{{ $filters.formatNum(totalPoints) }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="row mt-3">
            <div class="col-12 col-lg">
              <div class="form-group">
                <label><b-form-checkbox data-cy="timeWindowCheckbox" id="checkbox-1" class="d-inline" v-model="skillInternal.timeWindowEnabled" v-on:input="resetTimeWindow"/>Time Window
                  <inline-help
                    target-id="timeWindowHelp"
                    :next-focus-el="previousFocus"
                    @shown="tooltipShowing=true"
                    @hidden="tooltipShowing=false"
                    :msg="skillInternal.timeWindowEnabled ? 'Uncheck to disable. When disabled, there is no limit on how often a skill can be performed.' : 'Check to enable. When enabled, this limits how often a skill can be performed.'"/>

                </label>
                <div class="row">
                  <div class="col-12 col-sm">
                    <Field rules="optionalNumeric|required|min_value:0|hoursMaxTimeWindow:@timeWindowMinutes|cantBe0IfMins0" vid="timeWindowHours" v-slot="{field}" name="Hours" v-model="skillInternal.pointIncrementIntervalHrs">
                      <div class="input-group">
                        <input class="form-control d-inline" type="text"
                               :disabled="!skillInternal.timeWindowEnabled"
                               :aria-required="skillInternal.timeWindowEnabled"
                               v-bind="field"
                               ref="timeWindowHours" data-cy="timeWindowHours"
                               v-on:keydown.enter="saveSkill"
                               id="timeWindowHours" :aria-label="`time window hours ${maxTimeWindowMessage}`"
                               aria-describedby="skillHoursError" :aria-invalid="errors && Object.keys(errors).length > 0"
                               aria-errormessage="skillHoursError"/>
                        <div class="input-group-append">
                          <span class="input-group-text" id="hours-append">Hours</span>
                        </div>
                      </div>
                      <small role="alert" class="form-text text-danger" data-cy="skillHoursError" id="skillHoursError">
                        <ErrorMessage name="Hours" />
                      </small>
                    </Field>
                  </div>
                  <div class="col-12 col-sm">
                    <Field rules="optionalNumeric|required|min_value:0|max_value:59|minutesMaxTimeWindow:@timeWindowHours|cantBe0IfHours0" vid="timeWindowMinutes" v-slot="{field}" name="Minutes" v-model="skillInternal.pointIncrementIntervalMins">
                      <div class="input-group">
                        <input class="form-control d-inline"  type="text"
                               :disabled="!skillInternal.timeWindowEnabled" ref="timeWindowMinutes" data-cy="timeWindowMinutes"
                               v-on:keydown.enter="saveSkill"
                               v-bind="field"
                               :aria-required="skillInternal.timeWindowEnabled"
                               aria-label="time window minutes"
                               aria-describedby="skillMinutesError"
                               aria-errormessage="skillMinutesError"
                               :aria-invalid="errors && Object.keys(errors).length > 0"/>
                        <div class="input-group-append">
                          <span class="input-group-text" id="minutes-append">Minutes</span>
                        </div>
                      </div>
                      <small role="alert" class="form-text text-danger" data-cy="skillMinutesError" id="skillMinutesError">
                        <ErrorMessage name="Minutes" />
                      </small>
                    </Field>
                  </div>
                </div>

              </div>
            </div>
            <div class="col-12 col-lg">
              <Field vid="windowMaxOccurrence" rules="optionalNumeric|required|min_value:1|lessThanTotalOccurrences:@totalOccurrences|maxNumPointIncrementMaxOccurrences" v-slot="{field}" name="Window's Max Occurrences" v-model="skillInternal.numPointIncrementMaxOccurrences">
                <div class="form-group">
                  <label for="maxOccurrences">Window's Max Occurrences
                    <inline-help
                      target-id="maxOccurrencesHelp"
                      :next-focus-el="previousFocus"
                      @shown="tooltipShowing=true"
                      @hidden="tooltipShowing=false"
                      msg="Once this Max Occurrences has been reached, points will not be incremented until outside of the configured Time Window."/>
                  </label>

                    <input class="form-control" type="text"
                           :disabled="!skillInternal.timeWindowEnabled" data-cy="maxOccurrences"
                           v-on:keydown.enter="saveSkill"
                           id="maxOccurrences"
                           v-bind="field"
                           :aria-required="skillInternal.timeWindowEnabled"
                           aria-describedby="skillMaxOccurrencesError"
                           aria-errormessage="skillMaxOccurrencesError"
                           :aria-invalid="errors && Object.keys(errors).length > 0"/>
                    <small role="alert" class="form-text text-danger" data-cy="skillMaxOccurrencesError" id="skillMaxOccurrencesError">
                      <ErrorMessage name="Window's Max Occurrences" />
                    </small>
                </div>
              </Field>
            </div>
          </div>

            <hr class="mt-0"/>

            <self-reporting-type-input v-model="skillInternal.selfReportingType"
                                       :skill="skillInternal"
                                       :is-edit="isEdit"
                                       :next-focus-el="previousFocus"
                                       @shown="tooltipShowing=true"
                                       @hidden="tooltipShowing=false"
                                       @justificationRequiredChanged="updateJustificationRequired"
                                       @input="selfReportTypeChanged"
                                       @quizIdChanged="updateQuizId"
                                       @quizIdCleared="clearQuizId"
            />

            <hr class="mt-0"/>

            <div class="">
            <div class="control">
              <Field rules="maxDescriptionLength|customDescriptionValidator" :debounce="250" v-slot="{field}" name="Skill Description" v-model="skillInternal.description">
                <markdown-editor :project-id="skillInternal.projectId"
                                 v-bind="field"
                                 :skill-id="isEdit ? skillInternal.skillId : null"
                                 data-cy="skillDescription"/>
                <small role="alert" class="form-text text-danger" data-cy="skillDescriptionError">
                  <ErrorMessage name="Skill Description" />
                </small>
              </Field>
            </div>
          </div>

          <help-url-input class="mt-3"
                          :next-focus-el="previousFocus"
                          @shown="tooltipShowing=true"
                          @hidden="tooltipShowing=false"
                          v-model="skillInternal.helpUrl"
                          v-on:keydown.enter.native="saveSkill" />

          <p v-if="invalid && overallErrMsg" class="text-center text-danger">***{{ overallErrMsg }}***</p>
        </b-container>

      <template v-slot:modal-footer>
        <div class="w-100">
        <b-button variant="success" size="sm" class="float-right" @click="saveSkill"
                  :disabled="invalid || isLoading"
                  data-cy="saveSkillButton">
          Save
        </b-button>
        <b-button variant="secondary" size="sm" class="float-right mr-2" @click="close" data-cy="closeSkillButton">
          Cancel
        </b-button>
      </div>
      </template>
    </b-modal>
  </Form>
</template>

<script>
  import { defineRule, ErrorMessage } from 'vee-validate';
  // import { max_value, min_value } from 'vee-validate';
  import MarkdownEditor from '@/common-components/utilities/MarkdownEditor';
  import SelfReportingTypeInput from '@/components/skills/selfReport/SelfReportingTypeInput';
  import SkillsSpinner from '@/components/utils/SkillsSpinner';
  import MsgBoxMixin from '@/components/utils/modal/MsgBoxMixin';
  import SkillsService from './SkillsService';
  import IdInput from '../utils/inputForm/IdInput';
  import InlineHelp from '../utils/InlineHelp';
  import InputSanitizer from '../utils/InputSanitizer';
  import SettingsService from '../settings/SettingsService';
  import HelpUrlInput from '../utils/HelpUrlInput';
  import SaveComponentStateLocallyMixin from '../utils/SaveComponentStateLocallyMixin';
  import ReloadMessage from '../utils/ReloadMessage';

  // extend('min_value', {
  //   // eslint-disable-next-line camelcase
  //   ...min_value,
  //   message: (fieldname, placeholders) => `${fieldname} must be ${placeholders.min} or more`,
  // });
  // extend('max_value', {
  //   // eslint-disable-next-line camelcase
  //   ...max_value,
  //   message: (fieldname, placeholders) => `${fieldname} must be ${placeholders.max} or less`,
  // });
  // extend('help_url', {
  //   message: (field) => `${field} must start with "/" or "http(s)"`,
  //   validate(value) {
  //     if (!value) {
  //       return true;
  //     }
  //     return value.startsWith('http') || value.startsWith('https') || value.startsWith('/');
  //   },
  // });

  export default {
    name: 'EditSkill',
    components: {
      HelpUrlInput,
      ErrorMessage,
      SkillsSpinner,
      SelfReportingTypeInput,
      InlineHelp,
      IdInput,
      MarkdownEditor,
      ReloadMessage,
    },
    mixins: [SaveComponentStateLocallyMixin, MsgBoxMixin],
    props: {
      projectId: {
        type: String,
        required: true,
      },
      subjectId: {
        type: String,
        required: true,
      },
      groupId: {
        type: String,
        required: false,
      },
      skillId: String,
      isEdit: {
        type: Boolean,
        required: true,
      },
      isCopy: {
        type: Boolean,
        required: false,
        default: false,
      },
      value: {
        type: Boolean,
        required: true,
      },
      newSkillDefaultValues: {
        type: Object,
        required: false,
      },
    },
    data() {
      return {
        currentFocus: null,
        previousFocus: null,
        tooltipShowing: false,
        isLoadingSkillDetails: true,
        saveTimer: null,
        originalSkill: {
          skillId: '',
          projectId: this.projectId,
          subjectId: this.subjectId,
          name: '',
          pointIncrement: 100,
          numPerformToCompletion: 1,
          pointIncrementIntervalHrs: 8,
          pointIncrementIntervalMins: 0,
          timeWindowEnabled: false,
          numPointIncrementMaxOccurrences: 1,
          description: null,
          helpUrl: null,
          selfReportingType: null,
          justificationRequired: false,
          quizId: null,
          type: 'Skill',
        },
        skillInternal: {
          skillId: '',
          originalSkillId: this.skillId,
          projectId: this.projectId,
          subjectId: this.subjectId,
          name: '',
          pointIncrement: 100,
          numPerformToCompletion: 1,
          // Time Window - represented in hrs + mins;
          // 0  for both means 'disabled' and that
          // the action can be performed right away
          pointIncrementIntervalHrs: 8,
          pointIncrementIntervalMins: 0,
          timeWindowEnabled: false,
          // Max Occurrences Within Window
          numPointIncrementMaxOccurrences: 1,
          description: null,
          helpUrl: null,
          selfReportingType: null,
          justificationRequired: false,
          quizId: null,
          type: 'Skill',
        },
        canEditSkillId: false,
        initial: {
          skillId: '',
          skillName: '',
          latestVersion: 0,
        },
        selfReport: {
          loading: false,
        },
        overallErrMsg: '',
        show: this.value,
        keysToWatch: [
          'name', 'description', 'skillId', 'helpUrl', 'pointIncrement', 'numPerformToCompletion',
          'pointIncrementIntervalHrs', 'pointIncrementIntervalMins', 'timeWindowEnabled',
          'numPointIncrementMaxOccurrences', 'selfReportingType', 'type',
        ],
        restoredFromStorage: false,
      };
    },
    mounted() {
      this.loadComponent();

      this.setupValidation();
      document.addEventListener('focusin', this.trackFocus);
    },
    computed: {
      invalid() {
        return false;
      },
      occurrencesToCompletionDisabled() {
        return this.skillInternal && this.skillInternal.selfReportingType
          && (this.skillInternal.selfReportingType === 'Quiz' || this.skillInternal.selfReportingType === 'Video');
      },
      isLoading() {
        return this.isLoadingSkillDetails || this.selfReport.loading;
      },
      totalPoints() {
        if (this.skillInternal.pointIncrement && this.skillInternal.numPerformToCompletion) {
          const result = this.skillInternal.pointIncrement * this.skillInternal.numPerformToCompletion;
          if (result > 0) {
            return result;
          }
        }
        return 0;
      },
      title() {
        return this.isEdit ? 'Editing Existing Skill' : 'New Skill';
      },
      maxTimeWindowMessage() {
        return `Time Window must be less then ${this.$store.getters.config.maxTimeWindowInMinutes / 60} hours`;
      },
      maxNumPerformToCompletion() {
        return this.$store.getters.config.maxNumPerformToCompletion;
      },
      maxPointIncrement() {
        return this.$store.getters.config.maxPointIncrement;
      },
      componentName() {
        return `${this.projectId}-${this.subjectId}-${this.$options.name}${this.isEdit ? 'Edit' : ''}${this.isCopy ? 'Copy' : ''}`;
      },
    },
    watch: {
      show(newValue) {
        this.$emit('input', newValue);
      },
      skillInternal: {
        handler(newValue) {
          if (this.hasObjectChanged(newValue, this.originalSkill)) {
            this.saveComponentState(this.componentName, newValue);
          }
        },
        deep: true,
      },
    },
    methods: {
      discardChanges(reload = false) {
        this.clearComponentState(this.componentName);
        if (reload) {
          this.restoredFromStorage = false;
          this.loadComponent();
        }
      },
      loadComponent() {
        this.isLoadingSkillDetails = true;

        if (this.isEdit || this.isCopy) {
          this.loadSkillDetails(this.isCopy);
        } else {
          this.startLoadingFromState();
        }
      },
      trackFocus() {
        this.previousFocus = this.currentFocus;
        this.currentFocus = document.activeElement;
      },
      close(e) {
        this.clearComponentState(this.componentName);
        this.hideModal(e);
      },
      publishHidden(e) {
        if (!e.saved && this.hasObjectChanged(this.skillInternal, this.originalSkill) && !this.isLoading) {
          e.preventDefault();
          this.$nextTick(() => this.$announcer.polite('You have unsaved changes.  Discard?'));
          this.msgConfirm('You have unsaved changes.  Discard?', 'Discard Changes?', 'Discard Changes', 'Continue Editing')
            .then((res) => {
              if (res) {
                this.clearComponentState(this.componentName);
                this.hideModal(e);
                this.$nextTick(() => this.$announcer.polite('Changes discarded'));
              } else {
                this.$nextTick(() => this.$announcer.polite('Continued editing'));
              }
            });
        } else if (this.tooltipShowing) {
          e.preventDefault();
        } else {
          this.clearComponentState(this.componentName);
          this.hideModal(e);
        }
      },
      hideModal(e) {
        this.show = false;
        this.$emit('hidden', { updated: this.isEdit, ...e });
      },
      updateJustificationRequired(value) {
        this.skillInternal.justificationRequired = value;
      },
      updateQuizId(quizId) {
        this.skillInternal.quizId = quizId;
      },
      clearQuizId() {
        this.skillInternal.quizId = null;
      },
      selfReportTypeChanged(newType) {
        if (newType === 'Quiz' || newType === 'Video') {
          this.skillInternal.numPerformToCompletion = 1;
          this.skillInternal.timeWindowEnabled = false;
          this.skillInternal.numPointIncrementMaxOccurrences = 1;
        }
      },
      setupValidation() {
        const self = this;
        defineRule('uniqueName', (value, params, field) => {
            const message = `The value for the ${field.name} is already taken.`;
            if (self.isEdit && (value === self.initial.skillName || self.initial.skillName.localeCompare(value, 'en', { sensitivity: 'base' }) === 0)) {
              return true;
            }
            const nameExists = SkillsService.skillWithNameExists(self.projectId, value);
            return nameExists ? nameExists : message;
        });

        defineRule('uniqueId', (value, params, field) => {
            const message =  `The value for the ${field.name} is already taken.`;
            if (self.isEdit && self.initial.skillId === value) {
              return true;
            }
            const idExists = SkillsService.skillWithIdExists(self.projectId, value);
            return idExists ? idExists : message;
        });

        defineRule('lessThanTotalOccurrences', (value, params, field) => {
            const target = params[0];
            const isValid = parseInt(target, 10) >= parseInt(value, 10);
            return isValid ? true : 'Must be less than or equals to \'Occurrences to Completion\' field';
        });
        defineRule('moreThanMaxWindowOccurrences', (value, params, field) => {
            const target = params[0];
            const isValid = parseInt(value, 10) >= parseInt(target, 10);
            return isValid ? true : 'Must be more than or equals to \'Max Occurrences Within Window\' field';
        });
        defineRule('cantBe0IfHours0', (value, params, field) => {
            if (parseInt(value, 10) > 0 || parseInt(self.skillInternal.pointIncrementIntervalHrs, 10) > 0) {
              return true;
            }
            return `${field.name} must be > 0 if Hours = 0`;
        });
        defineRule('cantBe0IfMins0', (value, params, field) => {
            if (parseInt(value, 10) > 0 || parseInt(self.skillInternal.pointIncrementIntervalMins, 10) > 0) {
              return true;
            }
            return `${field.name} must be > 0 if Minutes = 0`;
        });

        defineRule('maxVersion', (value, params, field) => {
            if (parseInt(value, 10) > (self.initial.latestVersion + 1)) {
              return `Version ${self.initial.latestVersion} is the latest; max supported version is ${self.initial.latestVersion + 1} (latest + 1)`;
            }
            return true;
        });

        defineRule('selfReportQuiz', (value, params, field) => {
            if (self.skillInternal.selfReportingType === 'Quiz' && !self.skillInternal.quizId) {
              return `Test was not selected for the ${field.name}`;
            }
            return true;
        });

        const validateWindow = (windowHours, windowMinutes, validator) => {
          let hours = 0;
          let minutes = 0;
          if (windowHours) {
            hours = parseInt(windowHours, 10);
          }

          if (windowMinutes) {
            minutes = parseInt(windowMinutes, 10);
          }

          if (validator === 'hoursMaxTimeWindow' && hours === 0) {
            return true;
          }
          if (validator === 'minutesMaxTimeWindow' && minutes === 0) {
            return true;
          }

          return ((hours * 60) + minutes) <= this.$store.getters.config.maxTimeWindowInMinutes;
        };

        defineRule('hoursMaxTimeWindow', (value, params, field) => {
            const target = params[0];
            const isValid = validateWindow(value, target, 'hoursMaxTimeWindow');
            return isValid ? true : this.maxTimeWindowMessage;
        });
        defineRule('minutesMaxTimeWindow', (value, params, field) => {
            const target = params[0];
            const isValid = validateWindow(target, value, 'minutesMaxTimeWindow');
            return isValid ? true : this.maxTimeWindowMessage;
        });
      },
      saveSkill() {
        this.$refs.observer.validate()
          .then((res) => {
            if (!res) {
              this.overallErrMsg = 'Form did NOT pass validation, please fix and try to Save again';
            } else {
              this.skillInternal.name = InputSanitizer.sanitize(this.skillInternal.name);
              this.skillInternal.skillId = InputSanitizer.sanitize(this.skillInternal.skillId);
              this.skillInternal.helpUrl = InputSanitizer.sanitize(this.skillInternal.helpUrl);
              if (this.skillInternal.selfReportingType === 'Disabled') {
                this.skillInternal.selfReportingType = null;
              }
              this.skillInternal = {
                subjectId: this.subjectId,
                ...this.skillInternal,
                pointIncrement: parseInt(this.skillInternal.pointIncrement, 10),
                numPerformToCompletion: parseInt(this.skillInternal.numPerformToCompletion, 10),
              };
              const isQuiz = this.skillInternal.selfReportingType === 'Quiz';
              const quizId = isQuiz ? this.skillInternal.quizId : null;
              const quizName = isQuiz ? this.skillInternal.quizName : null;
              const quizType = isQuiz ? this.skillInternal.quizType : null;
              this.$emit('skill-saved', {
                isEdit: this.isEdit,
                ...this.skillInternal,
                groupId: this.groupId,
                quizId,
                quizName,
                quizType,
              });
              this.publishHidden({ saved: true });
            }
          });
      },
      startLoadingFromState() {
        this.loadComponentState(this.componentName).then((result) => {
          if (result && (!this.isEdit || (this.isEdit && result.originalSkillId === this.originalSkill.skillId))) {
            this.skillInternal = result;
            this.restoredFromStorage = true;
          } else if (!this.isEdit && !this.isCopy) {
            this.findLatestSkillVersion();
            this.loadSelfReportProjectSetting();
          } else if (this.newSkillDefaultValues) {
            Object.assign(this.skillInternal, this.newSkillDefaultValues);
          } else {
            Object.assign(this.skillInternal, this.originalSkill);
          }
        }).finally(() => {
          this.isLoadingSkillDetails = false;
          if (this.isEdit || this.isCopy) {
            setTimeout(() => {
              this.$nextTick(() => {
                const { observer } = this.$refs;
                if (observer) {
                  observer.validate({ silent: false });
                }
              });
            }, 600);
          }
        });
      },
      loadSkillDetails(isCopy) {
        return SkillsService.getSkillDetails(this.projectId, this.subjectId, this.skillId)
          .then((loadedSkill) => {
            if (!isCopy) {
              this.originalSkill = {
                originalSkillId: loadedSkill.skillId, isEdit: this.isEdit, ...loadedSkill, subjectId: this.subjectId,
              };
            } else {
              const copy = { ...loadedSkill };
              copy.name = `Copy of ${loadedSkill.name}`;
              copy.skillId = `copy_of_${loadedSkill.skillId}`;
              copy.subjectId = this.subjectId;
              copy.originalSkillId = `copy_of_${loadedSkill.skillId}`;
              if (loadedSkill.selfReportingType === 'Video') {
                copy.selfReportingType = null;
              }
              this.originalSkill = { isEdit: false, ...copy };
            }
            this.initial.skillId = this.originalSkill.skillId;
            this.initial.skillName = this.originalSkill.name;
          })
          .finally(() => {
            this.startLoadingFromState();
          });
      },
      loadSelfReportProjectSetting() {
        this.selfReport.loading = true;
        SettingsService.getSettingsForProject(this.projectId)
          .then((response) => {
            if (response) {
              const selfReportingTypeSetting = response.find((item) => item.setting === 'selfReport.type');
              if (selfReportingTypeSetting) {
                this.originalSkill.selfReportingType = selfReportingTypeSetting.value;
              }
              const selfReportingJustificationSetting = response.find((item) => item.setting === 'selfReport.justificationRequired');
              if (selfReportingJustificationSetting) {
                this.originalSkill.justificationRequired = selfReportingJustificationSetting.value;
              }
            }
          }).finally(() => {
            if (this.newSkillDefaultValues) {
              Object.assign(this.skillInternal, this.newSkillDefaultValues);
            } else {
              Object.assign(this.skillInternal, this.originalSkill);
            }
            this.selfReport.loading = false;
          });
      },
      findLatestSkillVersion() {
        SkillsService.getLatestSkillVersion(this.projectId)
          .then((latestVersion) => {
            this.skillInternal.version = latestVersion;
            this.initial.latestVersion = latestVersion;
          })
          .finally(() => {
            this.isLoadingSkillDetails = false;
          });
      },
      updateSkillId() {
        if (!this.isEdit && !this.canEditSkillId) {
          let id = InputSanitizer.removeSpecialChars(this.skillInternal.name);
          // Subjects, skills and badges can not have same id under a project
          // by default append Skill to avoid id collision with other entities,
          // user can always override in edit mode
          if (id) {
            id = `${id}Skill`;
          }
          this.skillInternal.skillId = id;
        }
      },
      resetTimeWindow(checked) {
        if (!checked) {
          this.skillInternal.pointIncrementIntervalHrs = 8;
          this.skillInternal.pointIncrementIntervalMins = 0;
          this.skillInternal.numPointIncrementMaxOccurrences = 1;
        }
      },
    },
  };
</script>

<style>
</style>
