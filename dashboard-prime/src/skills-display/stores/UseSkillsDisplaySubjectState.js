import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useSkillsDisplayService } from '@/skills-display/services/UseSkillsDisplayService.js'

export const useSkillsDisplaySubjectState = defineStore('skillDisplaySubjectState', () => {

    const skillsDisplayService = useSkillsDisplayService()

    const loadingSubjectSummary = ref(true)
    const subjectSummary = ref({})
    const loadingSkillSummary = ref(true)
    const skillSummary = ref({})

    const loadSubjectSummary = (subjectId, includeSkills = true) => {
      return skillsDisplayService.loadSubjectSummary(subjectId, includeSkills)
        .then((res) => {
          subjectSummary.value = res
          return res
        }).finally(() => {
          loadingSubjectSummary.value = false
        })
    }

    const loadSkillSummary = (skillId, optionalCrossProjectId, subjectId) => {
      loadingSkillSummary.value = true
      return skillsDisplayService.getSkillSummary(skillId, optionalCrossProjectId, subjectId)
        .then((res) => {
          skillSummary.value = res
          return res
        }).finally(() => {
          loadingSkillSummary.value = false
        })
    }

    const updateSingleSkillPoints = (skill, pts) => {
      skill.points = skill.points + pts
      skill.todaysPoints = skill.todaysPoints + pts
      if (skill.points === skill.totalPoints) {
        skill.meta.complete = true
        skill.achievedOn = new Date()
      }
    }

    const addPoints = (skillId, pts) => {
      if (pts > 0) {
        if (skillSummary.value?.skillId === skillId) {
          updateSingleSkillPoints(skillSummary.value, pts)
        }
        if (subjectSummary.value?.skills) {
          const foundSkill = subjectSummary.value.skills.find((item) => item.skillId === skillId)
          if (foundSkill) {
            updateSingleSkillPoints(foundSkill, pts)

            subjectSummary.value.todaysPoints += pts
            subjectSummary.value.points += pts

            // calculating next level is outside the UIs scope, need to delegate
            skillsDisplayService.loadSubjectSummary(subjectSummary.value.subjectId, false)
              .then((res) => {
                subjectSummary.value.skillsLevel = res.skillsLevel
                subjectSummary.value.levelPoints = res.levelPoints
                subjectSummary.value.levelTotalPoints = res.levelTotalPoints
                subjectSummary.value.totalLevels = res.totalLevels
              })
          }
        }
      }
    }
    return {
      loadSubjectSummary,
      loadingSubjectSummary,
      subjectSummary,
      loadSkillSummary,
      skillSummary,
      addPoints
    }

  }
)