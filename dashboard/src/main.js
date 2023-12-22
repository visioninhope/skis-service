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
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import {
  ButtonPlugin,
  ToastPlugin,
  ButtonGroupPlugin,
  TooltipPlugin,
  ModalPlugin,
  LayoutPlugin,
  FormRadioPlugin,
  AlertPlugin,
  FormSelectPlugin,
  SpinnerPlugin,
  TabsPlugin,
  FormTextareaPlugin,
  LinkPlugin,
  DropdownPlugin,
  AvatarPlugin,
  TablePlugin,
  FormInputPlugin,
  FormCheckboxPlugin,
  InputGroupPlugin,
  CardPlugin,
  PaginationPlugin,
  CollapsePlugin,
  OverlayPlugin,
  BadgePlugin,
  PopoverPlugin,
  FormPlugin,
  FormGroupPlugin,
  FormDatepickerPlugin,
  ProgressPlugin,
  BIcon,
  BIconQuestion,
  ListGroupPlugin,
  FormFilePlugin,
  FormRatingPlugin,
  BFormSpinbutton,
} from 'bootstrap-vue';

import { SkillsConfiguration, SkillsReporter } from '@skilltree/skills-client-js';
// import {
//   localize, ValidationProvider, ValidationObserver, setInteractionMode,
// } from 'vee-validate';
import en from 'vee-validate';
import Vuex from 'vuex';
import VueApexCharts from 'vue-apexcharts';
import VueAnnouncer from '@vue-a11y/announcer';
import FiltersPlugin from '@/common-components/filter/FiltersPlugin';
import TimeDurationFilter from '@/common-components/filter/TimeDurationFilter';
import dayjs from '@/common-components/DayJsCustomizer';
import '@/common-components/filter/ByteFilter';
import '@/common-components/filter/FormatDurationFilter';
import PageVisitService from '@/components/PageVisitService';
import InceptionConfigurer from './InceptionConfigurer';
import SkillsReporterDirective from './directives/SkillsReporterDirective';
import 'babel-polyfill';
import 'matchmedia-polyfill';
import 'matchmedia-polyfill/matchMedia.addListener';
// import './filters/NumberFilter';
import './filters/TruncateFilter';
import './filters/DateFilter';
import './filters/UserRoleFilter';
// import './filters/TimeFromNowFilter';
import './directives/SkillsOnMountDirective';
// import RegisterValidators from './validators/RegisterValidators';
import './directives/FocusDirective';
import App from './App';
import router from './router';
import store from './store/store';

Vue.component('apexchart', VueApexCharts);
// Vue.component('ValidationProvider', ValidationProvider);
// Vue.component('ValidationObserver', ValidationObserver);
Vue.use(Vuex);

Vue.use(ButtonPlugin);
Vue.use(ToastPlugin);
Vue.use(TooltipPlugin);
Vue.use(LayoutPlugin);
Vue.use(FormRadioPlugin);
Vue.use(AlertPlugin);
Vue.use(FormSelectPlugin);
Vue.use(ModalPlugin);
Vue.use(SpinnerPlugin);
Vue.use(TabsPlugin);
Vue.use(FormTextareaPlugin);
Vue.use(LinkPlugin);
Vue.use(DropdownPlugin);
Vue.use(AvatarPlugin);
Vue.use(ButtonGroupPlugin);
Vue.use(TablePlugin);
Vue.use(FormInputPlugin);
Vue.use(InputGroupPlugin);
Vue.use(FormCheckboxPlugin);
Vue.use(CardPlugin);
Vue.use(PaginationPlugin);
Vue.use(CollapsePlugin);
Vue.use(OverlayPlugin);
Vue.use(BadgePlugin);
Vue.use(PopoverPlugin);
Vue.use(FormPlugin);
Vue.use(FormGroupPlugin);
Vue.use(FormDatepickerPlugin);
Vue.use(ProgressPlugin);
Vue.use(ListGroupPlugin);
Vue.use(FormRatingPlugin);
Vue.use(TimeDurationFilter);
Vue.use(FormFilePlugin);
Vue.component('BIcon', BIcon);
Vue.component('BIconQuestion', BIconQuestion);
Vue.component('b-form-spinbutton', BFormSpinbutton);

const install = (vue) => {
  vue.directive('skills', SkillsReporterDirective);
};

window.SkillsReporterDirective = SkillsReporterDirective;
Vue.use(install);
SkillsReporterDirective.install = install;

Vue.use(FiltersPlugin);
Vue.use(VueAnnouncer, {}, router);

localize({
  en,
});

setInteractionMode('custom', () => ({ on: ['input', 'change'] }));
Vue.config.productionTip = false;
window.dayjs = dayjs;

window.axios = require('axios');

window.cancellationController = new AbortController();

require('./interceptors/errorHandler');
require('./interceptors/clientVersionInterceptor');
require('./interceptors/userAgreementInterceptor');
require('./interceptors/upgradeInProgressInterceptor');
require('./interceptors/globalCancelInterceptor');

const isActiveProjectIdChange = (to, from) => to.params.projectId !== from.params.projectId;
const isAdminPage = (route) => route.path.startsWith('/administrator');
const isLoggedIn = () => store.getters.isAuthenticated;
const isPki = () => store.getters.isPkiAuthenticated;
const getLandingPage = () => {
  let landingPage = 'MyProgressPage';
  if (store.getters.userInfo) {
    if (store.getters.userInfo.landingPage === 'admin') {
      landingPage = 'AdminHomePage';
    }
  }
  return landingPage;
};

router.beforeEach((to, from, next) => {
  const { skillsClientDisplayPath } = to.query;
  store.commit('skillsClientDisplayPath', { path: skillsClientDisplayPath, fromDashboard: true });

  const requestAccountPath = '/request-root-account';
  if (!isPki() && !isLoggedIn() && to.path !== requestAccountPath && store.getters.config.needToBootstrap) {
    next({ path: requestAccountPath });
  } else if (!isPki() && to.path === requestAccountPath && !store.getters.config.needToBootstrap) {
    next({ name: getLandingPage() });
  } else {
    /* eslint-disable no-lonely-if */
    if (store.state.showUa && (to.path !== '/user-agreement' && to.path !== '/skills-login')) {
      let p = '';
      if (to.query?.redirect) {
        p = to.query.redirect;
      } else {
        p = to.fullPath;
      }
      const ua = p !== '/' ? { name: 'UserAgreement', query: { redirect: p } } : { name: 'UserAgreement' };
      next(ua);
    } else {
      if (to.path === '/') {
        const landingPageRoute = { name: getLandingPage() };
        next(landingPageRoute);
      }
      if (from.path !== '/error') {
        store.commit('previousUrl', from.fullPath);
      }
      if (isActiveProjectIdChange(to, from)) {
        store.commit('currentProjectId', to.params.projectId);
        if (isAdminPage(to) && to.params.projectId) {
          store.dispatch('loadProjConfigState', { projectId: to.params.projectId });
        }
      }
      if (to.path.startsWith('/administrator/quizzes/') && to.params.quizId && to.params.quizId !== from.params.quizId) {
        store.dispatch('loadQuizConfigState', { quizId: to.params.quizId });
      }
      if (to.matched.some((record) => record.meta.requiresAuth)) {
        // this route requires auth, check if logged in if not, redirect to login page.
        if (!isLoggedIn()) {
          const newRoute = { query: { redirect: to.fullPath } };
          if (isPki()) {
            newRoute.name = getLandingPage();
          } else {
            newRoute.name = 'Login';
          }
          next(newRoute);
        } else {
          next();
        }
      } else {
        next();
      }
    }
  }
});

const DEFAULT_TITLE = 'SkillTree Dashboard';
router.afterEach((to, from) => {
  if (to.meta.reportSkillId) {
    SkillsConfiguration.afterConfigure()
      .then(() => {
        SkillsReporter.reportSkill(to.meta.reportSkillId);
      });
  }
  if (isPki() || isLoggedIn()) {
    PageVisitService.reportPageVisit(to.path, to.fullPath);
  }
  // Use next tick to handle router history correctly
  // see: https://github.com/vuejs/vue-router/issues/914#issuecomment-384477609
  Vue.nextTick(() => {
    let newTitle = DEFAULT_TITLE;
    if (to && to.meta && to.meta.announcer && to.meta.announcer.message) {
      newTitle = `${DEFAULT_TITLE} - ${to.meta.announcer.message}`;
    }
    document.title = newTitle;
  });

  // this hack is needed because otherwise when navigating between
  // pages the focus is placed onto the next visible element which in case of
  // drilling-down (for example projects page into a single project page)
  // the focus is placed on the next tabbable element which happens to in the footer
  // (when skills.config.ui.supportLinkN properties are utilized)
  if (from.name !== to.name) {
    setTimeout(() => {
      Vue.nextTick(() => {
        const preSkipButtonPlaceholder = document.querySelector('#preSkipToContentPlaceholder');
        if (preSkipButtonPlaceholder) {
          preSkipButtonPlaceholder.setAttribute('tabindex', 0);
          preSkipButtonPlaceholder.focus();
          preSkipButtonPlaceholder.setAttribute('tabindex', -1);
        }
      });
    }, 150);
  }
});

store.dispatch('loadConfigState').finally(() => {
  // RegisterValidators.init();
  store.dispatch('restoreSessionIfAvailable').finally(() => {
    InceptionConfigurer.configure();
    /* eslint-disable no-new */
    const vm = new Vue({
      el: '#app',
      router,
      components: { App },
      template: '<App/>',
      store,
    });
    window.vm = vm;
  });
});
