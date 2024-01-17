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
import AccessService from '../../components/access/AccessService'

const actions = {
  isSupervisor({ commit }) {
    return new Promise((resolve, reject) => {
      AccessService.hasRole('ROLE_SUPERVISOR')
        .then((result) => {
          commit('supervisor', result)
          resolve(result)
        })
        .catch((error) => reject(error))
    })
  },
  isRoot({ commit }) {
    return new Promise((resolve, reject) => {
      AccessService.hasRole('ROLE_SUPER_DUPER_USER')
        .then((result) => {
          commit('root', result)
          resolve(result)
        })
        .catch((error) => reject(error))
    })
  }
}

const mutations = {
  supervisor(state, value) {
    state.isSupervisor = value
  },
  root(state, value) {
    state.isRoot = value
  }
}

const getters = {
  isSupervisor(state) {
    return state.isSupervisor
  },
  isRoot(state) {
    return state.isRoot
  }
}

const state = {
  isSupervisor: null,
  isRoot: null
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
