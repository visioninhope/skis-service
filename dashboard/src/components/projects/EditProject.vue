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
<!--  <ValidationObserver ref="observer" v-slot="{invalid, handleSubmit}" slim>-->
  <Form @submit="updateProject" v-slot="{ errors }">
    <b-modal :id="internalProject.projectId"
              :title="title"
              @hide="publishHidden"
              v-model="show"
              :no-close-on-backdrop="true"
              :centered="true"
              header-bg-variant="info"
              header-text-variant="light" no-fade
              size="xl">

<!--      <skills-spinner :is-loading="loadingComponent"/>-->

      <b-container fluid v-if="!loadingComponent">
<!--        <ReloadMessage v-if="restoredFromStorage" @discard-changes="discardChanges" />-->
        <div class="row">
          <div class="col-12">
            <div class="form-group">
              <label for="projectIdInput">* {{ nameLabelTxt }}</label>
<!--             uniqueName -->
              <Field rules="required|minNameLength|maxProjectNameLength|customNameValidator|nullValueNotAllowed" name="Project Name" v-slot="{ field }">
<!--                                  v-slot="{errors}"-->
<!--                                  :debounce="250"-->
                <input class="form-control" type="text" v-model="internalProject.name"
                       v-on:input="updateProjectId"
                       v-on:keydown.enter="updateProject"
                       v-bind="field"
                       v-focus
                       data-cy="projectName"
                        id="projectIdInput"
                       aria-errormessage="projectNameError"
                       aria-describedby="projectNameError"/>
<!--                      :aria-invalid="errors && errors.length > 0"-->

                <small role="alert" class="form-text text-danger" data-cy="projectNameError" id="projectNameError">
                  <ErrorMessage name="Project Name" />
                </small>
              </Field>
            </div>
          </div>

          <div class="col-12">
            <id-input type="text" :label="idLabelTxt" v-model="internalProject.projectId"
                      additional-validation-rules="uniqueId" @can-edit="canEditProjectId=$event"
                      v-on:keydown.enter.native="updateProject"
                      :next-focus-el="previousFocus"
                      @shown="tooltipShowing=true"
                      @hidden="tooltipShowing=false"/>
          </div>
        </div>
        <div v-if="showManageUserCommunity" class="border rounded p-2 mt-3 mb-2" data-cy="restrictCommunityControls">
          <div v-if="isCopyAndCommunityProtected">
            <i class="fas fa-shield-alt text-danger" aria-hidden="true" /> Copying project whose access is restricted to <b class="text-primary">{{ userCommunityRestrictedDescriptor }}</b> users only and <b>cannot</b> be lifted/disabled
          </div>
          <div v-if="isEditAndCommunityProtected">
            <i class="fas fa-shield-alt text-danger" aria-hidden="true" /> Access is restricted to <b class="text-primary">{{ userCommunityRestrictedDescriptor }}</b> users only and <b>cannot</b> be lifted/disabled
          </div>
          <div v-if="!isEditAndCommunityProtected && !isCopyAndCommunityProtected">
<!--            <ValidationObserver v-slot="{ pending, invalid }">-->
            <Form>
              <div class="row">
                <div class="col-lg">
                  <Field rules="projectCommunityRequirements" name="Failed Minimum Requirement" v-slot="{ field }" type="checkbox" :value="internalProject.enableProtectedUserCommunity">
                    <b-form-checkbox v-model="internalProject.enableProtectedUserCommunity" v-bind="field"
                                     name="check-button" inline switch data-cy="restrictCommunity">
<!--                                                           @change="userCommunityChanged" -->
                      Restrict <i class="fas fa-shield-alt text-danger" aria-hidden="true" /> Access to <b class="text-primary">{{ userCommunityRestrictedDescriptor }}</b> users only
                    </b-form-checkbox>

                    <div v-if="invalid" class="alert alert-danger mb-3 mt-1" data-cy="communityValidationErrors" role="alert">
                      <div>
                        <i class="fas fa-exclamation-triangle text-danger mr-1" aria-hidden="true" />
                        <span>Unable to restrict access to {{ userCommunityRestrictedDescriptor }} users only:</span>
                      </div>
                      <ErrorMessage name="Failed Minimum Requirement" />
                    </div>
                  </Field>
                </div>
                <div v-if="userCommunityDocsLink" class="col-lg-auto" data-cy="userCommunityDocsLink">
                  <a :href="userCommunityDocsLink" target="_blank" style="text-decoration: underline">{{ userCommunityDocsLabel }}</a>
                  <i class="fas fa-external-link-alt ml-1" aria-hidden="true" style="font-size: 0.9rem;"/>
                </div>
              </div>
              <div v-if="!pending">
                <div v-if="internalProject.enableProtectedUserCommunity && !invalid" class="alert-warning alert mb-0 mt-1" data-cy="communityRestrictionWarning">
                  <i class="fas fa-exclamation-triangle text-danger" aria-hidden="true" /> Please note that once the restriction is enabled it <b>cannot</b> be lifted/disabled.
                </div>
              </div>
            </Form>
          </div>
        </div>
        <div class="row">
          <div class="mt-2 col-12">
              <Field rules="maxDescriptionLength|customProjectDescriptionValidator" v-slot="{ field }" name="Project Description">
                <markdown-editor v-if="!isEdit || descriptionLoaded"
                                 v-model="internalProject.description"
                                 v-bind="field"
                                 :project-id="internalProject.projectId"
                                 :allow-attachments="isEdit || !showManageUserCommunity"
                                 @input="updateDescription" />
                <small role="alert" class="form-text text-danger mb-3" data-cy="projectDescriptionError">
                  <ErrorMessage name="Project Description" />
                </small>
              </Field>
          </div>
        </div>

        <p v-if="invalid && overallErrMsg" class="text-center text-danger mt-2" aria-live="polite"><small>***{{ overallErrMsg }}***</small></p>
      </b-container>

      <div slot="modal-footer" class="w-100">
        <b-button variant="success" size="sm" class="float-right" @click="updateProject" data-cy="saveProjectButton" :disabled="invalid">
          <span>{{ saveBtnTxt }}</span>
        </b-button>
        <b-button variant="secondary" size="sm" class="float-right mr-2" @click="close" data-cy="closeProjectButton">
          Cancel
        </b-button>
      </div>
    </b-modal>
  </Form>
</template>

<script>
  import { Form, Field, ErrorMessage, defineRule } from 'vee-validate';
  import DescriptionValidatorService from '@/common-components/validators/DescriptionValidatorService';
  import MarkdownEditor from '@/common-components/utilities/MarkdownEditor';
  import CommunityLabelsMixin from '@/components/utils/CommunityLabelsMixin';
  import MsgBoxMixin from '@/components/utils/modal/MsgBoxMixin';
  import SkillsSpinner from '@/components/utils/SkillsSpinner';
  import ProjectService from '@/components/projects/ProjectService';
  import IdInput from '../utils/inputForm/IdInput';
  import InputSanitizer from '../utils/InputSanitizer';
  import SaveComponentStateLocallyMixin from '../utils/SaveComponentStateLocallyMixin';
  import ReloadMessage from '../utils/ReloadMessage';

  export default {
    name: 'EditProject',
    components: {
      IdInput,
      MarkdownEditor,
      SkillsSpinner,
      ReloadMessage,
      Form,
      Field,
      ErrorMessage,
    },
    mixins: [SaveComponentStateLocallyMixin, MsgBoxMixin, CommunityLabelsMixin],
    props: ['project', 'isEdit', 'value', 'isCopy'],
    data() {
      return {
        show: this.value,
        internalProject: {
          originalProjectId: this.project.projectId,
          projectId: this.project.projectId,
          isEdit: this.isEdit,
          description: '',
          ...this.project,
        },
        initialValueForEnableProtectedUserCommunity: null,
        originalProject: {
          name: '',
          description: '',
          projectId: '',
          enableProtectedUserCommunity: false,
        },
        canEditProjectId: false,
        overallErrMsg: '',
        currentFocus: null,
        previousFocus: null,
        tooltipShowing: false,
        loadingComponent: true,
        descriptionLoaded: false,
        keysToWatch: ['name', 'description', 'projectId'],
        restoredFromStorage: false,
      };
    },
    created() {
      this.registerValidation();
    },
    mounted() {
      this.internalProject.enableProtectedUserCommunity = this.isRestrictedUserCommunity(this.project.userCommunity);
      this.initialValueForEnableProtectedUserCommunity = this.internalProject.enableProtectedUserCommunity;
      if (this.isCopy && this.initialValueForEnableProtectedUserCommunity) {
        this.originalProject.enableProtectedUserCommunity = this.initialValueForEnableProtectedUserCommunity;
      }
      this.loadComponent();

      document.addEventListener('focusin', this.trackFocus);
    },
    computed: {
      isEditAndCommunityProtected() {
        return this.isEdit && this.initialValueForEnableProtectedUserCommunity;
      },
      isCopyAndCommunityProtected() {
        return this.isCopy && this.initialValueForEnableProtectedUserCommunity;
      },
      title() {
        if (this.isCopy) {
          return 'Copy Project';
        }
        return this.isEdit ? 'Editing Existing Project' : 'New Project';
      },
      saveBtnTxt() {
        return this.isCopy ? 'Copy Project' : 'Save';
      },
      nameLabelTxt() {
        return this.isCopy ? 'New Project Name' : 'Project Name';
      },
      idLabelTxt() {
        return this.isCopy ? 'New Project ID' : 'Project ID';
      },
      componentName() {
        return `${this.$options.name}${this.isEdit ? 'Edit' : ''}`;
      },
      invalid() {
        return false;
      }
    },
    watch: {
      show(newValue) {
        this.$emit('input', newValue);
      },
      internalProject: {
        handler(newValue) {
          this.saveComponentState(this.componentName, newValue);
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
        this.loadingComponent = true;
        this.descriptionLoaded = false;

        if (this.isEdit) {
          this.startLoadingFromDescription();
        } else {
          this.startLoadingFromState();
        }
      },
      startLoadingFromDescription() {
        this.originalProject = {
          name: this.project.name,
          projectId: this.project.projectId,
        };

        ProjectService.loadDescription(this.project.projectId).then((data) => {
          this.originalProject.description = data.description;
          this.startLoadingFromState();
        });
      },
      startLoadingFromState() {
        this.loadComponentState(this.componentName).then((result) => {
          if (result) {
            if (!this.isEdit || (this.isEdit && result.originalProjectId === this.originalProject.projectId)) {
              this.internalProject = result;
              this.restoredFromStorage = true;
            } else {
              Object.assign(this.internalProject, this.originalProject);
            }
          } else {
            Object.assign(this.internalProject, this.originalProject);
          }
        }).finally(() => {
          this.loadingComponent = false;
          this.descriptionLoaded = true;
          if (this.isEdit) {
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
      trackFocus() {
        this.previousFocus = this.currentFocus;
        this.currentFocus = document.activeElement;
      },
      handleIdToggle(canEdit) {
        this.canEditProjectId = canEdit;
      },
      close(e) {
        this.clearComponentState(this.componentName);
        this.hideModal(e);
      },
      publishHidden(e) {
        if (!e.updated && this.hasObjectChanged(this.internalProject, this.originalProject) && !this.loadingComponent) {
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
        } else if (this.tooltipShowing && typeof e.preventDefault === 'function') {
          e.preventDefault();
        } else {
          this.clearComponentState(this.componentName);
          this.hideModal(e);
        }
      },
      hideModal(e) {
        this.show = false;
        this.$emit('hidden', e);
      },
      updateProject() {
        // this.$refs.observer.validate()
        //   .then((res) => {
        //     if (res) {
              this.publishHidden({ updated: true });
              this.internalProject.name = InputSanitizer.sanitize(this.internalProject.name);
              this.internalProject.projectId = InputSanitizer.sanitize(this.internalProject.projectId);
              this.$emit('project-saved', this.internalProject);
          //   }
          // });
      },
      updateProjectId() {
        if (!this.isEdit && !this.canEditProjectId) {
          this.internalProject.projectId = InputSanitizer.removeSpecialChars(this.internalProject.name);
        }
      },
      updateDescription(event) {
        this.internalProject.description = event;
      },
      userCommunityChanged() {
        setTimeout(() => {
          this.$nextTick(() => {
            const { observer } = this.$refs;
            if (observer) {
              observer.validate({ silent: false });
            }
          });
        }, 250);
      },
      registerValidation() {
        const self = this;
        defineRule('uniqueName', (value, params, field) => {
            if (self.isEdit && (self.originalProject.name === value || self.originalProject.name.localeCompare(value, 'en', { sensitivity: 'base' }) === 0)) {
              return true;
            } else {
              ProjectService.checkIfProjectNameExist(value).then((remoteRes) => {
                if (remoteRes) {
                  return `The value for the ${field.name} is already taken.`
                } else {
                  return true;
                }
              });
            }
        });

        defineRule('uniqueId', (value, params, field) => {
            if (self.isEdit && self.originalProject.projectId === value) {
              return true;
            }
            return ProjectService.checkIfProjectIdExist(value).then((remoteRes) => {
              if (remoteRes) {
                return `The value for the ${field.name} is already taken.`;
              } else {
                return true;
              }
            });
        });

        defineRule('customProjectDescriptionValidator', (value, params, field) => {
            if (!self.$store.getters.config.paragraphValidationRegex) {
              return true;
            }

            return DescriptionValidatorService.validateDescription(value, false, self.internalProject.enableProtectedUserCommunity).then((result) => {
              if (result.valid) {
                return true;
              }
              if (result.msg) {
                return `${field.name} - ${result.msg}.`;
              }
              return `${field.name} is invalid.`;
            });
        });

        defineRule('projectCommunityRequirements', (value, params, field) => {
            if (!value || !self.isEdit) {
              return true;
            }

            return ProjectService.validateProjectForEnablingCommunity(self.internalProject.originalProjectId).then((result) => {
              if (result.isAllowed) {
                return true;
              }
              if (result.unmetRequirements) {
                return `<ul><li>${result.unmetRequirements.join('</li><li>')}</li></ul>`;
              }
              return `${field.name} is invalid.`;
            });
        });
      },
    },
  };
</script>

<style lang="scss" scoped>

</style>
