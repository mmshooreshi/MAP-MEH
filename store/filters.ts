import { defineStore } from 'pinia'
import {ref} from "vue"

export const useFiltersStore = defineStore('filterStore', () => {
  const filtersList = ref( ['youtube', 'twitch'] )
  const distanceKm = ref( 25 )

  function addValueToFilterList(value: string) {
    filtersList.value.push(value)
  }

  function replaceDistanceKm(value: number) {
    distanceKm.value=value
  }

  
  return { addValueToFilterList,replaceDistanceKm, filtersList ,distanceKm }
})