document.addEventListener("DOMContentLoaded", function () {
    // --------- DATA MANAGEMENT ---------
    let graves = JSON.parse(localStorage.getItem("graves")) || [];
    const cemeterySections = [
        { id: "sectionA", name: "Section A", fill: "#AED6F1" },
        { id: "sectionB", name: "Section B", fill: "#D5F5E3" },
        { id: "sectionC", name: "Diagonal C", fill: "#FADBD8" },
        { id: "sectionD", name: "Section D", fill: "#F5B7B1" },
        { id: "sectionE", name: "Section E", fill: "#82E0AA" },
        { id: "sectionF", name: "Diagonal F", fill: "#F7DC6F" },
        { id: "sectionG", name: "Diagonal G", fill: "#BB8FCE" },
        { id: "sectionH", name: "Diagonal H", fill: "#85C1E9" },
        { id: "sectionI", name: "Diagonal I", fill: "#96C2f0" },
        { id: "sectionJ", name: "Diagonal J", fill: "#015C20" },
        { id: "sectionK", name: "Diagonal K", fill: "#512563" }


    ];

    // Plot configuration with consistent structure X = Horizontal, Y = Vertical
    const plotConfigs = {
        "A": { rows: 5, cols: 10, plotWidth: 15, plotHeight: 20, startX: 1840, startY: 320, spacing: 0 },
        "B": { rows: 5, cols: 10, plotWidth: 15, plotHeight: 20, startX: 2000, startY: 320, spacing: 0 },
        "C": { rows: 10, cols: 5, plotWidth: 20, plotHeight: 15, startX: 2160, startY: 320, spacing: 0 },
        "D": { rows: 10, cols: 5, plotWidth: 20, plotHeight: 15, startX: 2160, startY: 480, spacing: 0 },
        "E": { rows: 10, cols: 5, plotWidth: 20, plotHeight: 15, startX: 2160, startY: 640, spacing: 0 },
        "F": { rows: 10, cols: 5, plotWidth: 20, plotHeight: 15, startX: 2160, startY: 800, spacing: 0 },
        "G": { rows: 5, cols: 10, plotWidth: 15, plotHeight: 20, startX: 2000, startY: 850, spacing: 0 },
        "H": { rows: 5, cols: 10, plotWidth: 15, plotHeight: 20, startX: 1840, startY: 850, spacing: 0 },
        "I": { rows: 14, cols: 7, plotWidth: 15, plotHeight: 20, startX: 1460, startY: 370, spacing: 3 },
        "J": { rows: 9, cols: 7, plotWidth: 15, plotHeight: 20, startX: 2040, startY: 440, spacing: 1 },
        "K": { rows: 9, cols: 7, plotWidth: 15, plotHeight: 20, startX: 2040, startY: 650, spacing: 1, }

    };


    // --------- DOM REFERENCES ---------
    const elements = {
        // Main elements
        graveTableBody: document.getElementById("graveTableBody"),
        tooltip: document.getElementById("tooltip"),
        cemeteryCanvas: document.getElementById("cemeteryCanvas"),
        ctx: document.getElementById("cemeteryCanvas").getContext("2d"),
        recordForm: document.getElementById("recordForm"),
        recordSection: document.getElementById("recordSection"),
        recordPlot: document.getElementById("recordPlot"),

        // Dashboard elements
        totalPlots: document.getElementById("totalPlots"),
        availablePlots: document.getElementById("availablePlots"),
        occupiedPlots: document.getElementById("occupiedPlots"),
        recentRecords: document.getElementById("recentRecords"),

        // Section view buttons
        viewAllSections: document.getElementById("viewAllSections"),
        viewSectionA: document.getElementById("viewSectionA"),
        viewSectionB: document.getElementById("viewSectionB"),
        viewSectionC: document.getElementById("viewSectionC"),
        viewSectionD: document.getElementById("viewSectionD"),
        viewSectionE: document.getElementById("viewSectionE"),
        viewSectionF: document.getElementById("viewSectionF"),
        viewSectionG: document.getElementById("viewSectionG"),
        viewSectionH: document.getElementById("viewSectionH"),
        viewSectionI: document.getElementById("viewSectionI"),
        viewSectionJ: document.getElementById("viewSectionJ"),
        viewSectionK: document.getElementById("viewSectionK"),



        // Action buttons
        saveRecord: document.getElementById("saveRecord"),
        searchRecords: document.getElementById("searchRecords")
    };

    // --------- INITIALIZATION ---------
    initializeApp();

    function initializeApp() {
        window.plotsData = []; // Initialize plots data array
        drawCemeteryMap();
        updateGraveTable();
        updateDashboardStats();
        generatePlotOptions("A");
        setupEventListeners();
        createDashboardCharts();
    }

    // --------- CEMETERY VISUALIZATION ---------
    function drawCemeteryMap(filterSection = null) {
        // Clear canvas and plot data
        elements.ctx.clearRect(0, 0, elements.cemeteryCanvas.width, elements.cemeteryCanvas.height);
        window.plotsData = [];

        // Filter sections if needed
        const sectionsToShow = filterSection ?
            cemeterySections.filter(section => section.id === `section${filterSection}`) :
            cemeterySections;

        // Draw sections
        sectionsToShow.forEach(section => {
            drawSection(section);
        });
    }

    function drawSection(section) {
        // Draw section background
        elements.ctx.fillStyle = section.fill;
        elements.ctx.strokeStyle = "#495057";
        elements.ctx.lineWidth = 2;
        elements.ctx.fillRect(section.x, section.y, section.width, section.height);
        elements.ctx.strokeRect(section.x, section.y, section.width, section.height);

        // Draw section label
        elements.ctx.fillStyle = "#212529";
        elements.ctx.font = "bold 16px Arial";
        elements.ctx.fillText(section.name, section.x + 10, section.y + 20);

        // Determine which section this is
        const sectionId = section.name.split(" ")[1];
        const config = plotConfigs[sectionId];

        // Draw plots for this section
        drawPlotsForSection(sectionId, config);
    }

    function drawPlotsForSection(sectionId, config) {
        for (let row = 0; row < config.rows; row++) {
            for (let col = 0; col < config.cols; col++) {
                const plotId = `${sectionId}${row * config.cols + col + 1}`;
                const x = config.startX + col * (config.plotWidth + config.spacing);
                const y = config.startY + row * (config.plotHeight + config.spacing);

                // Find if grave exists for this plot
                const grave = graves.find(g => g.plot === plotId);

                // Draw plot with appropriate color
                drawPlot(x, y, config.plotWidth, config.plotHeight, plotId, grave);

                // Store plot data for interaction
                storePlotData(plotId, x, y, config.plotWidth, config.plotHeight, sectionId, grave);
            }
        }
    }

    function drawPlot(x, y, width, height, plotId, grave) {
        // Set color based on plot type or availability
        if (grave) {
            switch (grave.type) {
                case "standard": elements.ctx.fillStyle = "#a0d8f1"; break;
                case "columbarium": elements.ctx.fillStyle = "#f5b7b1"; break;
                case "mausoleum": elements.ctx.fillStyle = "#c5a3ff"; break;
                case "memorial": elements.ctx.fillStyle = "#b5e7a0"; break;
                default: elements.ctx.fillStyle = "#f8f9fa";
            }
        } else {
            elements.ctx.fillStyle = "#f8f9fa"; // Available plot
        }

        // Draw the plot rectangle
        elements.ctx.strokeStyle = "#bbb";
        elements.ctx.lineWidth = 1;
        elements.ctx.fillRect(x, y, width, height);
        elements.ctx.strokeRect(x, y, width, height);

        // Add plot number
        elements.ctx.fillStyle = "#212529";
        elements.ctx.font = "12px Arial";
        elements.ctx.fillText(plotId, x + width / 2 - 10, y + height / 2 + 4);
    }

    function storePlotData(plotId, x, y, width, height, sectionId, grave) {
        const plotData = {
            id: plotId,
            x: x,
            y: y,
            width: width,
            height: height,
            section: sectionId,
            occupied: grave ? true : false,
            grave: grave
        };

        // Add to global plots data array
        if (!window.plotsData) window.plotsData = [];
        window.plotsData.push(plotData);
    }

    // --------- DASHBOARD VISUALIZATION ---------
    function createDashboardCharts() {
        createPlotTypesChart();
        createSectionOccupancyChart();
    }

    function createPlotTypesChart() {
        // Get plot type counts
        const typeCounts = {
            standard: graves.filter(g => g.type === "standard").length,
            columbarium: graves.filter(g => g.type === "columbarium").length,
            mausoleum: graves.filter(g => g.type === "mausoleum").length,
            memorial: graves.filter(g => g.type === "memorial").length
        };

        // Create plot types chart
        const plotTypesCtx = document.getElementById('plotTypesChart').getContext('2d');
        new Chart(plotTypesCtx, {
            type: 'pie',
            data: {
                labels: ['Standard', 'Columbarium', 'Mausoleum', 'Memorial'],
                datasets: [{
                    data: [typeCounts.standard, typeCounts.columbarium, typeCounts.mausoleum, typeCounts.memorial],
                    backgroundColor: ['#a0d8f1', '#f5b7b1', '#c5a3ff', '#b5e7a0']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }

    function createSectionOccupancyChart() {
        // Get section occupancy
        const sectionCounts = {
            A: { occupied: graves.filter(g => g.section === "A").length, total: plotConfigs.A.rows * plotConfigs.A.cols },
            B: { occupied: graves.filter(g => g.section === "B").length, total: plotConfigs.B.rows * plotConfigs.B.cols },
            C: { occupied: graves.filter(g => g.section === "C").length, total: plotConfigs.C.rows * plotConfigs.C.cols },
            D: { occupied: graves.filter(g => g.section === "D").length, total: plotConfigs.D.rows * plotConfigs.D.cols },
            E: { occupied: graves.filter(g => g.section === "E").length, total: plotConfigs.E.rows * plotConfigs.E.cols },
            F: { occupied: graves.filter(g => g.section === "F").length, total: plotConfigs.F.rows * plotConfigs.F.cols },
            G: { occupied: graves.filter(g => g.section === "G").length, total: plotConfigs.G.rows * plotConfigs.G.cols },
            H: { occupied: graves.filter(g => g.section === "H").length, total: plotConfigs.H.rows * plotConfigs.H.cols },
            I: { occupied: graves.filter(g => g.section === "I").length, total: plotConfigs.I.rows * plotConfigs.I.cols },
            J: { occupied: graves.filter(g => g.section === "J").length, total: plotConfigs.J.rows * plotConfigs.J.cols },
            K: { occupied: graves.filter(g => g.section === "K").length, total: plotConfigs.K.rows * plotConfigs.K.cols },

        };

        // Create section occupancy chart
        const sectionOccupancyCtx = document.getElementById('sectionOccupancyChart').getContext('2d');
        new Chart(sectionOccupancyCtx, {
            type: 'bar',
            data: {
                labels: ['Section A', 'Section B', 'Section C', 'Section D', 'Section E', 'Section F', 'Section G', 'Section H', 'Section I', 'Section J', 'Section K'],
                datasets: [
                    {
                        label: 'Occupied',
                        data: [sectionCounts.A.occupied, sectionCounts.B.occupied, sectionCounts.C.occupied, sectionCounts.D.occupied, sectionCounts.E.occupied, sectionCounts.F.occupied, sectionCounts.G.occupied, sectionCounts.H.occupied, sectionCounts.I.occupied, sectionCounts.J.occupied, sectionCounts.K.occupied],
                        backgroundColor: '#dc3545'
                    },
                    {
                        label: 'Available',
                        data: [
                            sectionCounts.A.total - sectionCounts.A.occupied,
                            sectionCounts.B.total - sectionCounts.B.occupied,
                            sectionCounts.C.total - sectionCounts.C.occupied,
                            sectionCounts.D.total - sectionCounts.D.occupied,
                            sectionCounts.E.total - sectionCounts.E.occupied,
                            sectionCounts.F.total - sectionCounts.F.occupied,
                            sectionCounts.G.total - sectionCounts.G.occupied,
                            sectionCounts.H.total - sectionCounts.H.occupied,
                            sectionCounts.I.total - sectionCounts.I.occupied,
                            sectionCounts.J.total - sectionCounts.J.occupied,
                            sectionCounts.K.total - sectionCounts.K.occupied,


                        ],
                        backgroundColor: '#28a745'
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        stacked: true
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function updateDashboardStats() {
        // Calculate statistics
        const totalPlots = Object.values(plotConfigs).reduce((sum, config) => sum + (config.rows * config.cols), 0);
        const occupiedPlots = graves.length;
        const availablePlots = totalPlots - occupiedPlots;
        const recentRecords = graves.filter(g => {
            const deathDate = new Date(g.death);
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            return deathDate >= oneMonthAgo;
        }).length;

        // Update dashboard elements
        elements.totalPlots.textContent = totalPlots;
        elements.occupiedPlots.textContent = occupiedPlots;
        elements.availablePlots.textContent = availablePlots;
        elements.recentRecords.textContent = recentRecords;
    }

    // --------- TABLE MANAGEMENT ---------
    function updateGraveTable() {
        renderGraveRows(graves);
        attachRecordEventListeners();
    }

    function updateFilteredGraveTable(filteredGraves) {
        renderGraveRows(filteredGraves);
        attachRecordEventListeners();
    }

    function renderGraveRows(gravesToDisplay) {
        elements.graveTableBody.innerHTML = "";

        gravesToDisplay.forEach(grave => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${grave.id}</td>
                <td>${grave.name}</td>
                <td>${formatDate(grave.birth)}</td>
                <td>${formatDate(grave.death)}</td>
                <td>Section ${grave.section}</td>
                <td>${grave.plot}</td>
                <td><span class="badge bg-secondary">${capitalizeFirstLetter(grave.type)}</span></td>
                <td>
                    <button class="btn btn-outline-primary btn-sm me-1 edit-record" data-id="${grave.id}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger btn-sm delete-record" data-id="${grave.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;

            // Apply color class to badge based on plot type
            styleBadgeByPlotType(row, grave.type);

            elements.graveTableBody.appendChild(row);
        });
    }

    function styleBadgeByPlotType(row, plotType) {
        const badge = row.querySelector(".badge");
        switch (plotType) {
            case "standard": badge.classList.replace("bg-secondary", "bg-info"); break;
            case "columbarium": badge.classList.replace("bg-secondary", "bg-danger"); break;
            case "mausoleum": badge.classList.replace("bg-secondary", "bg-primary"); break;
            case "memorial": badge.classList.replace("bg-secondary", "bg-success"); break;
        }
    }

    function attachRecordEventListeners() {
        // Update event listeners for edit and delete buttons
        document.querySelectorAll(".edit-record").forEach(button => {
            button.addEventListener("click", function () {
                const graveId = parseInt(this.getAttribute("data-id"));
                editRecord(graveId);
            });
        });

        document.querySelectorAll(".delete-record").forEach(button => {
            button.addEventListener("click", function () {
                const graveId = parseInt(this.getAttribute("data-id"));
                deleteRecord(graveId);
            });
        });
    }

    // --------- PLOT MANAGEMENT ---------
    function generatePlotOptions(section) {
        elements.recordPlot.innerHTML = '<option value="">Select Plot</option>';

        const config = plotConfigs[section];
        const totalPlots = config.rows * config.cols;

        for (let i = 1; i <= totalPlots; i++) {
            const plotId = `${section}${i}`;
            const isOccupied = graves.some(g => g.plot === plotId);

            if (!isOccupied) {
                const option = document.createElement("option");
                option.value = plotId;
                option.textContent = plotId;
                elements.recordPlot.appendChild(option);
            }
        }
    }


    // --------- RECORD MANAGEMENT ---------





    function showPlotDetails(plotData) {
        const grave = plotData.grave;
        const plotDetailsTitle = document.getElementById("plotDetailsTitle");
        const plotDetailsBody = document.getElementById("plotDetailsBody");

        plotDetailsTitle.textContent = `Plot ${plotData.id} - ${grave.name}`;

        plotDetailsBody.innerHTML = `
            <div class="mb-3">
                <p><strong>Name:</strong> ${grave.name}</p>
                <p><strong>Birth Date:</strong> ${formatDate(grave.birth)}</p>
                <p><strong>Death Date:</strong> ${formatDate(grave.death)}</p>
                <p><strong>Section:</strong> Section ${grave.section}</p>
                <p><strong>Plot:</strong> ${grave.plot}</p>
                <p><strong>Plot Type:</strong> ${capitalizeFirstLetter(grave.type)}</p>
                <p><strong>Record ID:</strong> ${grave.id}</p>
            </div>
        `;

        const editButton = document.getElementById("editPlotRecord");
        editButton.setAttribute("data-id", grave.id);
        editButton.addEventListener("click", function () {
            const graveId = parseInt(this.getAttribute("data-id"));
            editRecord(graveId);

            // Close details modal
            const plotDetailsModal = bootstrap.Modal.getInstance(document.getElementById('plotDetailsModal'));
            plotDetailsModal.hide();
        });

        // Show the modal
        const plotDetailsModal = new bootstrap.Modal(document.getElementById('plotDetailsModal'));
        plotDetailsModal.show();
    }

    function openAddRecordModal(section, plotId) {
        // Reset form
        elements.recordForm.reset();
        document.getElementById("recordId").value = "";

        // Set section and plot in form
        document.getElementById("recordSection").value = section;
        generatePlotOptions(section);
        document.getElementById("recordPlot").value = plotId;

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('addRecordModal'));
        modal.show();
    }

    function editRecord(id) {
        const grave = graves.find(g => g.id === id);
        if (!grave) return;

        // Fill form with record data
        document.getElementById("recordId").value = grave.id;
        document.getElementById("recordName").value = grave.name;
        document.getElementById("recordBirth").value = grave.birth;
        document.getElementById("recordDeath").value = grave.death;
        document.getElementById("recordSection").value = grave.section;

        // Generate plot options including the current plot
        generatePlotOptions(grave.section);
        const plotSelect = document.getElementById("recordPlot");

        // Add current plot as an option
        const plotOption = document.createElement("option");
        plotOption.value = grave.plot;
        plotOption.textContent = grave.plot;
        plotSelect.appendChild(plotOption);
        plotSelect.value = grave.plot;

        document.getElementById("recordType").value = grave.type;

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('addRecordModal'));
        modal.show();
    }

    function showSuccessMessage(message) {
        let successMessage = document.createElement("div");
        successMessage.textContent = message;
        successMessage.style.position = "fixed";
        successMessage.style.top = "10px";
        successMessage.style.right = "10px";
        successMessage.style.background = "green";
        successMessage.style.color = "white";
        successMessage.style.padding = "12px 20px";
        successMessage.style.borderRadius = "5px";
        successMessage.style.boxShadow = "0px 2px 5px rgba(0, 0, 0, 0.3)";
        successMessage.style.zIndex = "1000";
        successMessage.style.fontSize = "16px";
        successMessage.style.opacity = "1";
        successMessage.style.transition = "opacity 0.5s ease-in-out";

        document.body.appendChild(successMessage);

        // Hide message after 3 seconds
        setTimeout(() => {
            successMessage.style.opacity = "0";
            setTimeout(() => successMessage.remove(), 500); // Remove after fade-out
        }, 3000);
    }

    function saveRecord() {
        console.log("saveRecord() triggered"); // Debugging: Check if function runs
    
        // Get form values
        const id = document.getElementById("recordId").value;
        const name = document.getElementById("recordName").value;
        const birth = document.getElementById("recordBirth").value;
        const death = document.getElementById("recordDeath").value;
        const section = document.getElementById("recordSection").value;
        const plot = document.getElementById("recordPlot").value;
        const type = document.getElementById("recordType").value;
    
        // Validate form
        if (!name || !birth || !death || !section || !plot || !type) {
            alert("Please fill in all required fields.");
            return;
        }
    
        let message = id ? "Record successfully updated!" : "Record successfully added!";
    
        if (id) {
            // Update existing record
            const index = graves.findIndex(g => g.id === parseInt(id));
            if (index !== -1) {
                graves[index] = { id: parseInt(id), name, birth, death, section, plot, type };
            }
        } else {
            // Add new record
            const newId = graves.length > 0 ? Math.max(...graves.map(g => g.id)) + 1 : 1;
            graves.push({ id: newId, name, birth, death, section, plot, type });
        }

        // Save to local storage
        localStorage.setItem("graves", JSON.stringify(graves));

                    // Update UI
                    refreshAllViews();
    
                    // Show success message
                    showSuccessMessage(message);
    
                    // Close modal
                    closeAddRecordModal();
                    }

    /**
     * Function to properly close the "Add Record" modal
     */
    function closeAddRecordModal() {
        console.log("closeAddRecordModal() triggered"); // Debugging

        const modalElement = document.getElementById("addRecordModal");

        if (modalElement) {
            let modalInstance = bootstrap.Modal.getInstance(modalElement);

            if (!modalInstance) {
                console.warn("Modal instance not found, creating new instance...");
                modalInstance = new bootstrap.Modal(modalElement);
            }

            console.log("Hiding modal...");
            modalInstance.hide();

            // Ensure modal backdrop is removed
            setTimeout(() => {
                console.log("Removing modal classes...");
                modalElement.classList.remove("show");
                modalElement.style.display = "none";
                document.body.classList.remove("modal-open");

                const backdrop = document.querySelector(".modal-backdrop");
                if (backdrop) {
                    console.log("Backdrop found, removing...");
                    backdrop.remove();
                }
            }, 300);
        } else {
            console.error("Modal element not found!");
        }
    }

    // Ensure event listener is correctly set up
    document.addEventListener("DOMContentLoaded", function () {
        const saveButton = document.getElementById("saveRecord");

        if (saveButton) {
            console.log("Adding event listener to saveRecord button...");
            saveButton.addEventListener("click", function () {
                saveRecord();
            });
        } else {
            console.error("saveRecord button not found!");
        }
    });





    function deleteRecord(id) {
        if (confirm("Are you sure you want to delete this record?")) {
            // Find the index of the record
            const index = graves.findIndex(g => g.id === id);
            if (index !== -1) {
                // Remove from array
                graves.splice(index, 1);

                // Save to local storage
                localStorage.setItem("graves", JSON.stringify(graves));

                // Update UI
                refreshAllViews();
            }
        }
    }

    function refreshAllViews() {
        window.plotsData = [];
        drawCemeteryMap();
        updateGraveTable();
        updateDashboardStats();
        createDashboardCharts();
    }

    // --------- EVENT LISTENERS ---------
    function setupEventListeners() {
        // Canvas interaction
        setupCanvasInteraction();

        // Form events
        setupFormEvents();

        // Section filter buttons
        setupSectionFilters();

        // Search functionality
        setupSearchFunctionality();
    }

    function setupCanvasInteraction() {
        // Canvas click event for plot selection
        elements.cemeteryCanvas.addEventListener("click", function (event) {
            const rect = elements.cemeteryCanvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            // Check if click is within any plot
            const plotData = window.plotsData.find(plot =>
                x >= plot.x && x <= plot.x + plot.width &&
                y >= plot.y && y <= plot.y + plot.height
            );

            if (plotData) {
                if (plotData.occupied) {
                    showPlotDetails(plotData);
                } else {
                    openAddRecordModal(plotData.section, plotData.id);
                }
            }
        });

        // Canvas mousemove for tooltips
        elements.cemeteryCanvas.addEventListener("mousemove", function (event) {
            const rect = elements.cemeteryCanvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            handleTooltip(x, y, event);
        });

        // Hide tooltip when mouse leaves canvas
        elements.cemeteryCanvas.addEventListener("mouseout", function () {
            elements.tooltip.style.display = "none";
        });
    }

    function handleTooltip(x, y, event) {
        const plotData = window.plotsData.find(plot =>
            x >= plot.x && x <= plot.x + plot.width &&
            y >= plot.y && y <= plot.y + plot.height
        );

        if (plotData) {
            if (plotData.occupied) {
                // Enhanced tooltip for occupied plots
                elements.tooltip.innerHTML = `
                    <div class="tooltip-header">${plotData.grave.name}</div>
                    <div class="tooltip-content">
                        <div><strong>Birth:</strong> ${formatDate(plotData.grave.birth)}</div>
                        <div><strong>Death:</strong> ${formatDate(plotData.grave.death)}</div>
                        <div><strong>Plot:</strong> ${plotData.id}</div>
                        <div><strong>Type:</strong> ${capitalizeFirstLetter(plotData.grave.type)}</div>
                        <div><strong>Record ID:</strong> ${plotData.grave.id}</div>
                    </div>
                    <div class="tooltip-footer">Click for more details</div>
                `;
            } else {
                // Enhanced tooltip for available plots
                elements.tooltip.innerHTML = `
                    <div class="tooltip-header">Plot ${plotData.id}</div>
                    <div class="tooltip-content">
                        <div><strong>Status:</strong> Available</div>
                        <div><strong>Section:</strong> Section ${plotData.section}</div>
                        <div><strong>Location:</strong> Row ${Math.ceil(parseInt(plotData.id.slice(1)) / plotConfigs[plotData.section].cols)}, 
                        Column ${(parseInt(plotData.id.slice(1)) - 1) % plotConfigs[plotData.section].cols + 1}</div>
                    </div>
                    <div class="tooltip-footer">Click to add record</div>
                `;
            }

            elements.tooltip.style.left = (event.clientX + 10) + "px";
            elements.tooltip.style.top = (event.clientY + 1000) + "px";
            elements.tooltip.style.display = "block";
        } else {
            elements.tooltip.style.display = "none";
        }
    }
    function setupFormEvents() {
        // Section change event for plot options
        elements.recordSection.addEventListener("change", function () {
            const selectedSection = this.value;
            if (selectedSection) {
                generatePlotOptions(selectedSection);
            }
        });

        // Save record button click event
        elements.saveRecord.addEventListener("click", function () {
            console.log("Save button clicked");


            // Save the record
            saveRecord();

            // Hide the modal properly
            const modalElement = document.getElementById("addRecordModal");
            if (modalElement) {
                let modalInstance = bootstrap.Modal.getInstance(modalElement);

                // Create a new instance if none exists
                if (!modalInstance) {
                    console.warn("Modal instance not found. Creating a new instance...");
                    modalInstance = new bootstrap.Modal(modalElement);
                }

                // Hide the modal
                modalInstance.hide();

                // Remove backdrop and modal-open class
                setTimeout(() => {
                    document.body.classList.remove("modal-open");
                    const backdrop = document.querySelector(".modal-backdrop");
                    if (backdrop) {
                        backdrop.remove();
                    }
                }, 300);
            } else {
                console.error("Modal element not found!");
            }
        });


    }

    function setupSectionFilters() {
        // Section filter buttons for cemetery map
        elements.viewAllSections.addEventListener("click", function () {
            drawCemeteryMap();
            setActiveButton(this);
        });

        elements.viewSectionA.addEventListener("click", function () {
            drawCemeteryMap("A");
            setActiveButton(this);
        });

        elements.viewSectionB.addEventListener("click", function () {
            drawCemeteryMap("B");
            setActiveButton(this);
        });

        elements.viewSectionC.addEventListener("click", function () {
            drawCemeteryMap("C");
            setActiveButton(this);
        }); // Correctly closed this block

        elements.viewSectionD.addEventListener("click", function () {
            drawCemeteryMap("D");
            setActiveButton(this);
        });


        elements.viewSectionE.addEventListener("click", function () {
            drawCemeteryMap("E");
            setActiveButton(this);
        });

        elements.viewSectionF.addEventListener("click", function () {
            drawCemeteryMap("F");
            setActiveButton(this);
        });
        elements.viewSectionG.addEventListener("click", function () {
            drawCemeteryMap("G");
            setActiveButton(this);
        });
        elements.viewSectionH.addEventListener("click", function () {
            drawCemeteryMap("H");
            setActiveButton(this);
        });
        elements.viewSectionI.addEventListener("click", function () {
            drawCemeteryMap("I");
            setActiveButton(this);
        });

        elements.viewSectionJ.addEventListener("click", function () {
            drawCemeteryMap("J");
            setActiveButton(this);
        });

        elements.viewSectionK.addEventListener("click", function () {
            drawCemeteryMap("K");
            setActiveButton(this);
        });

        // Ensures this block is standalone and properly formatted
    }

    function setActiveButton(button) {
        document.querySelectorAll('.btn-outline-secondary').forEach(btn =>
            btn.classList.remove('active')
        );
        button.classList.add('active');
    }


    function setupSearchFunctionality() {
        // Search functionality for records
        elements.searchRecords.addEventListener("input", function () {
            const searchTerm = this.value.toLowerCase();
            const filteredGraves = searchTerm ?
                graves.filter(grave =>
                    grave.name.toLowerCase().includes(searchTerm) ||
                    grave.plot.toLowerCase().includes(searchTerm) ||
                    grave.type.toLowerCase().includes(searchTerm)
                ) : graves;

            updateFilteredGraveTable(filteredGraves);
        });
    }

    // --------- HELPER FUNCTIONS ---------
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
});



// Select all menu items // moving selected item in menu
const sidebar = document.getElementById('sidebar');
const toggleButton = document.getElementById('toggleSidebar');

toggleButton.addEventListener('click', () => {
    sidebar.classList.toggle('hidden'); // Toggle the "hidden" class
    toggleButton.textContent = sidebar.classList.contains('hidden') ? 'Show' : 'Hide'; // Update button text
});


