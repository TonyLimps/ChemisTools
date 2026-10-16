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

    const FeS2 = Parser.parse("FeS2");
    const O2 = Parser.parse("O2");
    const Fe2O3 = Parser.parse("Fe2O3");
    const SO2 = Parser.parse("SO2");
    const eq = new Equation([FeS2, O2], [Fe2O3, SO2]);
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