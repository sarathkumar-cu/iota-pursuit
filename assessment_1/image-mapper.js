function previewImageHandler(input) {
    console.log(input)
    const imgPreviewSection = document.getElementById("image-preview-section");
    const imgDetailsSection = document.getElementById("image-details-section");
    if(input.files && input.files[0]) {
        // image is selected or updated
        const text = "An image already exists.\nDo you want to replace it?";
        if(imgPreviewSection.innerHTML && confirm(text)) {
            // image preview is removed temporarily
            imgPreviewSection.innerHTML = "";
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
                imgElement.setAttribute("height", "500px");
                imgElement.setAttribute("src", e.target.result);
                imgElement.onclick = imgPlotHandler;
                image.src = e.target.result;
                imgPreviewSection.appendChild(imgElement);
            }
            reader.readAsDataURL(input.files[0]);
        }
    } else {
        // image is not selected
        const text = "No image selected.\nDo you want to remove the existing image?";
        if (imgPreviewSection.innerHTML && confirm(text)) {
            // image details are hidden
            imgDetailsSection.style.visibility = "hidden";
            // image preview is removed
            imgPreviewSection.innerHTML = "";
        }
    }
}

function imgPlotHandler(event) {
    console.log(event);
    console.log("IMAGE PLOT");
}