const users = require("./users");
const config = require("./config");

console.log("🚀 Fair Drop Simulator Started");

console.log(`Total users: ${config.totalUsers}`);
console.log(`Human users: ${config.humanUsers}`);
console.log(`Bot users: ${config.botUsers}`);

console.log("\n👥 Test users:");

users.forEach((user) => {
  console.log(`${user.id} - ${user.name} - ${user.type}`);
});

console.log("\n🎯 Starting Fair Drop...");

const winners = [];

const shuffledUsers = [...users].sort(() => Math.random() - 0.5);

for (let i = 0; i < Math.min(5, shuffledUsers.length); i++) {
    winners.push(shuffledUsers[i]);
}

console.log("\n🏆 Winners:");

winners.forEach((winner, index) => {
    console.log(`${index + 1}. ${winner.name} - ${winner.type}`);
});