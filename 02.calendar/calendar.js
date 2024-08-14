#!/usr/bin/env node

import minimist from "minimist";

const args = minimist(process.argv.slice(2));

const now = new Date();
const year = args.y || now.getFullYear();
const month = args.m || now.getMonth() + 1;

const firstDay = new Date(year, month - 1, 1);
const lastDay = new Date(year, month, 0);

console.log(`\n      ${month}月 ${year}`);
console.log("日 月 火 水 木 金 土");

let days = [];
let currentDay = firstDay.getDay();

for (let i = 0; i < currentDay; i++) {
  days.push("  ");
}

for (let day = 1; day <= lastDay.getDate(); day++) {
  const newDay = day.toString().padStart(2, " ");
  days.push(newDay);

  if ((currentDay + day) % 7 === 0) {
    console.log(days.join(" "));
    days = [];
  }
}

if (days.length > 0) {
  console.log(days.join(" "));
}
