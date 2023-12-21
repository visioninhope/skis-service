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
describe('Badges Tests', () => {

    const tableSelector = '[data-cy="simpleSkillsTable"]';
    const makdownDivSelector = '#markdown-editor div.toastui-editor-main.toastui-editor-ww-mode > div > div.toastui-editor-ww-container > div > div'
    beforeEach(() => {
        cy.request('POST', '/app/projects/proj1', {
            projectId: 'proj1',
            name: 'proj1'
        })
            .as('createProject');

        Cypress.Commands.add('gemStartNextMonth', () => {
            cy.get('[data-cy="startDatePicker"] header .next')
                .first()
                .click();
        });
        Cypress.Commands.add('gemStartPrevMonth', () => {
            cy.get('[data-cy="startDatePicker"] header .prev')
                .first()
                .click();
        });
        Cypress.Commands.add('gemEndNextMonth', () => {
            cy.get('[data-cy="endDatePicker"] header .next')
                .first()
                .click();
        });
        Cypress.Commands.add('gemEndPrevMonth', () => {
            cy.get('[data-cy="endDatePicker"] header .prev')
                .first()
                .click();
        });
        Cypress.Commands.add('gemStartSetDay', (dayNum) => {
            cy.get('[data-cy="startDatePicker"] .day')
                .contains(dayNum)
                .click();
        });
        Cypress.Commands.add('gemEndSetDay', (dayNum) => {
            cy.get('[data-cy="endDatePicker"] .day')
                .contains(dayNum)
                .click();
        });

        cy.intercept('POST', '/admin/projects/proj1/badgeNameExists')
            .as('nameExistsCheck');
        cy.intercept('GET', '/admin/projects/proj1/badges')
            .as('loadBadges');

    });

    it('create badge with special chars', () => {
        const expectedId = 'LotsofspecialPcharsBadge';
        const providedName = '!L@o#t$s of %s^p&e*c(i)a_l++_|}{P/ c\'ha\'rs';

        cy.intercept('POST', `/admin/projects/proj1/badges/${expectedId}`)
            .as('postNewBadge');
        cy.intercept('POST', '/admin/projects/proj1/badgeNameExists')
            .as('nameExistsCheck');
        cy.intercept('GET', '/admin/projects/proj1/badges')
            .as('loadBadges');

        cy.get('@createProject')
            .should((response) => {
                expect(response.status)
                    .to
                    .eql(200);
            });

        cy.visit('/administrator/projects/proj1/badges');
        cy.wait('@loadBadges');
        cy.clickButton('Badge');

        cy.get('#badgeName')
            .type(providedName);

        cy.wait('@nameExistsCheck');

        cy.getIdField()
            .should('have.value', expectedId);

        cy.clickSave();
        cy.wait('@postNewBadge');

        cy.contains('ID: Lotsofspecial');
    });

    it('create badge with enter key', () => {
        const expectedId = 'LotsofspecialPcharsBadge';
        const providedName = '!L@o#t$s of %s^p&e*c(i)a_l++_|}{P/ c\'ha\'rs';

        cy.intercept('POST', `/admin/projects/proj1/badges/${expectedId}`)
            .as('postNewBadge');
        cy.intercept('POST', '/admin/projects/proj1/badgeNameExists')
            .as('nameExistsCheck');
        cy.intercept('GET', '/admin/projects/proj1/badges')
            .as('loadBadges');

        cy.get('@createProject')
            .should((response) => {
                expect(response.status)
                    .to
                    .eql(200);
            });

        cy.visit('/administrator/projects/proj1/badges');
        cy.wait('@loadBadges');
        cy.clickButton('Badge');

        cy.get('#badgeName')
            .type(providedName);

        cy.wait('@nameExistsCheck');

        cy.getIdField()
            .should('have.value', expectedId);

        cy.get('#badgeName')
            .type('{enter}');
        cy.wait('@postNewBadge');

        cy.contains('ID: Lotsofspecial');
    });

    it('Close badge dialog', () => {
        cy.intercept('GET', '/admin/projects/proj1/badges')
            .as('loadBadges');

        cy.get('@createProject')
            .should((response) => {
                expect(response.status)
                    .to
                    .eql(200);
            });

        cy.visit('/administrator/projects/proj1/badges');
        cy.wait('@loadBadges');
        cy.clickButton('Badge');
        cy.get('[data-cy=closeBadgeButton]')
            .click();
        //have to wait for dialog to close
        cy.wait(500);
        cy.get('[data-cy=closeBadgeButton]')
            .should('not.exist');
    });

    it('cannot publish badge with no skills', () => {
        cy.intercept('POST', `/admin/projects/proj1/badges/anameBadge`)
            .as('postNewBadge');
        cy.intercept('POST', '/admin/projects/proj1/badgeNameExists')
            .as('nameExistsCheck');
        cy.intercept('GET', '/admin/projects/proj1/badges')
            .as('loadBadges');

        cy.get('@createProject')
            .should((response) => {
                expect(response.status)
                    .to
                    .eql(200);
            });

        cy.visit('/administrator/projects/proj1/badges');
        cy.wait('@loadBadges');
        cy.clickButton('Badge');

        cy.get('#badgeName')
            .type('a name');

        cy.wait('@nameExistsCheck');

        cy.getIdField()
            .should('have.value', 'anameBadge');

        cy.clickSave();
        cy.wait('@postNewBadge');
        cy.get('[data-cy=badgeStatus]')
            .contains('Status: Disabled')
            .should('exist');
        cy.get('[data-cy=goLive]')
            .click();
        cy.contains('This Badge has no assigned Skills. A Badge cannot be published without at least one assigned Skill.')
            .should('be.visible');
        cy.get('[data-cy=badgeStatus]')
            .contains('Status: Disabled')
            .should('exist');
    });

    it('inactive badge displays warning', () => {
        const expectedId = 'InactiveBadge';
        const providedName = 'Inactive';

        cy.intercept('GET', '/app/userInfo')
            .as('getUserInfo');
        cy.intercept('GET', '/app/userInfo/hasRole/ROLE_SUPERVISOR')
            .as('hasSupervisor');
        cy.intercept('POST', `/admin/projects/proj1/badges/${expectedId}`)
            .as('postNewBadge');
        cy.intercept('POST', '/admin/projects/proj1/badgeNameExists')
            .as('nameExistsCheck');
        cy.intercept('GET', '/admin/projects/proj1/badges')
            .as('loadBadges');

        cy.get('@createProject')
            .should((response) => {
                expect(response.status)
                    .to
                    .eql(200);
            });

        cy.visit('/administrator/projects/proj1/badges');

        cy.wait('@loadBadges');
        cy.wait('@getUserInfo');
        cy.wait('@hasSupervisor');
        cy.clickButton('Badge');

        cy.get('#badgeName')
            .type(providedName);

        cy.wait('@nameExistsCheck');

        cy.clickSave();
        cy.wait('@postNewBadge');

        cy.get('div.card-body i.fa-exclamation-circle')
            .should('be.visible');
    });

    it('name causes id to fail validation', () => {
        cy.intercept('GET', '/public/config', (req) => {
            req.reply((res) => {
                const conf = res.body;
                conf.maxIdLength = 50;
                res.send(conf);
            });
        })
            .as('loadConfig');
        cy.request('POST', '/admin/projects/proj1/badges/badgeExist', {
            projectId: 'proj1',
            name: 'Badge Exist',
            badgeId: 'badgeExist'
        });

        cy.visit('/administrator/projects/proj1/badges');
        cy.clickButton('Badge');
        cy.contains('New Badge');

        // name causes id to be too long
        const msg = 'Badge ID cannot exceed 50 characters';
        const validNameButInvalidId = Array(46)
            .fill('a')
            .join('');
        cy.get('[data-cy=badgeName]')
            .click();
        cy.get('[data-cy=badgeName]')
            .fill(validNameButInvalidId);
        cy.get('[data-cy=idError]')
            .should('be.visible');
        cy.get('[data-cy=saveBadgeButton]')
            .should('be.disabled');
        cy.get('[data-cy=badgeName]')
            .type('{backspace}');
        cy.get('[data-cy=idError]')
            .should('not.be.visible');
        cy.get('[data-cy=saveBadgeButton]')
            .should('be.enabled');
    });

    it('badge validation', () => {
        // create existing badge
        cy.request('POST', '/admin/projects/proj1/badges/badgeExist', {
            projectId: 'proj1',
            name: 'Badge Exist',
            badgeId: 'badgeExist'
        });

        cy.intercept('POST', '/api/validation/url')
            .as('customUrlValidation');

        cy.visit('/administrator/projects/proj1/badges');
        cy.clickButton('Badge');
        cy.contains('New Badge');

        const overallFormValidationMsg = 'Form did NOT pass validation, please fix and try to Save again';

        // name is too short
        let msg = 'Badge Name cannot be less than 3 characters';
        cy.get('#badgeName')
            .type('Te');
        cy.get('[data-cy=badgeNameError]')
            .contains(msg)
            .should('be.visible');
        cy.get('[data-cy=saveBadgeButton]')
            .should('be.disabled');
        cy.get('#badgeName')
            .type('Tes');
        cy.get('[data-cy=badgeNameError]')
            .should('not.be.visible');

        // name too long
        msg = 'Badge Name cannot exceed 50 characters';
        cy.contains('Enable')
            .click();
        cy.getIdField()
            .clear()
            .type('badgeId');
        const invalidName = Array(50)
            .fill('a')
            .join('');
        cy.get('#badgeName')
            .clear();
        cy.get('#badgeName')
            .type(invalidName);
        cy.get('#badgeName')
            .type('b');
        cy.get('[data-cy=badgeNameError]')
            .contains(msg)
            .should('be.visible');
        cy.get('[data-cy=saveBadgeButton]')
            .should('be.disabled');
        cy.get('#badgeName')
            .type('{backspace}');
        cy.get('[data-cy=badgeNameError]')
            .should('not.be.visible');

        // id too short
        msg = 'Badge ID cannot be less than 3 characters';
        cy.getIdField()
            .clear()
            .type('aa');
        cy.get('[data-cy=idError]')
            .contains(msg)
            .should('be.visible');
        cy.get('[data-cy=saveBadgeButton]')
            .should('be.disabled');
        cy.getIdField()
            .type('a');
        cy.get('[data-cy=idError]')
            .should('not.be.visible');

        // id too long
        msg = 'Badge ID cannot exceed 100 characters';
        const invalidId = Array(101)
            .fill('a')
            .join('');
        cy.getIdField()
            .clear();
        cy.getIdField()
            .click()
            .type(invalidId);
        cy.get('[data-cy=idError]')
            .contains(msg)
            .should('be.visible');
        cy.getIdField()
            .type('{backspace}');
        cy.get('[data-cy=idError]')
            .should('not.be.visible');

        // id must not have special chars
        msg = 'Badge ID may only contain alpha-numeric characters';
        cy.getIdField()
            .clear()
            .type('With$Special');
        cy.get('[data-cy=idError]')
            .contains(msg)
            .should('be.visible');
        cy.getIdField()
            .clear()
            .type('GoodToGo');
        cy.get('[data-cy=idError]')
            .should('not.be.visible');

        cy.getIdField()
            .clear()
            .type('SomeId');
        // !L@o#t$s of %s^p&e*c(i)a_l++_|}{P/ c'ha'rs
        let specialChars = [' ', '!', '@', '#', '^', '&', '*', '(', ')', '-', '+', '='];
        specialChars.forEach((element) => {
            cy.getIdField()
                .type(element);
            cy.get('[data-cy=idError]')
                .contains(msg)
                .should('be.visible');
            cy.getIdField()
                .type('{backspace}');
            cy.get('[data-cy=idError]')
                .should('not.be.visible');
        });

        // badge name must not be already taken
        msg = 'The value for Badge Name is already taken';
        cy.get('#badgeName')
            .clear()
            .type('Badge Exist');
        cy.get('[data-cy=badgeNameError]')
            .contains(msg)
            .should('be.visible');
        cy.get('#badgeName')
            .type('1');
        cy.get('[data-cy=badgeNameError]')
            .should('not.be.visible');

        // badge id must not already exist
        msg = 'The value for Badge ID is already taken';
        cy.getIdField()
            .clear()
            .type('badgeExist');
        cy.get('[data-cy=idError]')
            .contains(msg)
            .should('be.visible');
        cy.getIdField()
            .type('1');
        cy.get('[data-cy=idError]')
            .should('not.be.visible');

        // max description
        msg = 'Badge Description cannot exceed 2000 characters';
        const invalidDescription = Array(2000)
            .fill('a')
            .join('');
        // it takes way too long using .type method
        cy.get(makdownDivSelector)
            .invoke('text', invalidDescription);
        cy.get('#markdown-editor')
            .type('a');
        cy.get('[data-cy=badgeDescriptionError]')
            .contains(msg)
            .should('be.visible');
        cy.get('#markdown-editor')
            .type('{backspace}');
        cy.get('[data-cy=badgeDescriptionError]')
            .should('not.be.visible');

        //helpUrl
        cy.get('[data-cy=skillHelpUrl]')
            .clear()
            .type('javascript:alert("uh oh");');
        cy.get('[data-cy=skillHelpUrlError]')
            .should('be.visible');
        cy.get('[data-cy=skillHelpUrlError]')
            .should('have.text', 'Help URL/Path must start with "/" or "http(s)"');
        cy.get('[data-cy=saveBadgeButton]')
            .should('be.disabled');
        cy.get('[data-cy=skillHelpUrl]')
            .clear()
            .type('/foo?p1=v1&p2=v2');
        cy.get('[data-cy=skillHelpUrlError]')
            .should('not.be.visible');
        cy.get('[data-cy=saveBadgeButton]')
            .should('be.enabled');
        cy.get('[data-cy=skillHelpUrl]')
            .clear()
            .type('http://foo.bar?p1=v1&p2=v2');
        cy.get('[data-cy=skillHelpUrlError]')
            .should('not.be.visible');
        cy.get('[data-cy=saveBadgeButton]')
            .should('be.enabled');
        cy.get('[data-cy=skillHelpUrl]')
            .clear()
            .type('https://foo.bar?p1=v1&p2=v2');
        cy.get('[data-cy=skillHelpUrlError]')
            .should('not.be.visible');
        cy.get('[data-cy=saveBadgeButton]')
            .should('be.enabled');

        cy.get('[data-cy=skillHelpUrl]')
            .clear()
            .type('https://');
        cy.wait('@customUrlValidation');
        cy.get('[data-cy=skillHelpUrlError]')
            .should('be.visible');
        cy.get('[data-cy=saveBadgeButton]')
            .should('be.disabled');

        cy.get('[data-cy=skillHelpUrl]')
            .clear()
            .type('https://---??..??##');
        cy.wait('@customUrlValidation');
        cy.get('[data-cy=skillHelpUrlError]')
            .should('be.visible');
        cy.get('[data-cy=saveBadgeButton]')
            .should('be.disabled');
        // trailing space should work now
        cy.get('[data-cy=skillHelpUrl]')
            .clear()
            .type('https://foo.bar?p1=v1&p2=v2 ');
        cy.wait('@customUrlValidation');
        cy.get('[data-cy=skillHelpUrlError]')
            .should('not.be.visible');
        cy.get('[data-cy=saveBadgeButton]')
            .should('be.enabled');

        // finally let's save
        cy.clickSave();
        cy.wait('@loadBadges');
        cy.contains('Badge Exist1');
    });

    it('badge modal allows Help Url to have spaces', () => {
        cy.visit('/administrator/projects/proj1/badges');
        cy.get('[data-cy="btn_Badges"]').click();
        cy.get('[data-cy="badgeName"]').type('badge1')
        cy.get('[data-cy="skillHelpUrl"]').type('https://someCoolWebsite.com/some url with spaces')
        cy.get('[data-cy="skillHelpUrlError"]').should('not.be.visible');
        cy.get('[data-cy="saveBadgeButton"]').click()
        cy.get('[data-cy="badgeCard-badge1Badge"] [data-cy="editBtn"]').click()
        cy.get('[data-cy="skillHelpUrl"]').should('have.value', 'https://someCoolWebsite.com/some%20url%20with%20spaces')
    })

    it('gem start and end time validation', () => {
        cy.visit('/administrator/projects/proj1/badges');
        cy.clickButton('Badge');
        cy.contains('New Badge');
        cy.get('[data-cy="gemEditContainer"]')
            .click();
        cy.contains('Enable Gem Feature')
            .click();
        cy.contains('Start Date');

        cy.get('#badgeName')
            .type('Test Badge');

        // dates should not overlap
        let msg = 'Start Date must come before End Date';
        cy.gemStartNextMonth();
        cy.gemStartSetDay(1);
        cy.gemEndNextMonth();
        cy.gemEndSetDay(1);
        cy.get('[data-cy=endDateError]')
            .contains(msg)
            .should('be.visible');
        cy.gemEndSetDay(2);
        cy.get('[data-cy=endDateError]')
            .should('not.be.visible');

        // start date should be before end date
        msg = 'Start Date must come before End Date';
        cy.gemStartSetDay(3);
        cy.get('[data-cy=startDateError]')
            .contains(msg)
            .should('be.visible');
        cy.gemEndSetDay(4);
        cy.get('[data-cy=startDateError]')
            .should('not.be.visible');

        // dates should not be in the past
        msg = 'End Date cannot be in the past';
        cy.gemStartPrevMonth();
        cy.gemStartPrevMonth();
        cy.gemStartSetDay(1);
        cy.gemEndPrevMonth();
        cy.gemEndPrevMonth();
        cy.gemEndSetDay(2);
        cy.get('[data-cy=endDateError]')
            .contains(msg)
            .should('be.visible');

        // should not save if there are validation errors
        cy.get('[data-cy=saveBadgeButton]')
            .should('be.disabled');

        // fix the errors and save
        cy.gemStartNextMonth();
        cy.gemStartNextMonth();
        cy.gemEndNextMonth();
        cy.gemEndNextMonth();
        cy.gemStartSetDay(1);
        cy.gemEndSetDay(2);
        cy.get('[data-cy=endDateError]')
            .should('not.be.visible');
        cy.get('[data-cy=saveBadgeButton]')
            .should('be.enabled');

        cy.clickSave();
        cy.wait('@loadBadges');
        cy.contains('Test Badge');
    });

    it('Badge is disabled when created, can only be enabled once', () => {

        cy.request('POST', '/admin/projects/proj1/subjects/subj1', {
            projectId: 'proj1',
            subjectId: 'subj1',
            name: 'Subject 1'
        });
        cy.request('POST', '/admin/projects/proj1/subjects/subj1/skills/skill1', {
            projectId: 'proj1',
            subjectId: 'subj1',
            skillId: 'skill1',
            name: 'Skill 1',
            pointIncrement: '50',
            numPerformToCompletion: '5'
        });

        cy.visit('/administrator/projects/proj1/badges');
        cy.clickButton('Badge');
        cy.contains('New Badge');
        cy.get('#badgeName')
            .type('Test Badge');
        cy.clickSave();
        cy.wait('@loadBadges');

        cy.get('[data-cy=manageBtn_TestBadgeBadge]')
            .click();
        cy.wait(500);
        cy.get('[data-cy="skillsSelector2"]')
            .click();
        cy.get('[data-cy="skillsSelector2"] .vs__dropdown-option')
            .eq(0)
            .click();
        cy.contains('.router-link-active', 'Badges')
            .click();

        cy.contains('Test Badge');
        cy.get('[data-cy=badgeStatus]')
            .contains('Status: Disabled')
            .should('exist');
        cy.get('[data-cy=goLive]')
            .click();
        cy.contains('Please Confirm!')
            .should('exist');
        cy.contains('Yes, Go Live!')
            .click();

        cy.wait('@loadBadges');
        cy.contains('Test Badge');
        cy.get('[data-cy=badgeStatus]')
            .contains('Status: Live')
            .should('exist');
        cy.get('[data-cy=goLive]')
            .should('not.exist');
    });

    it('Badge is disabled when created, canceling confirm dialog leaves badge disabled', () => {

        cy.request('POST', '/admin/projects/proj1/subjects/subj1', {
            projectId: 'proj1',
            subjectId: 'subj1',
            name: 'Subject 1'
        });
        cy.request('POST', '/admin/projects/proj1/subjects/subj1/skills/skill1', {
            projectId: 'proj1',
            subjectId: 'subj1',
            skillId: 'skill1',
            name: 'Skill 1',
            pointIncrement: '50',
            numPerformToCompletion: '5'
        });

        cy.visit('/administrator/projects/proj1/badges');
        cy.clickButton('Badge');
        cy.contains('New Badge');
        cy.get('#badgeName')
            .type('Test Badge');
        cy.clickSave();
        cy.wait('@loadBadges');

        cy.get('[data-cy=manageBtn_TestBadgeBadge]')
            .click();
        cy.wait(500);
        cy.get('[data-cy="skillsSelector2"]')
            .click();
        cy.get('[data-cy="skillsSelector2"] .vs__dropdown-option')
            .eq(0)
            .click();
        cy.contains('.router-link-active', 'Badges')
            .click();

        cy.contains('Test Badge');
        cy.get('[data-cy=badgeStatus]')
            .contains('Status: Disabled')
            .should('exist');
        cy.get('[data-cy=goLive]')
            .click();
        cy.contains('Please Confirm!')
            .should('exist');
        cy.contains('Cancel')
            .click();

        cy.contains('Test Badge');
        cy.get('[data-cy=badgeStatus]')
            .contains('Status: Disabled')
            .should('exist');
        cy.get('[data-cy=badgeStatus]')
            .contains('Status: Live')
            .should('not.exist');
        cy.get('[data-cy=goLive]')
            .should('exist');
    });

    it('Can add Skill requirements to disabled badge', () => {
        cy.request('POST', '/admin/projects/proj1/subjects/subj1', {
            projectId: 'proj1',
            subjectId: 'subj1',
            name: 'Subject 1'
        });
        cy.request('POST', '/admin/projects/proj1/subjects/subj1/skills/skill1', {
            projectId: 'proj1',
            subjectId: 'subj1',
            skillId: 'skill1',
            name: 'Skill 1',
            pointIncrement: '50',
            numPerformToCompletion: '5'
        });

        cy.visit('/administrator/projects/proj1/badges');
        cy.document().its("fonts.status").should("equal", "loaded")
        // cy.wait(1000);
        cy.clickButton('Badge');
        cy.contains('New Badge');
        cy.get('#badgeName')
            .type('Test Badge');
        cy.clickSave();
        cy.wait('@loadBadges');
        cy.get('[data-cy=manageBtn_TestBadgeBadge]')
            .click();
        cy.wait(500);
        cy.get('[data-cy="skillsSelector2"]')
            .click();
        // cy.wait(500);
        cy.get('[data-cy="skillsSelector2"] .vs__dropdown-option')
            .eq(0)
            .click();
        cy.contains('.router-link-active', 'Badges')
            .click();
        cy.contains('Test Badge')
            .should('exist');
        cy.get('[data-cy=badgeStatus]')
            .contains('Status: Disabled')
            .should('exist');
        cy.get('[data-cy=goLive]')
            .click();
        cy.contains('Please Confirm!')
            .should('exist');
        cy.contains('Yes, Go Live!')
            .click();
        cy.wait('@loadBadges');
        cy.contains('Test Badge');
        cy.get('[data-cy=badgeStatus]')
            .contains('Status: Live')
            .should('exist');
    });

    it('removing last skill from enabled badge does not disable badge', () => {
        cy.request('POST', '/admin/projects/proj1/subjects/subj1', {
            projectId: 'proj1',
            subjectId: 'subj1',
            name: 'Subject 1'
        });
        cy.request('POST', '/admin/projects/proj1/subjects/subj1/skills/skill1', {
            projectId: 'proj1',
            subjectId: 'subj1',
            skillId: 'skill1',
            name: 'Skill 1',
            pointIncrement: '50',
            numPerformToCompletion: '5'
        });

        cy.visit('/administrator/projects/proj1/badges');
        cy.clickButton('Badge');
        cy.contains('New Badge');
        cy.get('#badgeName')
            .type('Test Badge');
        cy.clickSave();
        cy.wait('@loadBadges');
        cy.get('[data-cy=manageBtn_TestBadgeBadge]')
            .click();
        cy.wait(500);
        cy.get('[data-cy="skillsSelector2"]')
            .click();
        cy.get('[data-cy="skillsSelector2"] .vs__dropdown-option')
            .eq(0)
            .click();
        cy.validateTable(tableSelector, [
            [{
                colIndex: 0,
                value: 'Skill 1'
            }, {
                colIndex: 1,
                value: 'skill1'
            }],
        ], 5);

        cy.contains('.router-link-active', 'Badges')
            .click();
        cy.contains('Test Badge')
            .should('exist');
        cy.get('[data-cy=badgeStatus]')
            .contains('Status: Disabled')
            .should('exist');
        cy.get('[data-cy=goLive]')
            .click();
        cy.contains('Please Confirm!')
            .should('exist');
        cy.contains('Yes, Go Live!')
            .click();
        cy.wait('@loadBadges');
        cy.contains('Test Badge');
        cy.get('[data-cy=badgeStatus]')
            .contains('Status: Live')
            .should('exist');
        cy.get('[data-cy=manageBtn_TestBadgeBadge]')
            .click();
        cy.wait(500);
        cy.get('[data-cy=deleteSkill_skill1]')
            .click();
        cy.contains('YES, Delete It!')
            .click();
        cy.contains('No Skills Selected Yet');

        cy.contains('.router-link-active', 'Badges')
            .click();
        cy.contains('Test Badge')
            .should('exist');
        cy.get('[data-cy=badgeStatus]')
            .contains('Status: Live')
            .should('exist');
    });

    it('badge user details does not break breadcrumb bar', () => {
        cy.request('POST', '/admin/projects/proj1/subjects/subj1', {
            projectId: 'proj1',
            subjectId: 'subj1',
            name: 'Subject 1'
        });

        cy.request('POST', '/admin/projects/proj1/subjects/subj1/skills/skill1', {
            projectId: 'proj1',
            subjectId: 'subj1',
            skillId: 'skill1',
            name: 'Skill 1',
            pointIncrement: '50',
            numPerformToCompletion: '5'
        });

        cy.request('POST', '/admin/projects/proj1/badges/badge1', {
            projectId: 'proj1',
            badgeId: 'badge1',
            name: 'Badge 1',
            'iconClass': 'fas fa-ghost',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        });

        cy.request('POST', '/admin/projects/proj1/badge/badge1/skills/skill1');
        cy.request('POST', `/api/projects/proj1/skills/skill1`, {
            userId: 'someuser',
            timestamp: new Date().getTime()
        });

        cy.visit('/administrator/projects/proj1/badges/badge1');
        cy.clickNav('Users')
            .click();
        cy.get('[data-cy="usersTable"]')
            .contains('someuser')
            .click();
        cy.get('[data-cy=breadcrumb-badge1]')
            .should('be.visible');
        cy.get('[data-cy=breadcrumb-Users]')
            .should('be.visible');
    });

    it('new badge button should retain focus after dialog is closed', () => {
        cy.visit('/administrator/projects/proj1');
        cy.get('[data-cy=nav-Badges]')
            .click();

        cy.get('[aria-label="new badge"]')
            .click();
        cy.get('[data-cy=closeBadgeButton]')
            .click();
        cy.get('[aria-label="new badge"]')
            .should('have.focus');

        cy.get('[aria-label="new badge"]')
            .click();
        cy.get('[data-cy=badgeName]')
            .type('{esc}');
        cy.get('[aria-label="new badge"]')
            .should('have.focus');

        cy.get('[aria-label="new badge"]')
            .click();
        cy.get('[aria-label=Close]')
            .filter('.text-light')
            .click();
        cy.get('[aria-label="new badge"]')
            .should('have.focus');

        cy.get('[aria-label="new badge"]')
            .click();
        cy.get('[data-cy=badgeName]')
            .type('test 123');
        cy.get('[data-cy=saveBadgeButton]')
            .click();
        cy.get('[aria-label="new badge"]')
            .should('have.focus');
    });

    it('edit badge from badges page', () => {
        cy.createBadge(1, 1);
        cy.createBadge(1, 2);

        cy.visit('/administrator/projects/proj1/badges');

        cy.get('[data-cy="badgeCard-badge1"] [data-cy="titleLink"]')
            .contains('Badge 1');
        cy.get('[data-cy="badgeCard-badge1"] [data-cy="subTitle"]')
            .contains('ID: badge1');

        cy.get('[data-cy="badgeCard-badge2"] [data-cy="titleLink"]')
            .contains('Badge 2');
        cy.get('[data-cy="badgeCard-badge2"] [data-cy="subTitle"]')
            .contains('ID: badge2');

        cy.get('[data-cy="badgeCard-badge2"] [data-cy="editBtn"]')
            .click();
        cy.get('input[data-cy=badgeName]')
            .type('{selectall}Updated Name');
        cy.get('button[data-cy=saveBadgeButton]')
            .click();

        cy.get('button[data-cy=saveBadgeButton]').should('not.exist');
        cy.wait('@loadBadges')

        cy.get('[data-cy="badgeCard-badge1"] [data-cy="titleLink"]')
            .contains('Badge 1');
        cy.get('[data-cy="badgeCard-badge1"] [data-cy="subTitle"]')
            .contains('ID: badge1');

        cy.get('[data-cy="badgeCard-badge2"] [data-cy="subTitle"]')
            .contains('ID: badge2');
        cy.get('[data-cy="badgeCard-badge2"] [data-cy="titleLink"]')
            .contains('Updated Name');
    });

    it('delete badge', () => {
        cy.createBadge(1, 1);
        cy.createBadge(1, 2);

        cy.visit('/administrator/projects/proj1/badges');

        cy.get('[data-cy="badgeCard-badge1"]')
            .should('exist');
        cy.get('[data-cy="badgeCard-badge2"]')
            .should('exist');

        cy.get('[data-cy="badgeCard-badge2"] [data-cy="deleteBtn"]')
            .click();
        cy.contains('Removal Safety Check');
        cy.get('[data-cy=currentValidationText]')
            .type('Delete Me');
        cy.get('[data-cy=removeButton]')
            .should('be.enabled')
            .click();

        cy.get('[data-cy="badgeCard-badge1"]')
            .should('exist');
        cy.get('[data-cy="badgeCard-badge2"]')
            .should('not.exist');

        cy.get('[data-cy="badgeCard-badge1"] [data-cy="deleteBtn"]')
            .click();
        cy.contains('Removal Safety Check');
        cy.get('[data-cy=currentValidationText]')
            .type('Delete Me');
        cy.get('[data-cy=removeButton]')
            .should('be.enabled')
            .click();

        cy.get('[data-cy="badgeCard-badge1"]')
            .should('not.exist');
        cy.get('[data-cy="badgeCard-badge2"]')
            .should('not.exist');

        cy.contains('No Badges Yet');
    });

    it('navigate to badge by clicking on name and icon', () => {
        cy.createBadge(1, 1);
        cy.createBadge(1, 2);

        cy.visit('/administrator/projects/proj1/badges');

        // using title link
        cy.get('[data-cy="badgeCard-badge2"] [data-cy="titleLink"]')
            .click();
        cy.contains('No Skills Selected Yet');
        cy.contains('ID: badge2');

        // using icon
        cy.visit('/administrator/projects/proj1/badges');
        cy.get('[data-cy="badgeCard-badge2"] [data-cy="iconLink"]')
            .click();
        cy.contains('No Skills Selected Yet');
        cy.contains('ID: badge2');
    });

    it('drag-and-drop sort management', () => {
        cy.createBadge(1, 1);
        cy.createBadge(1, 2);
        cy.createBadge(1, 3);
        cy.createBadge(1, 4);
        cy.createBadge(1, 5);

        cy.visit('/administrator/projects/proj1/badges');

        const badge1Card = '[data-cy="badgeCard-badge1"] [data-cy="sortControlHandle"]';
        const badge2Card = '[data-cy="badgeCard-badge2"] [data-cy="sortControlHandle"]';
        const badge4Card = '[data-cy="badgeCard-badge4"] [data-cy="sortControlHandle"]';
        const badge5Card = '[data-cy="badgeCard-badge5"] [data-cy="sortControlHandle"]';

        cy.validateElementsOrder('[data-cy="badgeCard"]', ['Badge 1', 'Badge 2', 'Badge 3', 'Badge 4', 'Badge 5']);
        cy.get(badge1Card)
            .dragAndDrop(badge4Card);
        cy.validateElementsOrder('[data-cy="badgeCard"]', ['Badge 2', 'Badge 3', 'Badge 4', 'Badge 1', 'Badge 5']);

        // refresh to make sure it was saved
        cy.visit('/administrator/projects/proj1/badges');
        cy.validateElementsOrder('[data-cy="badgeCard"]', ['Badge 2', 'Badge 3', 'Badge 4', 'Badge 1', 'Badge 5']);

        cy.get(badge5Card)
            .dragAndDrop(badge2Card);
        cy.validateElementsOrder('[data-cy="badgeCard"]', ['Badge 5', 'Badge 2', 'Badge 3', 'Badge 4', 'Badge 1']);

        cy.get(badge2Card)
            .dragAndDrop(badge1Card);
        cy.validateElementsOrder('[data-cy="badgeCard"]', ['Badge 5', 'Badge 3', 'Badge 4', 'Badge 1', 'Badge 2']);

        // refresh to make sure it was saved
        cy.visit('/administrator/projects/proj1/badges');
        cy.validateElementsOrder('[data-cy="badgeCard"]', ['Badge 5', 'Badge 3', 'Badge 4', 'Badge 1', 'Badge 2']);
    });

    it('no drag-and-drag sort controls when there is only 1 badge', () => {
        cy.createBadge(1, 1);

        cy.visit('/administrator/projects/proj1/badges');
        cy.get('[data-cy="badgeCard-badge1"]');
        cy.get('[data-cy="badgeCard-badge1"] [data-cy="sortControlHandle"]')
            .should('not.exist');

        cy.createBadge(1, 2);
        cy.visit('/administrator/projects/proj1/badges');
        cy.get('[data-cy="badgeCard-badge1"]');
        cy.get('[data-cy="badgeCard-badge1"] [data-cy="sortControlHandle"]');
    });

    it('drag-and-drag sort should spinner while backend operation is happening', () => {
        cy.intercept('/admin/projects/proj1/badges/badge1', (req) => {
            req.reply((res) => {
                res.send({ delay: 6000 });
            });
        })
            .as('badge1Async');

        cy.createBadge(1, 1);
        cy.createBadge(1, 2);

        const badge1Card = '[data-cy="badgeCard-badge1"] [data-cy="sortControlHandle"]';
        const badge2Card = '[data-cy="badgeCard-badge2"] [data-cy="sortControlHandle"]';

        cy.visit('/administrator/projects/proj1/badges');
        cy.validateElementsOrder('[data-cy="badgeCard"]', ['Badge 1', 'Badge 2']);
        cy.get(badge1Card)
            .dragAndDrop(badge2Card);

        // overlay over both cards but loading message only on badge 1
        cy.get('[data-cy="badge1_overlayShown"] [data-cy="updatingSortMsg"]')
            .contains('Updating sort order');
        cy.get('[data-cy="badge2_overlayShown"]');
        cy.get('[data-cy="badge2_overlayShown"] [data-cy="updatingSortMsg"]')
            .should('not.exist');
        cy.wait('@badge1Async');
        cy.get('[data-cy="badge1_overlayShown"]')
            .should('not.exist');
        cy.get('[data-cy="badge2_overlayShown"]')
            .should('not.exist');
    });

    it('badge card stats', () => {
        cy.createBadge(1, 1);
        cy.createBadge(1, 2);

        cy.createSubject(1, 1);

        cy.createSkill(1, 1, 1);
        cy.assignSkillToBadge(1, 1, 1);

        cy.createSkill(1, 1, 2);
        cy.assignSkillToBadge(1, 1, 2);

        cy.visit('/administrator/projects/proj1/badges');

        cy.get('[data-cy="badgeCard-badge1"] [data-cy="pagePreviewCardStat_# Skills"] [data-cy="statNum"]')
            .contains(2);
        cy.get('[data-cy="badgeCard-badge1"] [data-cy="pagePreviewCardStat_Points"] [data-cy="statNum"]')
            .contains(400);

        cy.get('[data-cy="badgeCard-badge2"] [data-cy="pagePreviewCardStat_# Skills"] [data-cy="statNum"]')
            .contains(0);
        cy.get('[data-cy="badgeCard-badge2"] [data-cy="pagePreviewCardStat_Points"] [data-cy="statNum"]')
            .contains(0);
    });

    it('edit badge button should retain focus after dialog is closed', () => {
        cy.request('POST', '/admin/projects/proj1/badges/badge1', {
            projectId: 'proj1',
            badgeId: 'badge1',
            name: 'Badge 1'
        });

        cy.request('POST', '/admin/projects/proj1/badges/badge2', {
            projectId: 'proj1',
            badgeId: 'badge2',
            name: 'Badge 2'
        });

        cy.visit('/administrator/projects/proj1');
        cy.get('[data-cy=nav-Badges]')
            .click();

        cy.get('[data-cy="badgeCard-badge1"] [data-cy=editBtn]')
            .click();
        cy.get('[data-cy=closeBadgeButton]')
            .click();
        cy.get('[data-cy="badgeCard-badge1"] [data-cy=editBtn]')
            .should('have.focus');

        cy.get('[data-cy="badgeCard-badge1"] [data-cy=editBtn]')
            .click();
        cy.get('[aria-label=Close]')
            .filter('.text-light')
            .click();
        cy.get('[data-cy="badgeCard-badge1"] [data-cy=editBtn]')
            .should('have.focus');

        cy.get('[data-cy="badgeCard-badge1"] [data-cy=editBtn]')
            .click();
        cy.get('[data-cy=badgeName]')
            .type('{esc}');
        cy.get('[data-cy="badgeCard-badge1"] [data-cy=editBtn]')
            .should('have.focus');

        cy.get('[data-cy="badgeCard-badge2"] [data-cy=editBtn]')
            .click();
        cy.get('[data-cy=closeBadgeButton]')
            .click();
        cy.get('[data-cy="badgeCard-badge2"] [data-cy=editBtn]')
            .should('have.focus');

        cy.get('[data-cy="badgeCard-badge2"] [data-cy=editBtn]')
            .click();
        cy.get('[aria-label=Close]')
            .filter('.text-light')
            .click();
        cy.get('[data-cy="badgeCard-badge2"] [data-cy=editBtn]')
            .should('have.focus');

        cy.get('[data-cy="badgeCard-badge2"] [data-cy=editBtn]')
            .click();
        cy.get('[data-cy=badgeName]')
            .type('{esc}');
        cy.get('[data-cy="badgeCard-badge2"] [data-cy=editBtn]')
            .should('have.focus');
    });

    it('remove skill after navigating to the link directly', () => {
        cy.request('POST', '/admin/projects/proj1/badges/badge1', {
            projectId: 'proj1',
            badgeId: 'badge1',
            name: 'Badge 1'
        });

        cy.request('POST', '/admin/projects/proj1/subjects/subj1', {
            projectId: 'proj1',
            subjectId: 'subj1',
            name: 'Subject 1'
        });

        const numSkills = 4;
        for (let i = 0; i < numSkills; i += 1) {
            cy.request('POST', `/admin/projects/proj1/subjects/subj1/skills/skill${i}`, {
                projectId: 'proj1',
                subjectId: 'subj1',
                skillId: `skill${i}`,
                name: `Skill ${i}`,
                pointIncrement: '50',
                numPerformToCompletion: '5'
            });

            cy.request('POST', `/admin/projects/proj1/badge/badge1/skills/skill${i}`);
        }

        cy.visit('/administrator/projects/proj1/badges/badge1');
        cy.get(`${tableSelector} th`)
            .contains('Skill ID')
            .click();

        cy.validateTable(tableSelector, [
            [{
                colIndex: 1,
                value: 'skill0'
            }],
            [{
                colIndex: 1,
                value: 'skill1'
            }],
            [{
                colIndex: 1,
                value: 'skill2'
            }],
            [{
                colIndex: 1,
                value: 'skill3'
            }],
        ], 5);

        cy.get('[data-cy="deleteSkill_skill2"]')
            .click();
        cy.contains('YES, Delete It')
            .click();
        cy.validateTable(tableSelector, [
            [{
                colIndex: 1,
                value: 'skill0'
            }],
            [{
                colIndex: 1,
                value: 'skill1'
            }],
            [{
                colIndex: 1,
                value: 'skill3'
            }],
        ], 5);
    });

    it('skills table sorting', () => {
        cy.request('POST', '/admin/projects/proj1/badges/badge1', {
            projectId: 'proj1',
            badgeId: 'badge1',
            name: 'Badge 1'
        });

        cy.request('POST', '/admin/projects/proj1/subjects/subj1', {
            projectId: 'proj1',
            subjectId: 'subj1',
            name: 'Subject 1'
        });

        const numSkills = 7;
        for (let i = 0; i < numSkills; i += 1) {
            cy.request('POST', `/admin/projects/proj1/subjects/subj1/skills/skill${i}`, {
                projectId: 'proj1',
                subjectId: 'subj1',
                skillId: `skill${i}`,
                name: `Skill ${10 - i}`,
                pointIncrement: '50',
                numPerformToCompletion: (i + 1)
            });

            cy.request('POST', `/admin/projects/proj1/badge/badge1/skills/skill${i}`);
        }

        cy.visit('/administrator/projects/proj1/badges/badge1');
        cy.get(`${tableSelector} th`)
            .contains('Skill ID')
            .click();

        cy.validateTable(tableSelector, [
            [{
                colIndex: 0,
                value: 'Skill 10'
            }, {
                colIndex: 1,
                value: 'skill0'
            }, {
                colIndex: 2,
                value: '50'
            }],
            [{
                colIndex: 0,
                value: 'Skill 9'
            }, {
                colIndex: 1,
                value: 'skill1'
            }, {
                colIndex: 2,
                value: '100'
            }],
            [{
                colIndex: 0,
                value: 'Skill 8'
            }, {
                colIndex: 1,
                value: 'skill2'
            }, {
                colIndex: 2,
                value: '150'
            }],
            [{
                colIndex: 0,
                value: 'Skill 7'
            }, {
                colIndex: 1,
                value: 'skill3'
            }, {
                colIndex: 2,
                value: '200'
            }],
            [{
                colIndex: 0,
                value: 'Skill 6'
            }, {
                colIndex: 1,
                value: 'skill4'
            }, {
                colIndex: 2,
                value: '250'
            }],
            [{
                colIndex: 0,
                value: 'Skill 5'
            }, {
                colIndex: 1,
                value: 'skill5'
            }, {
                colIndex: 2,
                value: '300'
            }],
            [{
                colIndex: 0,
                value: 'Skill 4'
            }, {
                colIndex: 1,
                value: 'skill6'
            }, {
                colIndex: 2,
                value: '350'
            }],
        ], 5);

        cy.get(`${tableSelector} th`)
            .contains('Skill ID')
            .click();
        cy.validateTable(tableSelector, [
            [{
                colIndex: 0,
                value: 'Skill 4'
            }, {
                colIndex: 1,
                value: 'skill6'
            }, {
                colIndex: 2,
                value: '350'
            }],
            [{
                colIndex: 0,
                value: 'Skill 5'
            }, {
                colIndex: 1,
                value: 'skill5'
            }, {
                colIndex: 2,
                value: '300'
            }],
            [{
                colIndex: 0,
                value: 'Skill 6'
            }, {
                colIndex: 1,
                value: 'skill4'
            }, {
                colIndex: 2,
                value: '250'
            }],
            [{
                colIndex: 0,
                value: 'Skill 7'
            }, {
                colIndex: 1,
                value: 'skill3'
            }, {
                colIndex: 2,
                value: '200'
            }],
            [{
                colIndex: 0,
                value: 'Skill 8'
            }, {
                colIndex: 1,
                value: 'skill2'
            }, {
                colIndex: 2,
                value: '150'
            }],
            [{
                colIndex: 0,
                value: 'Skill 9'
            }, {
                colIndex: 1,
                value: 'skill1'
            }, {
                colIndex: 2,
                value: '100'
            }],
            [{
                colIndex: 0,
                value: 'Skill 10'
            }, {
                colIndex: 1,
                value: 'skill0'
            }, {
                colIndex: 2,
                value: '50'
            }],
        ], 5);

        cy.get(`${tableSelector} th`)
            .contains('Skill Name')
            .click();
        cy.validateTable(tableSelector, [
            [{
                colIndex: 0,
                value: 'Skill 4'
            }, {
                colIndex: 1,
                value: 'skill6'
            }, {
                colIndex: 2,
                value: '350'
            }],
            [{
                colIndex: 0,
                value: 'Skill 5'
            }, {
                colIndex: 1,
                value: 'skill5'
            }, {
                colIndex: 2,
                value: '300'
            }],
            [{
                colIndex: 0,
                value: 'Skill 6'
            }, {
                colIndex: 1,
                value: 'skill4'
            }, {
                colIndex: 2,
                value: '250'
            }],
            [{
                colIndex: 0,
                value: 'Skill 7'
            }, {
                colIndex: 1,
                value: 'skill3'
            }, {
                colIndex: 2,
                value: '200'
            }],
            [{
                colIndex: 0,
                value: 'Skill 8'
            }, {
                colIndex: 1,
                value: 'skill2'
            }, {
                colIndex: 2,
                value: '150'
            }],
            [{
                colIndex: 0,
                value: 'Skill 9'
            }, {
                colIndex: 1,
                value: 'skill1'
            }, {
                colIndex: 2,
                value: '100'
            }],
            [{
                colIndex: 0,
                value: 'Skill 10'
            }, {
                colIndex: 1,
                value: 'skill0'
            }, {
                colIndex: 2,
                value: '50'
            }],
        ], 5);

        cy.get(`${tableSelector} th`)
            .contains('Skill Name')
            .click();
        cy.validateTable(tableSelector, [
            [{
                colIndex: 0,
                value: 'Skill 10'
            }, {
                colIndex: 1,
                value: 'skill0'
            }, {
                colIndex: 2,
                value: '50'
            }],
            [{
                colIndex: 0,
                value: 'Skill 9'
            }, {
                colIndex: 1,
                value: 'skill1'
            }, {
                colIndex: 2,
                value: '100'
            }],
            [{
                colIndex: 0,
                value: 'Skill 8'
            }, {
                colIndex: 1,
                value: 'skill2'
            }, {
                colIndex: 2,
                value: '150'
            }],
            [{
                colIndex: 0,
                value: 'Skill 7'
            }, {
                colIndex: 1,
                value: 'skill3'
            }, {
                colIndex: 2,
                value: '200'
            }],
            [{
                colIndex: 0,
                value: 'Skill 6'
            }, {
                colIndex: 1,
                value: 'skill4'
            }, {
                colIndex: 2,
                value: '250'
            }],
            [{
                colIndex: 0,
                value: 'Skill 5'
            }, {
                colIndex: 1,
                value: 'skill5'
            }, {
                colIndex: 2,
                value: '300'
            }],
            [{
                colIndex: 0,
                value: 'Skill 4'
            }, {
                colIndex: 1,
                value: 'skill6'
            }, {
                colIndex: 2,
                value: '350'
            }],
        ], 5);

        cy.get(`${tableSelector} th`)
            .contains('Total Points')
            .click();
        cy.validateTable(tableSelector, [
            [{
                colIndex: 0,
                value: 'Skill 10'
            }, {
                colIndex: 1,
                value: 'skill0'
            }, {
                colIndex: 2,
                value: '50'
            }],
            [{
                colIndex: 0,
                value: 'Skill 9'
            }, {
                colIndex: 1,
                value: 'skill1'
            }, {
                colIndex: 2,
                value: '100'
            }],
            [{
                colIndex: 0,
                value: 'Skill 8'
            }, {
                colIndex: 1,
                value: 'skill2'
            }, {
                colIndex: 2,
                value: '150'
            }],
            [{
                colIndex: 0,
                value: 'Skill 7'
            }, {
                colIndex: 1,
                value: 'skill3'
            }, {
                colIndex: 2,
                value: '200'
            }],
            [{
                colIndex: 0,
                value: 'Skill 6'
            }, {
                colIndex: 1,
                value: 'skill4'
            }, {
                colIndex: 2,
                value: '250'
            }],
            [{
                colIndex: 0,
                value: 'Skill 5'
            }, {
                colIndex: 1,
                value: 'skill5'
            }, {
                colIndex: 2,
                value: '300'
            }],
            [{
                colIndex: 0,
                value: 'Skill 4'
            }, {
                colIndex: 1,
                value: 'skill6'
            }, {
                colIndex: 2,
                value: '350'
            }],
        ], 5);

        cy.get(`${tableSelector} th`)
            .contains('Total Points')
            .click();
        cy.validateTable(tableSelector, [
            [{
                colIndex: 0,
                value: 'Skill 4'
            }, {
                colIndex: 1,
                value: 'skill6'
            }, {
                colIndex: 2,
                value: '350'
            }],
            [{
                colIndex: 0,
                value: 'Skill 5'
            }, {
                colIndex: 1,
                value: 'skill5'
            }, {
                colIndex: 2,
                value: '300'
            }],
            [{
                colIndex: 0,
                value: 'Skill 6'
            }, {
                colIndex: 1,
                value: 'skill4'
            }, {
                colIndex: 2,
                value: '250'
            }],
            [{
                colIndex: 0,
                value: 'Skill 7'
            }, {
                colIndex: 1,
                value: 'skill3'
            }, {
                colIndex: 2,
                value: '200'
            }],
            [{
                colIndex: 0,
                value: 'Skill 8'
            }, {
                colIndex: 1,
                value: 'skill2'
            }, {
                colIndex: 2,
                value: '150'
            }],
            [{
                colIndex: 0,
                value: 'Skill 9'
            }, {
                colIndex: 1,
                value: 'skill1'
            }, {
                colIndex: 2,
                value: '100'
            }],
            [{
                colIndex: 0,
                value: 'Skill 10'
            }, {
                colIndex: 1,
                value: 'skill0'
            }, {
                colIndex: 2,
                value: '50'
            }],
        ], 5);
    });

    it('skills table has manage button', () => {
        cy.request('POST', '/admin/projects/proj1/badges/badge1', {
            projectId: 'proj1',
            badgeId: 'badge1',
            name: 'Badge 1'
        });

        cy.request('POST', '/admin/projects/proj1/subjects/subj1', {
            projectId: 'proj1',
            subjectId: 'subj1',
            name: 'Subject 1'
        });

        const numSkills = 7;
        for (let i = 0; i < numSkills; i += 1) {
            cy.request('POST', `/admin/projects/proj1/subjects/subj1/skills/skill${i}`, {
                projectId: 'proj1',
                subjectId: 'subj1',
                skillId: `skill${i}`,
                name: `Skill ${10 - i}`,
                pointIncrement: '50',
                numPerformToCompletion: (i + 1)
            });

            cy.request('POST', `/admin/projects/proj1/badge/badge1/skills/skill${i}`);
        }

        cy.visit('/administrator/projects/proj1/badges/badge1');
        for (let i = 0; i < 5; i +=1) {
            cy.get(`[data-cy="manage_skill${i}"]`).should('exist')
            cy.get(`[data-cy="deleteSkill_skill${i}"]`).should('exist')
        }

    });

    it('description is validated against custom validators', () => {
        cy.visit('/administrator/projects/proj1/badges');
        cy.wait('@loadBadges');
        cy.clickButton('Badge');

        cy.get('#badgeName')
            .type('Great Name');

        cy.get('[data-cy="saveBadgeButton"]')
            .should('be.enabled');

        cy.get('[data-cy="markdownEditorInput"]')
            .type('ldkj aljdl aj\n\njabberwocky');
        cy.get('[data-cy="badgeDescriptionError"]')
            .contains('Badge Description - paragraphs may not contain jabberwocky');
        cy.get('[data-cy="saveBadgeButton"]')
            .should('be.disabled');

        cy.get('[data-cy="markdownEditorInput"]')
            .type('{backspace}');
        cy.get('[data-cy="saveBadgeButton"]')
            .should('be.enabled');
        cy.get('[data-cy="badgeDescriptionError"]')
            .contains('Badge Name - paragraphs may not contain jabberwocky')
            .should('not.exist');
    });

    it('name is validated against custom validators', () => {
        cy.visit('/administrator/projects/proj1/badges');
        cy.wait('@loadBadges');
        cy.clickButton('Badge');

        cy.get('#badgeName')
          .type('Great Name');

        cy.get('[data-cy="badgeNameError"]')
          .should('not.be.visible');
        cy.get('[data-cy="saveBadgeButton"]')
          .should('be.enabled');

        cy.get('input[data-cy=badgeName]')
          .type('{selectall}(A) Updated Badge Name');
        cy.get('[data-cy="badgeNameError"]')
          .contains('Badge Name - names may not contain (A)');
        cy.get('[data-cy="saveBadgeButton"]')
          .should('be.disabled');

        cy.get('input[data-cy=badgeName]')
          .type('{selectall}(B) A Updated Badge Name');
        cy.get('[data-cy="badgeNameError"]')
          .should('not.be.visible');
        cy.get('[data-cy="saveBadgeButton"]')
          .should('be.enabled');
    });

    it('edit in place', () => {
        cy.request('POST', '/admin/projects/proj1/subjects/subj1', {
            projectId: 'proj1',
            subjectId: 'subj1',
            name: 'Subject 1'
        });
        cy.request('POST', '/admin/projects/proj1/subjects/subj1/skills/skill1', {
            projectId: 'proj1',
            subjectId: 'subj1',
            skillId: 'skill1',
            name: 'Skill 1',
            pointIncrement: '50',
            numPerformToCompletion: '5'
        });
        cy.request('POST', '/admin/projects/proj1/badges/badge1', {
            projectId: 'proj1',
            badgeId: 'badge1',
            name: 'Badge 1'
        });
        cy.request('POST', '/admin/projects/proj1/badge/badge1/skills/skill1');
        cy.intercept('GET', '/admin/projects/proj1/badges/badge1')
            .as('loadBadge1');
        cy.intercept('GET', '/admin/projects/proj1/badges/iwasedited/users**')
            .as('loadBadgeUsers');

        cy.visit('/administrator/projects/proj1/badges/badge1');
        cy.wait('@loadBadge1');
        cy.contains('BADGE: Badge 1')
            .should('be.visible');
        cy.contains('ID: badge1')
            .should('be.visible');
        cy.get('[data-cy=breadcrumb-badge1]')
            .should('be.visible');
        cy.get('button[data-cy=deleteSkill_skill1]')
            .should('be.visible');
        cy.get('[data-cy=btn_edit-badge]')
            .should('be.visible')
            .click();
        cy.get('input[data-cy=badgeName]')
            .type('{selectall}Updated Badge Name');
        cy.get('button[data-cy=saveBadgeButton]')
            .click();
        cy.contains('BADGE: Badge 1')
            .should('not.exist');
        cy.contains('BADGE: Updated Badge Name')
            .should('be.visible');

        cy.get('[data-cy=btn_edit-badge]')
            .click();
        cy.get('[data-cy=enableIdInput]').click({force: true});
        cy.get('input[data-cy=idInputValue]')
            .type('{selectall}iwasedited');
        cy.get('button[data-cy=saveBadgeButton]')
            .click();
        cy.contains('ID: badge1')
            .should('not.exist');
        cy.contains('ID: iwasedited')
            .should('be.visible');
        cy.location()
            .should((loc) => {
                expect(loc.pathname)
                    .to
                    .eq('/administrator/projects/proj1/badges/iwasedited/');
            });
        cy.get('[data-cy=breadcrumb-badge1]')
            .should('not.exist');
        cy.get('[data-cy=breadcrumb-iwasedited]')
            .should('be.visible');
        cy.get('button[data-cy=deleteSkill_skill1]')
            .click();
        cy.contains('YES, Delete It!')
            .click();
        cy.contains('No Skills Selected Yet...')
            .should('be.visible');
        cy.get('[data-cy=nav-Users]')
            .click();
        cy.wait('@loadBadgeUsers');
    });

    it('badge modal shows Root Help Url when configured', () => {
        cy.request('POST', '/admin/projects/proj1/settings/help.url.root', {
            projectId: 'proj1',
            setting: 'help.url.root',
            value: 'https://SomeArticleRepo.com/'
        });
        cy.createBadge(1, 2, { helpUrl: '/some/path' });
        cy.createBadge(1, 3, { helpUrl: 'https://www.OverrideHelpUrl.com/other/path' });

        cy.visit('/administrator/projects/proj1/badges');
        cy.get('[data-cy="btn_Badges"]')
            .click();
        cy.get('[data-cy="rootHelpUrlSetting"]')
            .contains('https://SomeArticleRepo.com');

        const textDecorationMatch = 'line-through solid rgb(38, 70, 83)';

        // strike-through when url starts with http:// or https://
        cy.get('[data-cy="skillHelpUrl"]')
            .type('https:/');
        cy.get('[data-cy="rootHelpUrlSetting"]')
            .should('not.have.css', 'text-decoration', textDecorationMatch);
        cy.get('[data-cy="skillHelpUrl"]')
            .type('/');
        cy.get('[data-cy="rootHelpUrlSetting"]')
            .should('have.css', 'text-decoration', textDecorationMatch);

        cy.get('[data-cy="skillHelpUrl"]')
            .clear()
            .type('http:/');
        cy.get('[data-cy="rootHelpUrlSetting"]')
            .should('not.have.css', 'text-decoration', textDecorationMatch);
        cy.get('[data-cy="skillHelpUrl"]')
            .type('/');
        cy.get('[data-cy="rootHelpUrlSetting"]')
            .should('have.css', 'text-decoration', textDecorationMatch);

        // now test edit
        cy.get('[data-cy="closeBadgeButton"]')
            .click();
        cy.get('[data-cy="badgeCard-badge2"] [data-cy="editBtn"]')
            .click();
        cy.get('[data-cy="rootHelpUrlSetting"]')
            .contains('https://SomeArticleRepo.com');
        cy.get('[data-cy="rootHelpUrlSetting"]')
            .should('not.have.css', 'text-decoration', textDecorationMatch);

        // edit again - anything that starts with https or http must not use Root Help Url
        cy.get('[data-cy="closeBadgeButton"]')
            .click();
        cy.get('[data-cy="badgeCard-badge3"] [data-cy="editBtn"]')
            .click();
        cy.get('[data-cy="rootHelpUrlSetting"]')
            .contains('https://SomeArticleRepo.com');
        cy.get('[data-cy="rootHelpUrlSetting"]')
            .should('have.css', 'text-decoration', textDecorationMatch);

        // do not show Root Help Url if it's not configured
        cy.request('POST', '/admin/projects/proj1/settings/help.url.root', {
            projectId: 'proj1',
            setting: 'help.url.root',
            value: ''
        });
        cy.visit('/administrator/projects/proj1/badges');
        cy.get('[data-cy="btn_Badges"]')
            .click();
        cy.get('[data-cy="skillHelpUrl"]');
        cy.get('[data-cy="rootHelpUrlSetting"]')
            .should('not.exist');
        cy.get('[data-cy="closeBadgeButton"]')
            .click();
        cy.get('[data-cy="badgeCard-badge2"] [data-cy="editBtn"]')
            .click();
        cy.get('[data-cy="skillHelpUrl"]');
        cy.get('[data-cy="rootHelpUrlSetting"]')
            .should('not.exist');
    });

    it('create badge with custom icon', () => {
        cy.intercept({
            method: 'POST',
            url: '/admin/projects/proj1/icons/upload',
        })
            .as('uploadIcon');

        cy.visit('/administrator/projects/proj1/badges');
        cy.get('[data-cy="btn_Badges"]')
            .click();

        cy.get('[data-cy="iconPicker"]').first()
            .click();
        cy.get('a.nav-link')
            .contains('Custom')
            .click();
        const filename = 'valid_icon.png';
        cy.get('input[type=file]')
            .attachFile(filename);
        cy.wait('@uploadIcon');
        cy.get('[data-cy="iconPicker"] .proj1-validiconpng');
        cy.get('[data-cy="badgeName"]')
            .type('customIcon');
        cy.get('[data-cy="saveBadgeButton"]')
            .click();

        cy.get('[data-cy="badgeCard-customIconBadge"] .proj1-validiconpng');

        // refresh and re-validate
        cy.visit('/administrator/projects/proj1/badges');
        cy.get('[data-cy="badgeCard-customIconBadge"] .proj1-validiconpng');
    });

    it('change sort order using keyboard', () => {
        cy.createBadge(1, 1);
        cy.createBadge(1, 2);
        cy.createBadge(1, 3);

        const badge1Card = '[data-cy="badgeCard-badge1"] [data-cy="sortControlHandle"]';
        const badge2Card = '[data-cy="badgeCard-badge2"] [data-cy="sortControlHandle"]';

        cy.visit('/administrator/projects/proj1/badges');
        cy.validateElementsOrder('[data-cy="badgeCard"] [data-cy="titleLink"]', ['Badge 1', 'Badge 2', 'Badge 3']);

        // move down
        cy.get('[data-cy="badgeCard-badge1"] [data-cy="goLive"]')
            .tab()
            .type('{downArrow}');
        cy.validateElementsOrder('[data-cy="badgeCard"] [data-cy="titleLink"]', ['Badge 2', 'Badge 1', 'Badge 3']);
        cy.get('[data-cy="badgeCard-badge1"] [data-cy="sortControlHandle"]')
            .should('have.focus');

        // move down
        cy.get('[data-cy="badgeCard-badge1"] [data-cy="goLive"]')
            .tab()
            .type('{downArrow}');
        cy.validateElementsOrder('[data-cy="badgeCard"] [data-cy="titleLink"]', ['Badge 2', 'Badge 3', 'Badge 1']);
        cy.get('[data-cy="badgeCard-badge1"] [data-cy="sortControlHandle"]')
            .should('have.focus');

        // move down - already the last item
        cy.get('[data-cy="badgeCard-badge1"] [data-cy="goLive"]')
            .tab()
            .type('{downArrow}');
        cy.validateElementsOrder('[data-cy="badgeCard"] [data-cy="titleLink"]', ['Badge 2', 'Badge 3', 'Badge 1']);
        cy.get('[data-cy="badgeCard-badge1"] [data-cy="sortControlHandle"]')
            .should('have.focus');

        // refresh and validate
        cy.visit('/administrator/projects/proj1/badges');
        cy.validateElementsOrder('[data-cy="badgeCard"] [data-cy="titleLink"]', ['Badge 2', 'Badge 3', 'Badge 1']);
        cy.get('[data-cy="badgeCard-badge1"] [data-cy="sortControlHandle"]')
            .should('not.have.focus');

        // move up
        cy.get('[data-cy="badgeCard-badge3"] [data-cy="goLive"]')
            .tab()
            .type('{upArrow}');
        cy.validateElementsOrder('[data-cy="badgeCard"] [data-cy="titleLink"]', ['Badge 3', 'Badge 2', 'Badge 1']);
        cy.get('[data-cy="badgeCard-badge3"] [data-cy="sortControlHandle"]')
            .should('have.focus');

        // move up - already first
        cy.get('[data-cy="badgeCard-badge3"] [data-cy="goLive"]')
            .tab()
            .type('{upArrow}');
        cy.validateElementsOrder('[data-cy="badgeCard"] [data-cy="titleLink"]', ['Badge 3', 'Badge 2', 'Badge 1']);
        cy.get('[data-cy="badgeCard-badge3"] [data-cy="sortControlHandle"]')
            .should('have.focus');
    });

    it('cancelling delete dialog should return focus to delete button', () => {
        cy.createBadge(1, 1);
        cy.createBadge(1, 2);
        cy.createBadge(1, 3);
        cy.createBadge(1, 4);
        cy.createBadge(1, 5);

        cy.intercept('GET', '/admin/projects/proj1/badges')
            .as('getBadges');
        cy.visit('/administrator/projects/proj1/badges');
        cy.wait('@getBadges');

        cy.get('[data-cy="badgeCard-badge2"] [data-cy="deleteBtn"]')
            .click();
        cy.contains('Removal Safety Check');
        cy.get('[data-cy=closeRemovalSafetyCheck]')
            .click();
        cy.get('[data-cy="badgeCard-badge2"] [data-cy="deleteBtn"]')
            .should('have.focus');

    });

    it('edit badge - run validation on load in case validation improved and existing values fail to validate', () => {
        cy.intercept('POST', '/api/validation/description*', {
            valid: false,
            msg: 'Mocked up validation failure'
        }).as('validateDesc');

        cy.createBadge(1, 1, {description: 'Very cool project'})
        cy.visit('/administrator/projects/proj1/badges');
        cy.get('[data-cy="editBtn"]').click()
        cy.wait('@validateDesc')
        cy.get('[data-cy="badgeDescriptionError"]').contains('Mocked up validation failure')
    });


    it('rows per page control is enabled once # of skills is greater than page size', () => {
        cy.request('POST', '/admin/projects/proj1/badges/badge1', {
            projectId: 'proj1',
            badgeId: 'badge1',
            name: 'Badge 1'
        });

        cy.request('POST', '/admin/projects/proj1/subjects/subj1', {
            projectId: 'proj1',
            subjectId: 'subj1',
            name: 'Subject 1'
        });

        const numSkills = 6;
        for (let i = 0; i < numSkills; i += 1) {
            cy.request('POST', `/admin/projects/proj1/subjects/subj1/skills/skill${i}`, {
                projectId: 'proj1',
                subjectId: 'subj1',
                skillId: `skill${i}`,
                name: `Skill ${i}`,
                pointIncrement: '50',
                numPerformToCompletion: '5'
            });

            if (i < numSkills-1) {
                cy.request('POST', `/admin/projects/proj1/badge/badge1/skills/skill${i}`);
            }
        }

        cy.visit('/administrator/projects/proj1/badges/badge1');
        cy.get(`${tableSelector} th`)
          .contains('Skill ID')
          .click();

        cy.validateTable(tableSelector, [
            [{
                colIndex: 1,
                value: 'skill0'
            }],
            [{
                colIndex: 1,
                value: 'skill1'
            }],
            [{
                colIndex: 1,
                value: 'skill2'
            }],
            [{
                colIndex: 1,
                value: 'skill3'
            }],
            [{
                colIndex: 1,
                value: 'skill4'
            }],
        ], 5);
        cy.get('[data-cy="skillsBTablePageSize"]').should('be.disabled');

        // add one more skill to the badge to make 6 skills total
        // cy.request('POST', '/admin/projects/proj1/badge/badge1/skills/skill5');
        cy.get('[data-cy="skillsSelector2"]')
          .click();
        cy.get('[data-cy="skillsSelector2"] .vs__dropdown-option')
          .eq(0)
          .click();

        cy.validateTable(tableSelector, [
            [{
                colIndex: 1,
                value: 'skill0'
            }],
            [{
                colIndex: 1,
                value: 'skill1'
            }],
            [{
                colIndex: 1,
                value: 'skill2'
            }],
            [{
                colIndex: 1,
                value: 'skill3'
            }],
            [{
                colIndex: 1,
                value: 'skill4'
            }],
            [{
                colIndex: 1,
                value: 'skill5'
            }],
        ], 5, true);
        cy.get('[data-cy="skillsBTablePageSize"]').should('be.enabled');

        // now delete a skill to go back to 5 skills total
        cy.get('[data-cy="deleteSkill_skill2"]')
          .click();
        cy.contains('YES, Delete It')
          .click();

        cy.validateTable(tableSelector, [
            [{
                colIndex: 1,
                value: 'skill0'
            }],
            [{
                colIndex: 1,
                value: 'skill1'
            }],
            [{
                colIndex: 1,
                value: 'skill3'
            }],
            [{
                colIndex: 1,
                value: 'skill4'
            }],
            [{
                colIndex: 1,
                value: 'skill5'
            }],
        ], 5);
        cy.get('[data-cy="skillsBTablePageSize"]').should('be.disabled');
    });

    it('badge details has go live button and can go live', () => {
        cy.request('POST', '/admin/projects/proj1/subjects/subj1', {
            projectId: 'proj1',
            subjectId: 'subj1',
            name: 'Subject 1'
        });

        cy.request('POST', '/admin/projects/proj1/subjects/subj1/skills/skill1', {
            projectId: 'proj1',
            subjectId: 'subj1',
            skillId: 'skill1',
            name: 'Skill 1',
            pointIncrement: '50',
            numPerformToCompletion: '5'
        });

        cy.request('POST', '/admin/projects/proj1/badges/badge1', {
            projectId: 'proj1',
            badgeId: 'badge1',
            name: 'Badge 1',
            'iconClass': 'fas fa-ghost',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        });

        cy.visit('/administrator/projects/proj1/badges/badge1');

        cy.get('[data-cy=statPreformatted]')
            .contains('Disabled')
            .should('exist');
        cy.get('[data-cy=goLive]')
            .click();
        cy.contains('This Badge has no assigned Skills. A Badge cannot be published without at least one assigned Skill.')
            .should('be.visible');
        cy.get('[data-cy=statPreformatted]')
            .contains('Disabled')
            .should('exist');

        cy.request('POST', '/admin/projects/proj1/badge/badge1/skills/skill1');
        cy.request('POST', `/api/projects/proj1/skills/skill1`, {
            userId: 'someuser',
            timestamp: new Date().getTime()
        });

        cy.visit('/administrator/projects/proj1/badges/badge1');

        cy.get('[data-cy=statPreformatted]')
            .contains('Disabled')
            .should('exist');
        cy.get('[data-cy=goLive]')
            .click();
        cy.contains('Please Confirm!')
            .should('exist');
        cy.contains('Yes, Go Live!')
            .click();

        cy.get('[data-cy=statPreformatted]')
            .contains('Live')
            .should('exist');

    });

    it('add bonus award to badge', () => {
        cy.createBadge(1, 1);

        cy.intercept('GET', '/admin/projects/proj1/badges/badge1')
            .as('loadBadge1');

        cy.visit('/administrator/projects/proj1/badges/badge1');
        cy.wait('@loadBadge1');

        cy.get('[data-cy="btn_edit-badge"]').click();
        cy.get('[data-cy="timeLimitCheckbox"').click({force: true});
        cy.get('input[data-cy=awardName]')
            .type('{selectall}Bonus Award Name');
        cy.get('input[data-cy=timeLimitDays]')
            .type('{selectall}25');
        cy.get('input[data-cy=timeLimitHours]')
            .type('{selectall}22');
        cy.get('input[data-cy=timeLimitMinutes]')
            .type('{selectall}30');
        cy.get('button[data-cy=saveBadgeButton]')
            .click();

        cy.visit('/administrator/projects/proj1/badges/badge1');
        cy.wait('@loadBadge1');

        cy.get('[data-cy="btn_edit-badge"]').click();

        cy.get('input[data-cy=awardName]').should('have.value', 'Bonus Award Name');
        cy.get('input[data-cy=timeLimitDays]').should('have.value', '25');
        cy.get('input[data-cy=timeLimitHours]').should('have.value', '22');
        cy.get('input[data-cy=timeLimitMinutes]').should('have.value', '30');
    });

    it('can not save badge with bad award data', () => {
        cy.createBadge(1, 1);

        cy.intercept('GET', '/admin/projects/proj1/badges/badge1')
            .as('loadBadge1');

        cy.visit('/administrator/projects/proj1/badges/badge1');
        cy.wait('@loadBadge1');

        cy.get('[data-cy="btn_edit-badge"]').click();
        cy.get('[data-cy="timeLimitCheckbox"').click({force: true});

        cy.get('input[data-cy=timeLimitDays]')
            .type('{selectall}800');
        cy.get('button[data-cy=saveBadgeButton]').should('not.be.enabled');
        cy.get('input[data-cy=timeLimitDays]')
            .type('{selectall}1');
        cy.get('button[data-cy=saveBadgeButton]').should('be.enabled');

        cy.get('input[data-cy=timeLimitHours]')
            .type('{selectall}800');
        cy.get('button[data-cy=saveBadgeButton]').should('not.be.enabled');
        cy.get('input[data-cy=timeLimitHours]')
            .type('{selectall}1');
        cy.get('button[data-cy=saveBadgeButton]').should('be.enabled');

        cy.get('input[data-cy=timeLimitMinutes]')
            .type('{selectall}900');
        cy.get('button[data-cy=saveBadgeButton]').should('not.be.enabled');
    });

    it('can edit existing badge award', () => {
        cy.createBadge(1, 1, {awardAttrs: {iconClass: 'test-icon', name: 'Test Badge Award', numMinutes: 120}});

        cy.intercept('GET', '/admin/projects/proj1/badges/badge1')
            .as('loadBadge1');

        cy.visit('/administrator/projects/proj1/badges/badge1');
        cy.wait('@loadBadge1');

        cy.get('[data-cy="btn_edit-badge"]').click();
        cy.get('[data-cy="timeLimitCheckbox"').should('be.checked');

        cy.get('input[data-cy=awardName]').should('have.value', 'Test Badge Award');
        cy.get('input[data-cy=timeLimitHours]').should('have.value', '2');
        cy.get('input[data-cy=timeLimitMinutes]').should('have.value', '0');
    });
});
