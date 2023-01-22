let isDescriptionInProgress = false;
function previewImageHandler(input) {
    const imgPreviewSection = document.getElementById("image-preview-section");
    const imgDetailsSection = document.getElementById("image-details-section");
    if(input.files && input.files[0]) {
        // image is selected or updated
        const text = "An image already exists.\nDo you want to replace it?\n";
        if(imgPreviewSection.innerHTML && confirm(text)) {
            // image preview is removed temporarily
            imgPreviewSection.innerHTML = "";
            isDescriptionInProgress = false;

            // descriptions list section is hidden
            const descriptionsSection = document.getElementById("descriptions-section")
            if(!descriptionsSection.classList.contains("no-descriptions")) {
                // removes descriptions if present
                descriptionsSection.classList.add("no-descriptions");
                const descTableBody = document.getElementById("descriptions-table-body");
                descTableBody.innerHTML = "";
            }
        }

        if(!imgPreviewSection.innerHTML) {
            // image properties are populated
            const imgProp = {
                name: document.getElementById("image-prop-name"),
                dimensions: document.getElementById("image-prop-dimensions"),
                mimeType: document.getElementById("image-prop-mime-type")
            }
            imgProp.name.innerText = input.files[0].name;
            imgProp.mimeType.innerText = input.files[0].type;
            const image = new Image();
            image.onload = function () {
                imgProp.dimensions.innerText = image.width + " x " + image.height;
            }
            // image details are shown visible
            imgDetailsSection.style.visibility = "visible";

            // image is previewed
            const reader = new FileReader();
            reader.onload = function (e) {
                const imgElement = document.createElement("img");
                imgElement.setAttribute("width", "100%");
                imgElement.setAttribute("src", e.target.result);
                imgElement.onclick = imgPlotHandler;
                image.src = e.target.result;
                imgPreviewSection.appendChild(imgElement);
            }
            reader.readAsDataURL(input.files[0]);
        }
        // resets the file input
        document.getElementById("image-input-field").value = "";
    } else {
        // image is not selected
        const text = "No image selected.\nDo you want to remove the existing image?";
        if (imgPreviewSection.innerHTML && confirm(text)) {
            // image details are hidden
            imgDetailsSection.style.visibility = "hidden";
            // image preview is removed
            imgPreviewSection.innerHTML = "";
            isDescriptionInProgress = false;

            // descriptions list section is hidden
            const descriptionsSection = document.getElementById("descriptions-section")
            if(!descriptionsSection.classList.contains("no-descriptions")) {
                // removes descriptions if present
                descriptionsSection.classList.add("no-descriptions");
                const descTableBody = document.getElementById("descriptions-table-body");
                descTableBody.innerHTML = "";
            }
        }
    }
}

function imgPlotHandler(event) {
    if(isDescriptionInProgress) {
        // checks and alerts if temporary plot exists
        const promtText = "Kindly save or cancel current description.\nAnd then, try plotting another point.";
        alert(promtText);
        return;
    }
    const bounds = this.getBoundingClientRect();
    const x = event.pageX - bounds.left;
    const y = event.pageY - bounds.top;
    const resizeRatioX = event.target.naturalWidth / event.target.clientWidth;
    const resizeRatioY = event.target.naturalHeight / event.target.clientHeight;
    const plotX = Math.round(x * resizeRatioX);
    const plotY = Math.round(y * resizeRatioY);
    // create temporary plot point until description is saved
    const plotWrapper = document.createElement("div");
    plotWrapper.setAttribute("class", "image-plot-wrapper");
    plotWrapper.setAttribute("id", "image-plot-wrapper-in-progress");
    plotWrapper.style.left = (x - 7) + "px";
    plotWrapper.style.top = (y - 5) + "px";
    const plot = document.createElement("div");
    plot.setAttribute("class", "image-plot");
    plotWrapper.appendChild(plot);

    // description input field
    isDescriptionInProgress = true;
    const descWrapper = document.createElement("div");
    descWrapper.setAttribute("class", "image-desc-modal");
    descWrapper.setAttribute("id", "image-desc-in-progress");
    const descHeader = document.createElement("div");
    descHeader.innerText = "Description";
    const input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("maxlength", "32");
    input.setAttribute("class", "image-desc-input");
    input.setAttribute("id", "image-desc-input");
    input.setAttribute("placeholder", "Type and press Enter to save")
    input.onkeyup = function (event) {
        if(event.key === "Enter" || event.keyCode === 13) {
            return saveDescriptionHandlerWrapper({x: plotX, y: plotY})()
        }
    };
    const saveButton = document.createElement("button");
    saveButton.setAttribute("class", "save-button");
    saveButton.innerText = "✓ SAVE";
    saveButton.onclick = saveDescriptionHandlerWrapper({x: plotX, y: plotY});
    const cancelButton = document.createElement("button");
    cancelButton.setAttribute("class", "cancel-button");
    cancelButton.innerText = "X CANCEL";
    cancelButton.onclick = cancelDescriptionHandler;
    descWrapper.appendChild(descHeader);
    descWrapper.appendChild(input);
    descWrapper.appendChild(saveButton);
    descWrapper.appendChild(cancelButton);
    plotWrapper.appendChild(descWrapper);

    const imgPreviewSection = document.getElementById("image-preview-section");
    imgPreviewSection.appendChild(plotWrapper);
}

function saveDescriptionHandlerWrapper(plot) {

    function saveDescriptionHandler() {
        const input = document.getElementById("image-desc-input");
        if(input.value) {
            populateDescriptionList({...plot, description: input.value});
            const inProgressPlot = document.getElementById("image-plot-wrapper-in-progress");
            const savedDescription = document.createElement("div");
            savedDescription.setAttribute("class", "description-saved");
            savedDescription.innerText = input.value;
            inProgressPlot.appendChild(savedDescription);
            // changes in-progress plot to permanent plot
            inProgressPlot.removeAttribute("id");
            // removes in-progress description modal
            document.getElementById("image-desc-in-progress").remove();

            isDescriptionInProgress = false;
        } else {
            const promptText = "Kindly type in a description.";
            alert(promptText);
        }
    }

    return saveDescriptionHandler;
}

function cancelDescriptionHandler() {
    // removes in-progress plot
    document.getElementById("image-plot-wrapper-in-progress").remove();

    isDescriptionInProgress = false;
}

function populateDescriptionList(plot) {
    const descriptionsSection = document.getElementById("descriptions-section")
    if(descriptionsSection.classList.contains("no-descriptions")) {
        descriptionsSection.classList.remove("no-descriptions");
    }
    const descTableBody = document.getElementById("descriptions-table-body");
    const newRow = document.createElement("tr");
    newRow.innerHTML = "<td>" + plot.x + "</td><td>" + plot.y + "</td><td>" + plot.description + "</td>";
    descTableBody.appendChild(newRow);
}