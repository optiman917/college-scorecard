import cip_2_digit from "../../../../_data/cip_2_digit.json";
import cip_4_digit from "../../../../_data/cip_4_digit.json";
import glossary from "../../../../_data/glossary.json";
import race_ethnicity from "../../../../_data/race_ethnicity.json";
import religious_affiliations from "../../../../_data/religious_affiliations.json";
import special_designations from "../../../../_data/special_designations.json";
import states from "../../../../_data/states.json";

export const SiteData = {
  computed:{
    RELIGIOUS_AFFILIATIONS_BY_NUMBER(){
      return this.site.data.religious_affiliations.reduce( function(object,value){
        object[value.value] = value.label;
        return object;
      }, {});
    },
    CIP2(){
      return this.site.data.cip_2_digit.reduce( function(object,value){
        object[value.label] = value.value;
        return object;
      }, {});
    },
    CIP4(){
      return this.site.data.cip_4_digit.map(function(value,key){
        return {cip4: value.label, field: value.value.replace('.','')}
      });
    }

  },
  data(){
    return {
      site:{
        data: {
          cip_2_digit: cip_2_digit,
          cip_4_digit: cip_4_digit,
          glossary: glossary,
          race_ethnicity: race_ethnicity,
          religious_affiliations: religious_affiliations,
          special_designations: special_designations,
          states: states
        }
      }
    }
  }
}