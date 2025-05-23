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
document.getElementById("printButton").addEventListener("click", generateAndPrintName);
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
        //event.preventDefault(); // Prevent default form submission

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
    const includeExtras = document.getElementById("extraPagesCheckbox").checked;

    const entry = data.find(row => row["Number"] == number);
    const name = entry ? entry["Name"] : "Unknown";
    document.getElementById("outputName").textContent = `Generated Name: ${name}`;

    const today = new Date().toLocaleDateString('en-GB', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });

    if (name && name !== "Unknown") {
        const barcodeUrl = `http://bwipjs-api.metafloor.com/?bcid=code128&text=${number}&scaleX=5&scaleY=0.5`;
        const printWindow = window.open('', '', 'width=1000,height=800');

        let html = `
            <html>
            <head>
                <title>Print</title>
                <style>
                    @page {
                        size: 10cm 8cm;
                        margin: 2;
                    }
                    body {
                        margin: 0;
                        font-family: Arial, sans-serif;
                    }
                    .label {
                        width: 9.5cm;
                        height: 7.5cm;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        page-break-after: always;
                        text-align: center;
                    }
                    h1 { font-size: 60px; margin: 10px 0; }
                    h2 { font-size: 40px; margin: 0; }
                    .info-row {
                        width: 90%;
                        display: flex;
                        justify-content: space-between;
                        font-size: 10px;
                        margin-top: 20px;
                    }
                    img { margin-top: 0; }
                </style>
            </head>
            <body>
                <div class="label">
                    <h2>A ${number}</h2>
                    <h1>${name}</h1>
                    <img id="barcode" alt="Barcode for ${number}" src="${barcodeUrl}">
                    <div class="info-row"><span>${today}</span><span>${message}</span></div>
                </div>

                <div class="label">
                    <div style="font-size: 80px; font-weight: bold;">IT Hardware</div>
                </div>
        `;

        if (includeExtras) {
            html += `
                <div class="label">
                    <p style="font-size: 26px;">Kindly place the returned IT equipment into this tote and securely attach the return label to the outside of the tote.</p>
                </div>

                <div class="label">
                     <div style="font-size: 80px; font-weight: bold;">Return to IT</div>
                </div>
            `;
        }

        html += `
                <script>
                    const img = document.getElementById('barcode');
                    img.onload = function() {
                        setTimeout(() => {
                            window.print();
                        }, 100);
                    };
                    window.onafterprint = function() {
                        window.close();
                    };
                </script>
            </body>
            </html>
        `;

        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
    } else {
        document.getElementById("statusMessage").textContent = "Please enter a valid number with a known name.";
    }
}
