
 // Converts an image URL (local import or external) to a Base64 Data URL
  const convertImageUrlToDataUrl = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();

      // Determine MIME type more reliably
      let mimeType = blob.type;
      // Fallback for SVGs if blob.type is empty or generic xml
      if (!mimeType || mimeType === 'text/xml' || mimeType === 'application/xml') {
         if (imageUrl.toLowerCase().endsWith('.svg')) {
            mimeType = 'image/svg+xml';
         }
         // Add more fallbacks if needed (e.g., based on magic numbers)
      }

      // Read blob as Data URL
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result); // Result is the Data URL
        reader.onerror = (error) => {
          console.error("FileReader error during URL conversion:", error);
          reject(new Error('Failed to convert image URL to Data URL.'));
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error(`Failed to fetch or convert image URL ${imageUrl}:`, error);
      throw new Error(`Could not process image: ${error.message}`); // Re-throw for catching in handleSetAvatar
    }
  };

  module.exports = {convertImageUrlToDataUrl};