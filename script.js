let data = [];
     // Toggle the visibility of the upload section
     document.getElementById("toggleUpload").addEventListener("click", () => {
        const uploadSection = document.getElementById("uploadSection");
        if (uploadSection.style.display === "none" || uploadSection.style.display === "") {
            uploadSection.style.display = "block"; // Show the section
        } else {
            uploadSection.style.display = "none"; // Hide the section
        }
    });
// Load data from localStorage when the page loads
window.onload = () => {
    const savedData = localStorage.getItem("excelData");
    if (savedData) {
        data = JSON.parse(savedData);
        document.getElementById("statusMessage").textContent = "Previously loaded Excel file has been reloaded!";
    }
};

// Handle Excel file upload
document.getElementById("excelInput").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const binaryData = new Uint8Array(e.target.result);
            const workbook = XLSX.read(binaryData, { type: "array" });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            data = XLSX.utils.sheet_to_json(firstSheet);

            // Save the Excel data to localStorage for future use
            localStorage.setItem("excelData", JSON.stringify(data));

            document.getElementById("statusMessage").textContent = "Excel file loaded successfully!";
        };
        reader.readAsArrayBuffer(file);
    } else {
        document.getElementById("statusMessage").textContent = "Failed to load Excel file.";
    }
});

// Listen for the Enter key globally
document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault(); // Prevent default form submission

        // Check if a number has been entered
        const number = document.getElementById("numberInput").value;
        if (number) {
            generateAndPrintName();
        } else {
            document.getElementById("statusMessage").textContent = "Please enter a number to proceed.";
        }
    }
});

function generateAndPrintName() {
    const number = document.getElementById("numberInput").value;
    const message = document.getElementById("messageInput").value;

    // Search for the number in the data
    const entry = data.find(row => row["Number"] == number);
    const name = entry ? entry["Name"] : "Unknown";

    document.getElementById("outputName").textContent = `Generated Name: ${name}`;

    // Get today's date
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

    // Print the number, name, date, and message
    if (name && name !== "Unknown") {
        const printWindow = window.open('', '', 'height=400,width=600');
        printWindow.document.write('<html><head><title>Print</title></head><body>');
        printWindow.document.write('<style>');
        printWindow.document.write('h1, h2 { text-align: center; }');
        printWindow.document.write('div { display: flex; justify-content: space-between; font-size: 12px; margin: 10px 20px 0 20px; }');
        printWindow.document.write('h1 { font-size: 60px; }');
        printWindow.document.write('h2 { font-size: 40px; }');
        printWindow.document.write('</style>');
        printWindow.document.write(`<h2>A ${number}</h2>`);        // First line: Name (centered)
        printWindow.document.write(`<h1>${name}</h1>`);      // Second line: Number (centered)
        printWindow.document.write(`<div><span>${formattedDate}</span><span>${message}</span></div>`); // Third line: Date (left) and Message (right)
        printWindow.document.write(`<h1> IT Hardware</h1>`);
        //printWindow.document.write(`<div><h2>Please place returned IT equipment into this tote</h2></div>`);
        
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    }
}
