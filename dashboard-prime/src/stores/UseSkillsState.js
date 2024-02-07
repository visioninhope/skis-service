import { ref } from 'vue'
import { defineStore } from 'pinia'
import SkillsService from '@/components/skills/SkillsService'

export const useSkillsState = defineStore('skillsState',  () => {
  const skill = ref(null);
  const loadingSkill = ref(false);

  function loadSkill(payload) {
    loadingSkill.value = true;
    return new Promise((resolve, reject) => {
      SkillsService.getSkillDetails(payload.projectId, payload.subjectId, payload.skillId).then((response) => {
        const subjectId = { payload }
        skill.value = Object.assign(response, { subjectId });
        resolve(response)
      }).catch((error) => reject(error)).finally(() => {
        loadingSkill.value = false;
      })
    })
  }

  return { skill, loadingSkill, loadSkill };

})