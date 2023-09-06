import { defineStore } from 'pinia'
import {ref} from "vue"

export const useChartsDataStore = defineStore('chartsDataStore', () => {
  const chartsData:Ref<any[]> = ref( [] )
  

  function addValueToChartsData  (value: any) {
    chartsData.value.push(value )
  }

  function reInit () {
    chartsData.value = []
    
  }

  
  return { addValueToChartsData,chartsData,reInit }
})