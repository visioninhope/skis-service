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
import axios from 'axios';
import { NavigationFailureType, isNavigationFailure } from 'vue-router';
import router from '../router';
import store from '../store/store';

const handlePush = (page) => {
  router.push(page).catch((error) => {
    if (isNavigationFailure(error, NavigationFailureType.redirected)
      || isNavigationFailure(error, NavigationFailureType.duplicated)) {
      // squash, vue-router made changes in version 3 that
      // causes a redirect to trigger an error. router-link squashes these and in previous
      // versions of vue-router they were ignored. Because we trigger redirects in a navigation guard
      // to handle landing/home page display preferences, we receive this benign error
    } else {
      // eslint-disable-next-line
      console.error(error);
    }
  });
};

function errorResponseHandler(error) {
  if (axios.isCancel(error)) {
    return Promise.resolve({ data: {} });
  }

  // check if the caller wants to handle all errors
  if (Object.prototype.hasOwnProperty.call(error.config, 'handleError') && error.config.handleError === false) {
    return Promise.reject(error);
  }

  const errorCode = error.response ? error.response.status : undefined;

  // check if the caller wants to handle a specific error status code
  if (Object.prototype.hasOwnProperty.call(error.config, 'handleErrorCode')) {
    if (Array.isArray(error.config.handleErrorCode)) {
      if (error.config.handleErrorCode.find((el) => el === errorCode)) {
        return Promise.reject(error);
      }
    } else if (typeof error.config.handleErrorCode === 'string' && error.config.handleErrorCode.contains(',')) {
      const arr = error.config.handleErrorCode.split(',');
      if (arr.find((el) => el === errorCode)) {
        return Promise.reject(error);
      }
    } else if (error.config.handleErrorCode === errorCode) {
      return Promise.reject(error);
    }
  }

  const path = window.location.pathname;
  if (errorCode === 401) {
    store.commit('clearAuthData');
    if (path !== '/skills-login') {
      let loginRoute = path !== '/' ? { name: 'Login', query: { redirect: path } } : { name: 'Login' };
      if (store.getters.isPkiAuthenticated) {
        loginRoute = path !== '/' ? { name: 'LandingPage', query: { redirect: path } } : { name: 'LandingPage' };
      }
      handlePush(loginRoute);
    }
  } else if (errorCode === 403) {
    let explanation;
    let ec;
    let projectId;
    if (error.response && error.response.data && error.response.data.explanation) {
      ({ explanation, errorCode: ec, projectId } = error.response.data);
    }
    if (explanation && ec === 'private_project') {
      // abort any in-flight requests
      // eslint-disable-next-line no-undef
      cancellationController.abort();
      // eslint-disable-next-line no-undef
      cancellationController = new AbortController(); // abort controller is consumed after use, need to re-create
      handlePush({ name: 'PrivateProjectAccessRequestPage', params: { explanation, projectId } });
    } else {
      handlePush({ name: 'NotAuthorizedPage', params: { explanation } });
    }
  } else if (errorCode === 404) {
    let explanation;
    if (error.response && error.response.data && error.response.data.explanation) {
      ({ explanation } = error.response.data);
    }
    handlePush({ name: 'NotFoundPage', params: { explanation } });
  } else if (errorCode === 503 && error?.response?.data?.errorCode === 'DbUpgradeInProgress') {
    handlePush({ name: 'DbUpgradeInProgressPage' });
    return Promise.reject(error);
  } else {
    handlePush({ name: 'ErrorPage' });
  }
  return Promise.resolve({ data: {} });
}

// apply interceptor on response
axios.interceptors.response.use(
  (response) => response,
  errorResponseHandler,
);

export default errorResponseHandler;
