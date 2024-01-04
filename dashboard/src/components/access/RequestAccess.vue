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
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-6 mt-3">
        <div class="text-center mt-5">
          <logo1 />
          <div class="h3 mt-4 text-primary">
            New <span v-if="isRootAccount">Root </span>Account
          </div>
        </div>
        <Form ref="observer" v-slot="{errors}" slim>
          <form @submit.prevent="login">
            <div v-if="!oAuthOnly" class="card">
              <div class="card-body p-4">
                <div class="form-group">
                  <label for="firstName" class="text-primary">* First Name</label>
                  <Field name="First Name" rules="required|maxFirstNameLength" v-slot="{field}" :debounce=500>
                    <div class="input-group">
                      <div class="input-group-prepend">
                        <span class="input-group-text"><i class="fas fa-user"></i></span>
                      </div>
                      <input class="form-control" type="text" v-model="loginFields.firstName"
                             id="firstName" :disabled="createInProgress"
                             name="firstName" aria-required="true"
                             v-bind="field"
                             :aria-invalid="errors && Object.keys(errors).length > 0"
                             aria-errormessage="firstnameError"
                             aria-describedby="firstnameError"/>
                    </div>
                    <small role="alert" class="form-text text-danger" v-show="Object.keys(errors).length > 0" id="firstnameError">
                      <ErrorMessage name="First Name" />
                    </small>
                  </Field>
                </div>
                <div class="form-group">
                  <label for="lastName" class="text-primary">* Last Name</label>
                  <Field name="Last Name" rules="required|maxLastNameLength" :debounce=500 v-slot="{field}">
                    <div class="input-group">
                      <div class="input-group-prepend">
                        <span class="input-group-text"><i class="fas fa-user-tie"></i></span>
                      </div>
                      <input class="form-control" type="text" v-model="loginFields.lastName"
                             id="lastName" :disabled="createInProgress"
                             name="lastName" aria-required="true"
                             v-bind="field"
                             :aria-invalid="errors && Object.keys(errors).length > 0"
                             aria-errormessage="lastnameError"
                             aria-describedby="lastnameError"/>
                    </div>
                    <small role="alert" class="form-text text-danger" v-show="Object.keys(errors).length > 0" id="lastnameError">
                      <ErrorMessage name="Last Name" />
                    </small>
                  </Field>
                </div>
                <div class="form-group">
                  <label for="email" class="text-primary">* Email</label>
                  <Field name="Email" rules="required|email|uniqueEmail" :debounce=500 v-slot="{field}">
                    <div class="input-group">
                      <div class="input-group-prepend">
                        <span class="input-group-text"><i class="far fa-envelope"></i></span>
                      </div>
                      <input class="form-control" type="text" v-model="loginFields.email" id="email"
                             :disabled="createInProgress"
                             name="email" aria-required="true"
                             v-bind="field"
                             :aria-invalid="errors && Object.keys(errors).length > 0"
                             aria-errormessage="emailErrors"
                             aria-describedby="emailErrors"/>
                    </div>
                    <small role="alert" class="form-text text-danger" v-show="Object.keys(errors).length > 0" id="emailErrors">
                      <ErrorMessage name="Email" />
                    </small>
                  </Field>
                </div>
                <div class="form-group">
                  <label for="password" class="text-primary">* Password</label>
                  <Field vid="password" name="Password" rules="required|minPasswordLength|maxPasswordLength" :debounce=500 v-slot="{field}">
                    <div class="input-group">
                      <div class="input-group-prepend">
                        <span class="input-group-text"><i class="fas fa-key"></i></span>
                      </div>
                      <input class="form-control" type="password" v-model="loginFields.password"
                             id="password" :disabled="createInProgress"
                             v-bind="field"
                             name="password" ref="password" aria-required="true"
                             :aria-invalid="errors && Object.keys(errors).length > 0"
                             aria-errormessage="passwordError"
                             aria-describedby="passwordError"/>
                    </div>
                    <small role="alert" class="form-text text-danger" v-show="Object.keys(errors).length > 0" id="passwordError">
                      <ErrorMessage name="Password" />
                    </small>
                  </Field>
                </div>
                <div class="form-group">
                  <label for="password_confirmation" class="text-primary">* Confirm Password</label>
                  <Field vid="password_confirmation" name="Confirm Password" rules="required|confirmed:@Password" :debounce=500 v-slot="{field}">
                    <div class="input-group">
                      <div class="input-group-prepend">
                        <span class="input-group-text"><i class="fas fa-key"></i></span>
                      </div>
                      <input class="form-control" type="password" id="password_confirmation"
                             v-model="passwordConfirmation" :disabled="createInProgress"
                             name="password_confirmation" aria-required="true"
                             v-bind="field"
                             :aria-invalid="errors && Object.keys(errors).length"
                             aria-errormessage="passwordConfirmationError"
                             aria-describedby="passwordConfirmationError"/>
                    </div>
                    <small role="alert" class="form-text text-danger" v-show="Object.keys(errors).length > 0" id="passwordConfirmationError">
                      <ErrorMessage name="Confirm Password" />
                    </small>
                  </Field>
                </div>
                <div class="field is-grouped">
                  <div class="control">
                    <div class="row">
                      <div class="col text-right">
                        <button type="submit" data-cy="createAccountButton" class="btn btn-outline-hc" :disabled="invalid || missingRequiredValues() || createInProgress">
                          Create Account <i v-if="!createInProgress" class="fas fa-arrow-circle-right"/>
                          <b-spinner v-if="createInProgress" label="Loading..." style="width: 1rem; height: 1rem;" variant="hc"/>
                        </button>
                        <div v-if="createInProgress && isRootAccount" class="mt-2 text-info">
                          Bootstrapping! May take a second...
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="!isRootAccount" class="skills-pad-bottom-1-rem">
                  <hr/>
                  <p class="text-center"><small>Already have an account?
                    <strong><b-link @click="loginPage">Sign in</b-link></strong></small>
                  </p>
                </div>
              </div>
            </div>

            <div v-if="oAuthProviders && oAuthProviders.length > 0" class="card mt-3" data-cy="oAuthProviders">
              <div class="card-body">
                <div class="row">
                  <div v-for="oAuthProvider in oAuthProviders" :key="oAuthProvider.registrationId" class="col-12 mb-3">
                    <button type="button" class="btn btn-outline-primary w-100"
                            @click="oAuth2Login(oAuthProvider.registrationId)" aria-label="oAuth authentication link">
                      <i :class="oAuthProvider.iconClass" aria-hidden="true" class="mr-1 text-info" />
                      Login via {{ oAuthProvider.clientName }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </form>
        </Form>
      </div>
    </div>
  </div>
</template>
<script>
  import { ErrorMessage, defineRule } from 'vee-validate';
  import { required, email, confirmed } from '@vee-validate/rules';
  import AccessService from './AccessService';
  import Logo1 from '../brand/Logo1';
  import NavigationErrorMixin from '../utils/NavigationErrorMixin';

  // extend('required', {
  //   ...required,
  //   message: '{_field_} is required',
  // });
  defineRule('required', required);
  defineRule('email', email);
  defineRule('confirmed', confirmed);
  defineRule('uniqueEmail', (value, params, field) => {
      const userExists = AccessService.userWithEmailExists(value);
      return userExists ? userExists :`${field.name} is already used for another account.`;
  });

  export default {
    name: 'RequestAccount',
    components: { Logo1, ErrorMessage },
    mixins: [NavigationErrorMixin],
    props: {
      isRootAccount: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        loginFields: {
          firstName: '',
          lastName: '',
          email: '',
          password: '',
        },
        passwordConfirmation: '',
        createInProgress: false,
        oAuthProviders: [],
      };
    },
    methods: {
      login() {
        this.createInProgress = true;
        this.$store.dispatch('signup', { isRootAccount: this.isRootAccount, ...this.loginFields }).then(() => {
          this.$store.dispatch('configureSkillsClientForInception')
            .then(() => {
              if (this.verifyEmailAddresses) {
                this.handlePush({ name: 'EmailVerificationSent', params: { email: this.loginFields.email } });
              } else if (this.$route.query.redirect) {
                this.handlePush(this.$route.query.redirect);
              } else if (!this.isProgressAndRankingEnabled()) {
                this.handlePush({ name: 'AdminHomePage' });
              } else {
                const defaultHomePage = this.$store.getters.config.defaultLandingPage;
                const pageName = defaultHomePage === 'progress' ? 'MyProgressPage' : 'AdminHomePage';
                this.handlePush({ name: pageName });
              }
            });
        });
      },
      oAuth2Login(registrationId) {
        this.$store.dispatch('oAuth2Login', registrationId);
      },
      missingRequiredValues() {
        return !this.loginFields.firstName || !this.loginFields.lastName || !this.loginFields.email || !this.loginFields.password;
      },
      loginPage() {
        this.handlePush({ name: 'Login' });
      },
      isProgressAndRankingEnabled() {
        return this.$store.getters.config.rankingAndProgressViewsEnabled === true || this.$store.getters.config.rankingAndProgressViewsEnabled === 'true';
      },
    },
    computed: {
      invalid() {
        return false;
      },
      oAuthOnly() {
        return this.$store.getters.config.oAuthOnly;
      },
      verifyEmailAddresses() {
        return this.$store.getters.config.verifyEmailAddresses;
      },
    },
    created() {
      if (!this.$store.getters.isPkiAuthenticated) {
        AccessService.getOAuthProviders()
          .then((result) => {
            this.oAuthProviders = result;
          });
      }
    },
  };
</script>

<style scoped>

</style>
