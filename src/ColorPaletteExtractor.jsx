import React, { useState, useRef } from 'react';

const ColorPaletteExtractor = () => {
  const [colors, setColors] = useState([]);
  const [image, setImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  
  // Process the image and extract colors
  const processImage = (file) => {
    setLoading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas to analyze the image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0);
        
        // Sample colors (reduced resolution for performance)
        const sampleSize = Math.max(1, Math.floor(Math.min(img.width, img.height) / 50));
        const colorMap = {};
        
        for (let x = 0; x < img.width; x += sampleSize) {
          for (let y = 0; y < img.height; y += sampleSize) {
            const pixel = ctx.getImageData(x, y, 1, 1).data;
            const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
            
            if (colorMap[hex]) {
              colorMap[hex].count++;
            } else {
              colorMap[hex] = { 
                hex, 
                count: 1,
                rgb: `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})` 
              };
            }
          }
        }
        
        // Extract and sort colors by frequency
        const extractedColors = Object.values(colorMap)
          .sort((a, b) => b.count - a.count)
          .slice(0, 20); // Limit to top 20 colors
        
        setColors(extractedColors);
        setImage(e.target.result);
        setLoading(false);
      };
      
      img.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
  };
  
  const rgbToHex = (r, g, b) => {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  };
  
  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImage(e.dataTransfer.files[0]);
    }
  };
  
  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processImage(e.target.files[0]);
    }
  };
  
  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  // Copy color to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .catch(err => console.error('Failed to copy: ', err));
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 bg-gray-50 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Screenshot Color Palette Extractor</h1>
      
      {/* Drop zone */}
      <div 
        className={`w-full p-8 mb-6 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-100'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-600 mb-1">Drag and drop an image here, or click to select</p>
        <p className="text-gray-500 text-sm">Supported formats: PNG, JPG, JPEG, GIF</p>
      </div>
      
      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center justify-center mb-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Extracting colors...</span>
        </div>
      )}
      
      {/* Results section */}
      {image && !loading && (
        <div className="w-full">
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            {/* Image preview */}
            <div className="md:w-1/3">
              <h2 className="text-lg font-semibold mb-2">Original Image</h2>
              <img 
                src={image} 
                alt="Uploaded screenshot" 
                className="w-full object-contain rounded border border-gray-300"
                style={{ maxHeight: '300px' }}
              />
            </div>
            
            {/* Color palette */}
            <div className="md:w-2/3">
              <h2 className="text-lg font-semibold mb-2">Color Palette</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {colors.map((color, index) => (
                  <div 
                    key={index}
                    className="border rounded overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => copyToClipboard(color.hex)}
                    title="Click to copy"
                  >
                    <div 
                      className="h-20" 
                      style={{ backgroundColor: color.hex }}
                    ></div>
                    <div className="p-2 bg-white">
                      <p className="font-mono text-sm truncate">{color.hex}</p>
                      <p className="text-xs text-gray-500 truncate">{color.rgb}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {colors.length > 0 && (
                <p className="mt-4 text-sm text-gray-500">
                  Click on any color to copy its HEX value to clipboard
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPaletteExtractor;
