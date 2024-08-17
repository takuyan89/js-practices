#!/usr/bin/env node

import minimist from "minimist";

const args = minimist(process.argv.slice(2));

const now = new Date();
const year = args.y || now.getFullYear();
const month = args.m || now.getMonth() + 1;

const firstDateOfMonth = new Date(year, month - 1, 1);
const lastDateOfMonth = new Date(year, month, 0);

console.log(`      ${month}月 ${year}`);
console.log("日 月 火 水 木 金 土");

let days = [];

for (let i = 0; i < firstDateOfMonth.getDay(); i++) {
  days.push("  ");
}

for (let date = 1; date <= lastDateOfMonth.getDate(); date++) {
  const formattedDate = date.toString().padStart(2, " ");
  days.push(formattedDate);

  if ((firstDateOfMonth.getDay() + date) % 7 === 0) {
    console.log(days.join(" "));
    days = [];
  }
}

if (days.length > 0) {
  console.log(days.join(" "));
}
