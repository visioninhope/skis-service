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
import dayjs from '@/common-components/DayJsCustomizer';
import timeDuration from '@/common-components/filter/FormatDurationFilter';
import simpleClockFilter from '@/common-components/filter/SimpleClockFilter';

const formatDatesDuration = (startDate, completedDate, detailedDays, asClock = false) => {
  const start = dayjs(startDate);
  const end = completedDate ? dayjs(completedDate) : dayjs();
  const valueInMs = end.diff(start);
  return asClock ? simpleClockFilter(valueInMs) : timeDuration(valueInMs, false, detailedDays);
};

export default formatDatesDuration;
