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
import Vue, { createApp } from 'vue';
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
import {
  Form, Field, ErrorMessage,
} from 'vee-validate';
import en from 'vee-validate';
import Vuex from 'vuex';
import VueApexCharts from 'vue-apexcharts';
import VueAnnouncer from '@vue-a11y/announcer';
import dayjs from '@/common-components/DayJsCustomizer';
import PageVisitService from '@/components/PageVisitService';
import InceptionConfigurer from './InceptionConfigurer';
import SkillsReporterDirective from './directives/SkillsReporterDirective';
import 'babel-polyfill';
import 'matchmedia-polyfill';
import 'matchmedia-polyfill/matchMedia.addListener';
import '@/common-components/filter/ByteFilter';
import timeDuration from '@/common-components/filter/FormatDurationFilter';
import formatNum from '@/common-components/filter/NumberFormatter';
import timeFromNow from '@/common-components/filter/TimeFromNowFilter';
import formatDatesDuration from '@/common-components/filter/DatesDurationFilter';
import formatRelativeTime from '@/common-components/filter/RelativeTimeFilter';
import formatUserRole from '@/filters/UserRoleFilter';
import truncate from '@/filters/TruncateFilter';
import formatDate from '@/filters/DateFilter';
import './directives/SkillsOnMountDirective';
import RegisterValidators from './validators/RegisterValidators';
import './directives/FocusDirective';
import App from './App';
import router from './router';
import store from './store/store';
import { setupNavGuards } from '@/router/RouterNavGuards'
import { configureCompat } from 'vue'

configureCompat({
  MODE: 2,
  // COMPONENT_V_MODEL: false,
  // RENDER_FUNCTION: true,
});

Vue.component('apexchart', VueApexCharts);
Vue.component('Form', Form);
Vue.component('Field', Field);
Vue.component('ErrorMessage', ErrorMessage);
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

// localize({
//   en,
// });

// setInteractionMode('custom', () => ({ on: ['input', 'change'] }));
Vue.config.productionTip = false;
window.dayjs = dayjs;

window.axios = require('axios');

window.cancellationController = new AbortController();

require('./interceptors/errorHandler');
require('./interceptors/clientVersionInterceptor');
require('./interceptors/userAgreementInterceptor');
require('./interceptors/upgradeInProgressInterceptor');
require('./interceptors/globalCancelInterceptor');

// const router = createDashboardRouter(store);

store.dispatch('loadConfigState').then(() => {
  Vue.use(VueAnnouncer, {}, router);
  setupNavGuards();
  RegisterValidators.init();
  store.dispatch('restoreSessionIfAvailable').then(() => {
    InceptionConfigurer.configure();
    /* eslint-disable no-new */
    // const vm = new Vue({
    //   el: '#app',
    //   router,
    //   components: { App },
    //   template: '<App/>',
    //   store,
    // });
    const vm = createApp(App);
    vm.use(store);
    vm.use(router);
    vm.mount('#app');
    // window.vm = vm;
    vm.config.globalProperties.$filters = {
      formatNum,
      formatUserRole,
      formatDate,
      timeFromNow,
      timeDuration,
      formatDatesDuration,
      truncate,
      formatRelativeTime
    }
  });
});
