<script setup lang="ts">

import Parser from "./chemistry/Parser.ts";
import {ref} from "vue";
import {Equation} from "./chemistry/Equation.ts";

const text = ref('');
const res = ref('');

function parse() {

    /*
    const KNO3 = Parser.parse("KNO3");
    const FeCl2 = Parser.parse("FeCl2");
    const HCl = Parser.parse("HCl");
    const KCl = Parser.parse("KCl");
    const FeCl3 = Parser.parse("FeCl3");
    const NO = Parser.parse("NO");
    const H2O = Parser.parse("H2O");
    const eq = new Equation([KNO3, FeCl2, HCl], [KCl, FeCl3, NO, H2O]);
     */

    /*
    const FeS2 = Parser.parse("FeS2");
    const O2 = Parser.parse("O2");
    const Fe2O3 = Parser.parse("Fe2O3");
    const SO2 = Parser.parse("SO2");
    const eq = new Equation([FeS2, O2], [Fe2O3, SO2]);

     */

    /*
    const P4 = Parser.parse("P4");
    const CuSO4 = Parser.parse("CuSO4");
    const H2O = Parser.parse("H2O");

    const Cu3P = Parser.parse("Cu3P");
    const H3PO4 = Parser.parse("H3PO4");
    const H2SO4 = Parser.parse("H2SO4");
    const eq = new Equation([P4, CuSO4, H2O],[Cu3P, H3PO4, H2SO4]);

     */

    const K4FeCN6 = Parser.parse("K4Fe(CN)6");
    const KMnO4 = Parser.parse("KMnO4");
    const H2SO4 = Parser.parse("H2SO4");

    const CO2 = Parser.parse("CO2");
    const KNO3 = Parser.parse("KNO3");
    const H2O = Parser.parse("H2O");
    const K2SO4 = Parser.parse("K2SO4");
    const MnSO4 = Parser.parse("MnSO4");
    const Fe2SO43 = Parser.parse("Fe2(SO4)3");

    const eq = new Equation([K4FeCN6, KMnO4, H2SO4],[CO2,KNO3,H2O,K2SO4,MnSO4,Fe2SO43])
    eq.balance();
    let s = eq.toString();
    console.log(s);
}
</script>

<template>
    <input v-model="text"/>
    <button @click="parse">123</button>
    <p> {{ res }} </p>
</template>

<style scoped></style>