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
import dayjs from 'dayjs';

const moment = require('moment-timezone');

describe('Skill Reuse and Dashboard Tests', () => {

    beforeEach(() => {
        cy.createProject(1);
        cy.createSubject(1, 1);
        cy.createSkill(1, 1, 1);
        cy.createSubject(1, 2);
    });

    it('Search and Navigate directly to a skill properly labels reused skills', () => {
        cy.reuseSkillIntoAnotherSubject(1, 1, 2);
        cy.createSkillsGroup(1, 1, 12);
        cy.reuseSkillIntoAnotherGroup(1, 1, 1, 12);

        cy.visit('/administrator/projects/proj1/');

        cy.get('input.vs__search')
            .invoke('attr', 'placeholder')
            .should('contain', 'Search and Navigate directly to a skill');
        cy.get('[data-cy="skillsSelector"]')
            .click();
        cy.get('[data-cy="skillsSelector"]')
            .contains('Type to search for skills')
            .should('be.visible');
        cy.get('[data-cy="skillsSelector"]')
            .type('s');

        cy.get('[data-cy="skillsSelector"] [data-cy="skillsSelector-skillId"]')
            .should('have.length', 3)
            .as('skillIds');
        cy.get('@skillIds')
            .eq(0)
            .contains('skill1');
        cy.get('@skillIds')
            .eq(1)
            .contains('skill1');
        cy.get('@skillIds')
            .eq(2)
            .contains('skill1');

        cy.get('[data-cy="skillsSelector"] [data-cy="skillsSelector-skillName"]')
            .should('have.length', 3)
            .as('skillIds');
        cy.get('@skillIds')
            .eq(0)
            .find('[data-cy="reusedBadge"]')
            .should('not.exist');
        cy.get('@skillIds')
            .eq(1)
            .find('[data-cy="reusedBadge"]');
        cy.get('@skillIds')
            .eq(2)
            .find('[data-cy="reusedBadge"]');

        cy.get('[data-cy="skillsSelector"] [data-cy="skillsSelector-groupName"]')
            .should('have.length', 1)
            .as('skillIds');
        cy.get('@skillIds')
            .eq(0)
            .contains('Awesome Group 12 Subj1');
    });

    it('reused skills must NOT be available for badges', () => {
        cy.reuseSkillIntoAnotherSubject(1, 1, 2);
        cy.createSkillsGroup(1, 1, 12);
        cy.reuseSkillIntoAnotherGroup(1, 1, 1, 12);
        cy.createBadge(1, 1);

        cy.visit('/administrator/projects/proj1/badges/badge1');
        cy.get('[data-cy="skillsSelector"]')
            .click();
        cy.get('[data-cy="skillsSelector"] [data-cy="skillsSelector-skillId"]')
            .should('have.length', 1)
            .as('skillIds');
        cy.get('@skillIds')
            .eq(0)
            .contains('skill1');
    });

    it('reused skills must NOT be available for dependencies', () => {
        cy.createSkill(1, 1, 10);
        cy.reuseSkillIntoAnotherSubject(1, 1, 2);
        cy.createSkillsGroup(1, 1, 12);
        cy.reuseSkillIntoAnotherGroup(1, 1, 1, 12);

        cy.visit('/administrator/projects/proj1/subjects/subj1/skills/skill10/dependencies');
        cy.get('[data-cy="skillsSelector"]')
            .click();
        cy.get('[data-cy="skillsSelector"] [data-cy="skillsSelector-skillId"]')
            .should('have.length', 1)
            .as('skillIds');
        cy.get('@skillIds')
            .eq(0)
            .contains('skill1');
    });

    it('cannot initiate reuse when finalization is pending', () => {
        cy.createSkill(1, 1, 1);
        cy.createSkill(1, 1, 2);
        cy.exportSkillToCatalog(1, 1, 1);
        cy.exportSkillToCatalog(1, 1, 2);

        cy.createProject(2);
        cy.createSubject(2, 1);
        cy.createSubject(2, 2);
        cy.createSkill(2, 1, 11);

        cy.importSkillFromCatalog(2, 1, 1, 1);
        cy.importSkillFromCatalog(2, 1, 1, 2);

        cy.visit('/administrator/projects/proj2/subjects/subj1/');
        cy.get('[data-cy="skillSelect-skill11"]')
            .click({ force: true });
        cy.get('[data-cy="skillActionsBtn"]')
            .click();
        cy.get('[data-cy="skillReuseBtn"]')
            .click();
        cy.get('[data-cy="reuseModalContent"]')
            .contains('Cannot initiate skill reuse while skill finalization is pending');
    });

    it('cannot initiate reuse when finalization is running', () => {
        cy.createSkill(1, 1, 1);
        cy.createSkill(1, 1, 2);
        cy.exportSkillToCatalog(1, 1, 1);
        cy.exportSkillToCatalog(1, 1, 2);

        cy.createProject(2);
        cy.createSubject(2, 1);
        cy.createSubject(2, 2);
        cy.createSkill(2, 1, 11);
        cy.createSkill(2, 2, 22);

        cy.importSkillFromCatalog(2, 1, 1, 1);
        cy.importSkillFromCatalog(2, 1, 1, 2);

        cy.visit('/administrator/projects/proj2/subjects/subj1/');
        cy.get('[data-cy="skillSelect-skill11"]');
        cy.get('[data-cy="finalizeBtn"]')
            .click();
        cy.get('[data-cy="doPerformFinalizeButton"]')
            .click();
        cy.get('[data-cy="skillSelect-skill11"]')
            .click({ force: true });
        cy.get('[data-cy="skillActionsBtn"]')
            .click();
        cy.get('[data-cy="skillReuseBtn"]')
            .click();
        cy.get('[data-cy="reuseModalContent"]')
            .contains('Cannot initiate skill reuse while skill finalization is pending');
        cy.waitForBackendAsyncTasksToComplete();
    });

    it('skill metrics should support reused skills', () => {
        // cy.createSkill(1, 1, 10);

        // cy.createSkillsGroup(1, 1, 12);
        // cy.reuseSkillIntoAnotherGroup(1, 1, 1, 12);
        cy.reuseSkillIntoAnotherSubject(1, 1, 2);

        cy.reportSkill(1, 1, 'user1');
        cy.reportSkill(1, 1, 'user0');

        const dateFormat = 'YYYY-MM-DD HH:mm';
        cy.reportSkill(1, 1, 'user2', moment.utc()
            .subtract(1, 'days')
            .format(dateFormat));
        cy.reportSkill(1, 1, 'user2', moment.utc()
            .subtract(2, 'days')
            .format(dateFormat));
        cy.reportSkill(1, 1, 'user3', moment.utc()
            .subtract(3, 'days')
            .format(dateFormat));
        cy.reportSkill(1, 1, 'user3', moment.utc()
            .subtract(5, 'days')
            .format(dateFormat));
        cy.reportSkill(1, 1, 'user4', moment.utc()
            .subtract(5, 'days')
            .format(dateFormat));
        cy.reportSkill(1, 1, 'user4', moment.utc()
            .subtract(6, 'days')
            .format(dateFormat));

        cy.waitForBackendAsyncTasksToComplete();

        cy.visit('/administrator/projects/proj1/');
        cy.clickNav('Metrics');
        cy.get('[data-cy=metricsNav-Skills]')
            .click();
        const tableSelector = '[data-cy=skillsNavigator-table]';

        const expectedSkillNames = [
            [{
                colIndex: 0,
                value: 'Very Great Skill 1'
            }, {
                colIndex: 1,
                value: 3
            }, {
                colIndex: 2,
                value: 2
            },],
            [{
                colIndex: 0,
                value: 'Very Great Skill 1'
            }, {
                colIndex: 0,
                value: 'Reused'
            }, {
                colIndex: 1,
                value: 3
            }, {
                colIndex: 2,
                value: 2
            },],
        ];
        cy.validateTable(tableSelector, expectedSkillNames);
    });

});