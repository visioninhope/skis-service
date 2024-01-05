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
    <sub-page-header title="Profile"/>

    <loading-container v-bind:is-loading="isLoading">
      <Form v-slot="{errors}" slim>
        <div class="card">
          <div class="card-body">
            <div v-if="!pkiAuthenticated">
              <label for="profileFirstName">* First Name</label>
              <Field name="First Name" :debounce=500 v-slot="{field}" rules="required|maxFirstNameLength" v-model="loginFields.first">
                <div class="input-group">
                  <input class="form-control"
                         type="text" name="first" aria-required="true"
                         id="profileFirstName"
                         v-bind="field"
                         :aria-invalid="errors && Object.keys(errors).length > 0"
                         aria-errormessage="firstnameError" aria-describedby="firstnameError"/>
                </div>
                <p role="alert" class="text-danger" id="firstnameError">
                  <ErrorMessage name="First Name" />
                </p>
              </Field>

              <label class="mt-2" for="profileLastName">* Last Name</label>
              <Field name="Last Name" :debounce=500 v-slot="{field}" rules="required|maxLastNameLength" v-model="loginFields.last">
                <div class="input-group">
                  <input class="form-control" type="text" name="last" aria-required="true"
                      id="profileLastName" v-bind="field"
                      :aria-invalid="errors && Object.keys(errors).length > 0"
                      aria-errormessage="lastnameError" aria-describedby="lastnameError"/>
                </div>
                <p role="alert" class="text-danger" id="lastnameError">
                  <ErrorMessage name="Last Name" />
                </p>
              </Field>
            </div>
            <label class="mt-2" for="profileNickname">Primary Name</label>
            <Field name="nickname" type="text" :debounce=500 v-slot="{field}" rules="maxNicknameLength" v-model="loginFields.nickname">
              <div class="input-group">
                <input class="form-control"
                    id="profileNickname" v-bind="field"
                    :aria-invalid="errors && Object.keys(errors).length > 0"
                    aria-errormessage="nicknameError" aria-describedby="nicknameError"/>
              </div>
              <p role="alert" class="text-danger" id="nicknameError">
                <ErrorMessage name="Primary Name" />
              </p>
            </Field>

            <div class="mt-2">
              <button class="btn btn-outline-success" @click="updateUserInfo" :disabled="invalid || !hasChangedValues()" data-cy="generalSettingsSave">
                Save
                <i :class="[isSaving ? 'fa fa-circle-notch fa-spin fa-3x-fa-fw' : 'fas fa-arrow-circle-right']"></i>
              </button>
            </div>
          </div>
        </div>
      </Form>
    </loading-container>
  </div>
</template>

<script>
  import { ErrorMessage } from 'vee-validate';
  import SettingsService from './SettingsService';
  import LoadingContainer from '../utils/LoadingContainer';
  import SubPageHeader from '../utils/pages/SubPageHeader';
  import ToastSupport from '../utils/ToastSupport';

  export default {
    name: 'GeneralSettings',
    mixins: [ToastSupport],
    components: { SubPageHeader, LoadingContainer, ErrorMessage },
    data() {
      return {
        isLoading: true,
        loginFields: {
          first: '',
          last: '',
          nickname: '',
        },
        originalValues: {
          first: '',
          last: '',
          nickname: '',
        },
        isSaving: false,
        pkiAuthenticated: false,
      };
    },
    mounted() {
      this.loadData();
      this.pkiAuthenticated = this.$store.getters.isPkiAuthenticated;
    },
    computed: {
      invalid() {
        return false;
      },
    },
    methods: {
      loadData() {
        const { userInfo } = this.$store.getters;
        if (userInfo !== null) {
          this.loginFields.first = userInfo.first;
          this.loginFields.last = userInfo.last;
          this.loginFields.nickname = userInfo.nickname;
          this.setOriginalValues();
        }
        this.isLoading = false;
      },
      hasChangedValues() {
        let hasChangedValues = false;
        Object.keys(this.originalValues).forEach((index) => {
          if (this.originalValues[index] !== this.loginFields[index]) {
            hasChangedValues = true;
          }
        });
        return hasChangedValues;
      },
      updateUserInfo() {
        this.isSaving = true;
        const userInfo = { ...this.$store.getters.userInfo, ...this.loginFields };
        SettingsService.saveUserInfo(userInfo).then(() => {
          this.$store.commit('storeUser', userInfo);
          this.successToast('Saved', 'Updated User Info Successful!');
          this.setOriginalValues();
        })
          .catch(() => {
            this.errorToast('Failure', 'Failed to Update User Info Settings!');
          })
          .finally(() => {
            this.isSaving = false;
          });
      },
      setOriginalValues() {
        this.originalValues.first = this.loginFields.first;
        this.originalValues.last = this.loginFields.last;
        this.originalValues.nickname = this.loginFields.nickname;
      },
    },
  };
</script>

<style scoped>
</style>
