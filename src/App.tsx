import React, { useState, useCallback } from 'react';
import { createWorker } from 'tesseract.js';
import { FileText, Upload, Copy, Download, Loader2, ImageIcon } from 'lucide-react';

function App() {
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  const processImage = useCallback(async (file: File) => {
    try {
      setIsProcessing(true);
      setError('');
      
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);

      const worker = await createWorker();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      
      const { data: { text } } = await worker.recognize(imageUrl);
      setText(text);
      
      await worker.terminate();
    } catch (err) {
      setError('Failed to process image. Please try again.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processImage(file);
    } else {
      setError('Please upload an image file.');
    }
  }, [processImage]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processImage(file);
    } else {
      setError('Please upload an image file.');
    }
  }, [processImage]);

  const handleCopyText = useCallback(() => {
    navigator.clipboard.writeText(text);
  }, [text]);

  const handleDownloadText = useCallback(() => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [text]);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white bg-opacity-20 backdrop-blur-lg mb-6">
            <FileText className="h-10 w-10 text-white" />
          </div>
          <h1 className="mt-3 text-4xl font-extrabold text-white tracking-tight">
            Image to Text Converter
          </h1>
          <p className="mt-3 text-xl text-indigo-100">
            Transform your images into editable text instantly
          </p>
        </div>

        <div 
          className={`drop-zone mt-8 p-8 border-3 border-dashed rounded-2xl text-center ${
            isProcessing 
              ? 'border-gray-300' 
              : 'border-indigo-300 hover:border-indigo-400'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
              <p className="mt-4 text-lg font-medium text-indigo-900">Processing your image...</p>
              <p className="mt-2 text-sm text-indigo-600">This might take a few seconds</p>
            </div>
          ) : (
            <div className="py-8">
              <Upload className="mx-auto h-16 w-16 text-indigo-500" />
              <p className="mt-4 text-xl font-medium text-indigo-900">
                Drop your image here
              </p>
              <p className="mt-2 text-sm text-indigo-600">
                or
              </p>
              <label className="mt-4 inline-flex items-center px-6 py-3 border-2 border-indigo-500 text-base font-medium rounded-full text-indigo-600 bg-white hover:bg-indigo-50 transition-colors duration-200 cursor-pointer button-hover">
                Choose a file
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
              <p className="mt-4 text-sm text-indigo-500">
                Supports PNG, JPG, or JPEG
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-100">
            <p className="text-sm text-red-600 flex items-center">
              <span className="flex-shrink-0 h-5 w-5 text-red-500 mr-2">⚠️</span>
              {error}
            </p>
          </div>
        )}

        {image && !isProcessing && (
          <div className="mt-10 bg-white bg-opacity-90 backdrop-blur-lg rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <ImageIcon className="h-5 w-5 text-indigo-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Uploaded Image</h2>
              </div>
              <img src={image} alt="Uploaded" className="max-h-96 w-full object-contain rounded-lg" />
            </div>
          </div>
        )}

        {text && !isProcessing && (
          <div className="mt-10">
            <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-2xl overflow-hidden shadow-xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-indigo-600 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-900">Extracted Text</h2>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleCopyText}
                      className="inline-flex items-center px-4 py-2 border-2 border-indigo-500 text-sm font-medium rounded-full text-indigo-600 bg-white hover:bg-indigo-50 transition-colors duration-200 button-hover"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Text
                    </button>
                    <button
                      onClick={handleDownloadText}
                      className="inline-flex items-center px-4 py-2 border-2 border-indigo-500 text-sm font-medium rounded-full text-indigo-600 bg-white hover:bg-indigo-50 transition-colors duration-200 button-hover"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </button>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-6">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">{text}</pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;