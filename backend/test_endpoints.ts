
// import { describe, it, expect } from "bun:test"; 
// We'll just write a simple script
async function runTests() {
    const BASE_URL = "http://127.0.0.1:8000/api";

    console.log("Testing Register...");
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: "test@example.com",
            password: "password123",
            full_name: "Test User",
            role: "PATIENT"
        })
    });
    console.log("Register Status:", regRes.status);
    console.log("Register Body:", await regRes.text());

    console.log("\nTesting Login...");
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: "test@example.com",
            password: "password123"
        })
    });
    console.log("Login Status:", loginRes.status);
    const loginData = await loginRes.json();
    console.log("Login Body:", loginData);

    const token = loginData.access_token;
    if (!token) {
        console.error("Login failed, cannot test search");
        return;
    }

    console.log("\nTesting Search...");
    const searchRes = await fetch(`${BASE_URL}/search-blood`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            latitude: 12.9716,
            longitude: 77.5946,
            blood_type: "A+",
            sort_by: "distance"
        })
    });
    console.log("Search Status:", searchRes.status);
    console.log("Search Body:", await searchRes.json());
}

runTests().catch(console.error);
