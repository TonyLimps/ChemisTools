<script setup lang="ts">

import Parser, {ParseError} from "./chemistry/Parser.ts";
import {Equation} from "./chemistry/Equation.ts";
import {ref} from "vue";

const reactants = ref('');
const products = ref('');
const information = ref('');
const balanced = ref(false);

function balance() {
    let reactantFormulas;
    try {
        reactantFormulas = Parser.parseFormulas(reactants.value.trim());
    } catch (e) {
        const message = (e as ParseError).message;
        const start = (e as ParseError).start;
        const end = (e as ParseError).end;
        let message1 = reactants.value.slice(0, start);
        let message2 = reactants.value.slice(start, end - start + 1);
        let message3 = reactants.value.slice(end);
        information.value = `${message}: ${message1}<mark style="background:#ffeb3b; color:#000;">${message2}</mark>${message3}`;
        return;
    }
    let productFormulas;
    try {
        productFormulas = Parser.parseFormulas(products.value.trim());
    } catch (e) {
        const message = (e as ParseError).message;
        const start = (e as ParseError).start;
        const end = (e as ParseError).end;
        let message3 = products.value.substring(end);
        let message2 = products.value.substring(start, end - start + 1);
        let message1 = products.value.substring(0, start);
        information.value = `${message}: ${message1}<mark style="background:#ffeb3b; color:#000;">${message2}</mark>${message3}`;
        return;
    }
    let equation = new Equation(reactantFormulas, productFormulas);
    try {
        equation.balance();
        balanced.value = true;
        information.value = `配平成功: ${equation.toString()}`;
    } catch (e) {
        let message = (e as ParseError).message;
        information.value = `配平失败: ${message}`;
    }
}

function clean() {
    reactants.value = '';
    products.value = '';
    information.value = '';
    balanced.value = false;
}
</script>

<template>
    <div class="container">
        <div class="equation">
            <input v-model="reactants"
                   placeholder="输入反应物"/>
            <span> ===> </span>
            <input v-model="products"
                   placeholder="输入生成物"/>
        </div>
        <div class="operations">
            <button @click="balance">尝试配平</button>
            <button v-if="balanced" @click="clean">再试一个</button>
        </div>
        <div class="information">
            <span v-html="information"></span>
        </div>
    </div>
</template>

<style scoped>
.equation {
    display: flex;
}

.equation > * {
    margin: 5px;
    text-align: center;
    font-size: 20px;
}

.equation > input {
    padding: 0 5px;
    field-sizing: content;

    min-width: 10ch;
    font-size: 20px;

    outline: none;
    border: none;

    border-bottom: 2px solid black;
}
</style>