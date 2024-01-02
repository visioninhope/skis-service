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
import Vue from 'vue';
import SettingsService from '../../components/settings/SettingsService';

const getters = {
  config(state) {
    return state.config;
  },
  isPkiAuthenticated(state) {
    return state?.config?.authMode === 'PKI';
  },
  isEmailEnabled(state) {
    return state.emailEnabled;
  },
};

const mutations = {
  setConfig(state, value) {
    state.config = value;
  },
  setDbUpgradeInProgress(state, value) {
    Vue.set(state.config, 'dbUpgradeInProgress', value);
  },
  setEmailEnabled(state, value) {
    if (value === true) {
      state.emailEnabled = true;
    } else {
      state.emailEnabled = false;
    }
  },
};

const actions = {
  loadConfigState({ commit }) {
    return new Promise((resolve, reject) => {
      SettingsService.getConfig()
        .then((response) => {
          commit('setConfig', response);
          resolve(response);
        })
        .catch((error) => reject(error));
    });
  },
  updateDbUpgradeInProgressIfDifferent({ commit, state }, incomingValue) {
    if (state.config && (state.config.dbUpgradeInProgress === undefined || state.config.dbUpgradeInProgress !== incomingValue)) {
      commit('setDbUpgradeInProgress', incomingValue);
    }
  },
  loadEmailEnabled({ commit }) {
    return new Promise((resolve, reject) => {
      SettingsService.isEmailServiceSupported()
        .then((enabled) => {
          commit('setEmailEnabled', enabled);
        })
        .catch((error) => reject(error));
    });
  },
};

const state = {
  config: null,
  emailEnabled: false,
};

export default {
  namespaced: false,
  state,
  getters,
  mutations,
  actions,
};
