import React, { useState } from "react";
import { ProfileImageUpload } from "./ProfileImageUpload";
import { profileCompletionSchema } from "@/lib/validation/profile.schemas";
import { z } from "zod";

export const ProfileImageUploadExample: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");

  const handleFileChange = (file: File | null) => {
    setError(""); // Clear previous errors

    if (file) {
      try {
        // Validate the file using the schema
        profileCompletionSchema.shape.profileImage.parse(file);
        setSelectedFile(file);
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          setError(validationError.errors[0]?.message || "Geçersiz dosya");
        }
      }
    } else {
      setSelectedFile(null);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold text-center">
        Profil Fotoğrafı Yükleme Örneği
      </h2>

      <ProfileImageUpload
        value={selectedFile}
        onChange={handleFileChange}
        error={error}
      />

      {selectedFile && !error && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800">Seçilen Dosya:</h3>
          <p className="text-sm text-green-700">
            <strong>Ad:</strong> {selectedFile.name}
          </p>
          <p className="text-sm text-green-700">
            <strong>Boyut:</strong>{" "}
            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
          <p className="text-sm text-green-700">
            <strong>Tip:</strong> {selectedFile.type}
          </p>
        </div>
      )}
    </div>
  );
};
