// import { defineStore } from 'pinia'

// export const useFiltersStore = defineStore({
//   id: 'filter-store',
//   state: () => {
//     return {
//       filtersList: ['youtube', 'twitch'],
//     }
//   },
//   actions: {
//     addValueToFilterList(value: string) {
//       this.filtersList.push(value)
//     },
//   },
//   getters: {
//     filtersList: state => state.filtersList,
//   },
// } )



// store/filters.ts
import { defineStore } from 'pinia'
import {ref} from "vue"

export const useFiltersStore = defineStore('filterStore', () => {
  const filtersList = ref( ['youtube', 'twitch'] )
  const distanceKm = ref( 50 )

  function addValueToFilterList(value: string) {
    filtersList.value.push(value)
  }

  
  return { addValueToFilterList, filtersList ,distanceKm }
})