let data = [];

// Load CSV from GitHub on page load
window.onload = () => {
    const CSV_URL = "https://raw.githubusercontent.com/nunoalves2310/LabelPrinter/refs/heads/main/StoreNames.csv";

    fetch(CSV_URL)
        .then(response => response.text())
        .then(csv => {
            const lines = csv.trim().split('\n');
            const headers = lines[0].split(',');

            data = lines.slice(1).map(row => {
                const values = row.split(',');
                let obj = {};
                headers.forEach((header, i) => {
                    obj[header.trim()] = values[i].trim();
                });
                return obj;
            });

            document.getElementById("statusMessage").textContent = "CSV file loaded from GitHub!";
        })
        .catch(err => {
            document.getElementById("statusMessage").textContent = "Failed to load CSV data.";
            console.error(err);
        });
};

// Print Button
document.getElementById("printButton").addEventListener("click", generateAndPrintName);

// Enter Key to Trigger Print
document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
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
        const barcodeUrl = `http://bwipjs-api.metafloor.com/?bcid=code128&text=A ${number}&scaleX=5&scaleY=0.5`;
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
                <\/script>
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

