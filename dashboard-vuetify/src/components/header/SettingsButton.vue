<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { usePagePath } from '@/components/utils/UsePageLocation'
import { useUserInfo } from '@/components/utils/UseUserInfo'
import { useAppConfig } from '@/components/utils/UseAppConfig'

const store = useStore()
const userInfo = useUserInfo()
const displayName = computed(() => {
  const userInfoObj = userInfo.userInfo.value
  let displayName = userInfoObj.nickname
  if (!displayName) {
    displayName = `${userInfoObj.first} ${userInfoObj.last}`
  }
  return displayName
})

const router = useRouter()
const pagePath = usePagePath()

const menu = ref()
let allItems = []
const appConfig = useAppConfig()
if (appConfig.rankingAndProgressViewsEnabled) {
  allItems.push({
    label: 'Progress and Ranking',
    icon: 'mdi-progress-clock',
    command: () => {
      router.push({ path: pagePath.progressAndRankingHomePage })
    },
    disabled: pagePath.isProgressAndRankingPage
  })
}

allItems.push({
  label: 'Project Admin',
  icon: 'mdi-wrench',
  command: () => {
    router.push({ path: pagePath.adminHomePage })
  },
  disabled: pagePath.isAdminPage
})
allItems.push({
  label: 'Settings',
  icon: 'mdi-cog',
  command: () => {
    router.push({ path: pagePath.settingsHomePage })
  },
  disabled: pagePath.isSettingsPage
})

// if (userInfo.isFormAuthenticatedUser.value) {
//   allItems.push({
//     separator: true
//   })
//   allItems.push({
//     label: 'Log Out',
//     icon: 'pi pi-sign-out',
//     command: () => {
//       store.dispatch('logout')
//     }
//   })
// }

const items = ref(allItems)

const toggle = (event) => {
  menu.value.toggle(event)
}

</script>

<template>
  <div class="">
    <v-menu>
      <template v-slot:activator="{ props }">
        <v-btn
          variant="outlined"
          color="indigo-darken-1"
          rounded="lg"
          v-bind="props"
          icon="mdi-account"
        >
        </v-btn>
      </template>

      <v-card class="mx-auto">
        <div class="pa-3 d-flex">
          <v-avatar color="indigo-darken-2" icon="mdi-account"></v-avatar>
          <div class="flex-grow-1 text-h6">
              {{ displayName }}
          </div>
        </div>

        <v-divider></v-divider>

        <v-list>
          <v-list-item
            v-for="(item, i) in items"
            :key="i"
            :value="item"
            :prepend-icon="item.icon"
          >
            <v-list-item-title v-text="item.label" class="text-left"></v-list-item-title>
          </v-list-item>

          <v-list-item v-if="userInfo.isFormAuthenticatedUser"
                       id="settings"
                       value="settings"
                       prepend-icon="mdi-cog">
            <v-list-item-title class="text-left">Settings</v-list-item-title>
          </v-list-item>

          <v-divider v-if="userInfo.isFormAuthenticatedUser"></v-divider>

          <v-list-item v-if="userInfo.isFormAuthenticatedUser"
            id="logOut"
            value="logOut"
            prepend-icon="mdi-logout"
          >
            <v-list-item-title class="text-left">Log Out</v-list-item-title>
          </v-list-item>

        </v-list>

<!--        <v-list>-->
<!--          <v-list-item-->
<!--            v-for="(item, index) in items"-->
<!--            :key="index"-->
<!--            :value="index"-->
<!--          >-->
<!--            <div v-if="item.label">-->
<!--              {{ item.label }}-->
<!--            </div>-->

<!--          </v-list-item>-->
<!--        </v-list>-->
      </v-card>

    </v-menu>


    <!--    <Button-->
<!--      icon="pi pi-user"-->
<!--      severity="info"-->
<!--      rounded-->
<!--      outlined-->
<!--      raised-->
<!--      @click="toggle"-->
<!--      aria-label="User Settings Button"-->
<!--      aria-haspopup="true"-->
<!--      aria-controls="user_settings_menu" />-->
<!--    <Menu ref="menu" id="user_settings_menu" :model="items" :popup="true">-->
<!--      <template #start>-->
<!--        <div class="mx-3 mt-2">-->
<!--          <Avatar icon="pi pi-user" class="bg-info text-white" />-->
<!--          <span data-cy="settingsButton-loggedInName" class="ms-1">{{ displayName }}</span>-->
<!--        </div>-->
<!--      </template>-->
<!--    </Menu>-->
  </div>
</template>

<style scoped></style>
