import { SHOWROOM_VEHICLES } from "./data";

console.log("Current total vehicles in SHOWROOM_VEHICLES:", SHOWROOM_VEHICLES.length);
const summary = SHOWROOM_VEHICLES.map((v, i) => `${i+1}. [${v.id}] ${v.year} ${v.make} ${v.model} (${v.price})`);
console.log(summary.slice(0, 15).join("\n"));
console.log("...");
console.log(summary.slice(summary.length - 15).join("\n"));
