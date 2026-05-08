import {
  generateAnonymousId,
  generateAnonymousIdWithHash,
  isValidAnonymousId,
  hashAnonymousId,
} from "../utils/anonymousId.js";

// Test the anonymous ID system
console.log("Testing Anonymous ID System...\n");

// Test 1: Generate basic anonymous ID
console.log("1. Testing basic anonymous ID generation:");
const anonId1 = generateAnonymousId();
console.log(`   Generated: ${anonId1}`);
console.log(`   Valid: ${isValidAnonymousId(anonId1)}`);
console.log(`   Length: ${anonId1.length}`);
console.log("");

// Test 2: Generate unique anonymous ID with hash
console.log("2. Testing unique anonymous ID with hash:");
const { anonId: anonId2, hash: hash2 } = generateAnonymousIdWithHash();
console.log(`   Generated: ${anonId2}`);
console.log(`   Hash: ${hash2}`);
console.log(`   Valid: ${isValidAnonymousId(anonId2)}`);
console.log("");

// Test 3: Test validation
console.log("3. Testing validation:");
const testIds = [
  "ABC123",
  "123ABC",
  "ABC12345",
  "abc123",
  "ABC-123",
  "ABC 123",
  "",
  null,
  undefined,
];

testIds.forEach((id) => {
  console.log(`   "${id}" -> Valid: ${isValidAnonymousId(id)}`);
});
console.log("");

// Test 4: Test hash generation
console.log("4. Testing hash generation:");
const testId = "TEST123";
const testHash = hashAnonymousId(testId);
console.log(`   ID: ${testId}`);
console.log(`   Hash: ${testHash}`);
console.log(`   Hash length: ${testHash.length}`);
console.log("");

// Test 5: Test uniqueness
console.log("5. Testing uniqueness:");
const generatedIds = new Set();
for (let i = 0; i < 100; i++) {
  generatedIds.add(generateAnonymousId());
}
console.log(`   Generated 100 IDs, unique: ${generatedIds.size}`);
console.log(
  `   All valid: ${Array.from(generatedIds).every((id) =>
    isValidAnonymousId(id)
  )}`
);

console.log("\n✅ Anonymous ID system tests completed successfully!");
