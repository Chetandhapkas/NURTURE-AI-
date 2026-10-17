
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";

import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";

import "./PrescriptionGallery.css";

function PrescriptionGallery() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  // Upload prescription images
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files || []);
    setError("");

    const validFiles = files.filter((file) =>
      file.type.startsWith("image/")
    );

    if (validFiles.length !== files.length) {
      setError("Please select valid image files only.");
    }

    const newImages = validFiles.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      name: file.name,
      url: URL.createObjectURL(file),
      file,
    }));

    setImages((previousImages) => [
      ...previousImages,
      ...newImages,
    ]);

    // Allow selecting the same file again
    event.target.value = "";
  };

  // Remove an uploaded image
  const handleRemoveImage = (imageId) => {
    setImages((previousImages) => {
      const imageToRemove = previousImages.find(
        (image) => image.id === imageId
      );

      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.url);
      }

      return previousImages.filter(
        (image) => image.id !== imageId
      );
    });

    setError("");
  };

  // Convert an image to JPEG for PDF compatibility
  const convertImageToJpeg = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const image = new Image();

        image.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;

          const context = canvas.getContext("2d");

          if (!context) {
            reject(new Error("Unable to process an image."));
            return;
          }

          // White background for transparent images
          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, canvas.width, canvas.height);

          context.drawImage(image, 0, 0);

          resolve({
            data: canvas.toDataURL("image/jpeg", 0.92),
            width: canvas.width,
            height: canvas.height,
          });
        };

        image.onerror = () =>
          reject(new Error(`Unable to read ${file.name}.`));

        image.src = reader.result;
      };

      reader.onerror = () =>
        reject(new Error(`Unable to read ${file.name}.`));

      reader.readAsDataURL(file);
    });

  // Download every uploaded image in one PDF
  const handleDownloadPDF = async () => {
    if (images.length === 0) {
      setError("Please upload at least one prescription image.");
      return;
    }

    try {
      setDownloading(true);
      setError("");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 8;

      for (let index = 0; index < images.length; index++) {
        const converted = await convertImageToJpeg(
          images[index].file
        );

        if (index > 0) {
          pdf.addPage("a4", "portrait");
        }

        // Fit the complete image inside the page
        const availableWidth = pageWidth - margin * 2;
        const availableHeight = pageHeight - margin * 2;

        const scale = Math.min(
          availableWidth / converted.width,
          availableHeight / converted.height
        );

        const imageWidth = converted.width * scale;
        const imageHeight = converted.height * scale;

        const x = (pageWidth - imageWidth) / 2;
        const y = (pageHeight - imageHeight) / 2;

        pdf.addImage(
          converted.data,
          "JPEG",
          x,
          y,
          imageWidth,
          imageHeight,
          undefined,
          "FAST"
        );
      }

      pdf.save("NurtureAI_Prescriptions.pdf");
    } catch (err) {
      console.error("Prescription PDF error:", err);
      setError(
        "Unable to generate the PDF. Please try uploading the images again."
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="prescription-layout">
      <Sidebar />

      <div className="prescription-main">
        <Navbar />

        <main className="prescription-content">
          {/* Header */}
          <header className="prescription-header">
            <div className="prescription-heading">
              <div className="prescription-heading-icon">
                <span>▤</span>
              </div>

              <div>
                <h1>Prescription Gallery</h1>
                <p>
                  Keep all your medical prescriptions together
                  in one place.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="prescription-back-btn"
              onClick={() => navigate(-1)}
            >
              <span>←</span> Back
            </button>
          </header>

          {/* Information */}
          <section className="prescription-info">
            <div className="prescription-info-icon">✚</div>

            <div>
              <h2>Your Prescription Records</h2>
              <p>
                Upload clear images of your prescriptions.
                Download them together as one PDF whenever
                you need them.
              </p>
            </div>
          </section>

          {/* Error */}
          {error && (
            <div className="prescription-error" role="alert">
              <span>!</span>
              {error}
              <button
                type="button"
                onClick={() => setError("")}
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}

          {/* Gallery heading */}
          <section className="prescription-gallery-section">
            <div className="prescription-gallery-heading">
              <div>
                <h2>Uploaded Prescriptions</h2>
                <p>
                  {images.length}{" "}
                  {images.length === 1 ? "image" : "images"}{" "}
                  added
                </p>
              </div>

              {images.length > 0 && (
                <span className="prescription-uploaded-badge">
                  <span>✓</span> Uploaded
                </span>
              )}
            </div>

            {/* Empty state */}
            {images.length === 0 && (
              <div className="prescription-empty">
                <div className="prescription-empty-icon">
                  <span>▤</span>
                  <span>+</span>
                </div>

                <h3>No prescriptions uploaded yet</h3>

                <p>
                  Select prescription images from your device
                  to get started.
                </p>

                <button
                  type="button"
                  className="prescription-primary-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span>＋</span> Upload Image
                </button>
              </div>
            )}

            {/* Image gallery */}
            {images.length > 0 && (
              <div className="prescription-image-grid">
                {images.map((image, index) => (
                  <article
                    className="prescription-image-card"
                    key={image.id}
                  >
                    <div className="prescription-image-preview">
                      <img
                        src={image.url}
                        alt={`Prescription ${index + 1}`}
                      />

                      <span className="prescription-image-number">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="prescription-image-footer">
                      <div className="prescription-file-info">
                        <strong>
                          Prescription {index + 1}
                        </strong>
                        <span title={image.name}>
                          {image.name}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="prescription-remove-btn"
                        onClick={() =>
                          handleRemoveImage(image.id)
                        }
                        aria-label={`Remove ${image.name}`}
                        title="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Bottom actions */}
          <section className="prescription-bottom-actions">
            <div className="prescription-bottom-text">
              <strong>
                {images.length === 0
                  ? "Ready to organize your prescriptions?"
                  : `${images.length} prescription ${
                      images.length === 1 ? "image" : "images"
                    } ready`}
              </strong>

              <p>
                {images.length === 0
                  ? "Upload images to create your personal collection."
                  : "All images will be included in a single PDF."}
              </p>
            </div>

            <div className="prescription-action-buttons">
              {images.length > 0 && (
                <button
                  type="button"
                  className="prescription-add-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span>＋</span> Add Image
                </button>
              )}

              <button
                type="button"
                className="prescription-download-btn"
                onClick={handleDownloadPDF}
                disabled={images.length === 0 || downloading}
              >
                <span>↓</span>
                {downloading ? "Creating PDF..." : "Download PDF"}
              </button>
            </div>
          </section>

          {/* Hidden image picker */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handleImageUpload}
          />

          <p className="prescription-privacy-note">
            Your selected images remain in this page session.
            Download the PDF to keep a copy on your device.
          </p>
        </main>
      </div>
    </div>
  );
}

export default PrescriptionGallery;
