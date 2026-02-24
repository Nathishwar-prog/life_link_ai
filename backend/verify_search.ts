// using global fetch


async function verify() {
    try {
        console.log("1. Checking Inventory...");
        const invRes = await fetch('http://localhost:8000/api/inventory');
        const invData = await invRes.json();
        // console.log("Inventory:", JSON.stringify(invData, null, 2));

        console.log("2. Updating inventory...");
        const updateRes = await fetch('http://localhost:8000/api/inventory/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                blood_type: 'O+',
                units: 5,
                action: 'ADD'
            })
        });
        const updateData = await updateRes.json();
        console.log("Update Result:", JSON.stringify(updateData, null, 2));

        console.log("3. Search nearby (0,0)...");
        const searchRes = await fetch('http://localhost:8000/api/search-blood', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                latitude: 0,
                longitude: 0,
                blood_type: 'O+'
            })
        });
        const searchData = await searchRes.json();
        console.log("Search Response:", JSON.stringify(searchData, null, 2));

    } catch (err) {
        console.error("Verification failed:", err);
    }
}

verify();
