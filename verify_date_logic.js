
const getLocalYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseSelectedDate = (selectedDate) => {
  const [year, month, day] = selectedDate.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  return dateObj;
};

// Test cases
const tests = [
  {
    name: "Standard date",
    date: new Date(2025, 4, 15, 12, 0, 0), // May 15, 2025, 12:00
    expectedStr: "2025-05-15"
  },
  {
    name: "Just after midnight",
    date: new Date(2025, 4, 15, 0, 1, 0), // May 15, 2025, 00:01
    expectedStr: "2025-05-15"
  },
  {
    name: "Just before midnight",
    date: new Date(2025, 4, 15, 23, 59, 0), // May 15, 2025, 23:59
    expectedStr: "2025-05-15"
  },
  {
    name: "New Year edge case",
    date: new Date(2025, 0, 1, 0, 5, 0), // Jan 1, 2025, 00:05
    expectedStr: "2025-01-01"
  }
];

let failures = 0;

console.log("--- Verifying getLocalYYYYMMDD ---");
tests.forEach(t => {
  const result = getLocalYYYYMMDD(t.date);
  if (result === t.expectedStr) {
    console.log(`✅ PASS: ${t.name} -> ${result}`);
  } else {
    console.log(`❌ FAIL: ${t.name} -> Expected ${t.expectedStr}, got ${result}`);
    failures++;
  }
});

console.log("\n--- Verifying parsing logic ---");
tests.forEach(t => {
  const dateObj = parseSelectedDate(t.expectedStr);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  
  // Note: we expect the parsed date to have the same year, month, day in LOCAL time
  if (year === t.date.getFullYear() && month === (t.date.getMonth() + 1) && day === t.date.getDate()) {
    console.log(`✅ PASS: Parsing ${t.expectedStr} matches local date`);
  } else {
    console.log(`❌ FAIL: Parsing ${t.expectedStr} -> Got ${year}-${month}-${day}, expected ${t.date.getFullYear()}-${t.date.getMonth()+1}-${t.date.getDate()}`);
    failures++;
  }
});

// Specifically test the potential UTC off-by-one bug if new Date(string) was used
console.log("\n--- Demonstrating why manual parsing is better than new Date(str) ---");
const dateStr = "2025-05-15";
const manualDate = parseSelectedDate(dateStr);
const nativeParsedDate = new Date(dateStr);

console.log(`Input string: ${dateStr}`);
console.log(`Manual parse (local): ${manualDate.toString()}`);
console.log(`Native parse (often UTC): ${nativeParsedDate.toString()}`);

if (manualDate.getDate() !== 15) {
  console.log("❌ FAIL: Manual parse failed to get day 15");
  failures++;
} else {
  console.log("✅ SUCCESS: Manual parse correctly got day 15 in local time");
}

if (failures > 0) {
  console.log(`\nFound ${failures} issues.`);
  process.exit(1);
} else {
  console.log("\nAll date logic verifications passed!");
  process.exit(0);
}
