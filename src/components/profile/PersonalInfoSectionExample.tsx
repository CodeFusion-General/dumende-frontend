import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { ProfileFormData } from "@/types/profile.types";
import { profileCompletionSchema } from "@/lib/validation/profile.schemas";

export const PersonalInfoSectionExample: React.FC = () => {
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileCompletionSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      dateOfBirth: "",
      address: {
        street: "",
        city: "",
        district: "",
        postalCode: "",
        country: "Türkiye",
      },
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    console.log("Form data:", data);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Personal Info Section Example</h1>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <PersonalInfoSection form={form} />

        <div className="flex gap-4">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={() => form.reset()}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Reset
          </button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Form Values:</h3>
        <pre className="text-sm">{JSON.stringify(form.watch(), null, 2)}</pre>
      </div>

      <div className="mt-4 p-4 bg-red-50 rounded">
        <h3 className="font-semibold mb-2 text-red-800">Form Errors:</h3>
        <pre className="text-sm text-red-600">
          {JSON.stringify(form.formState.errors, null, 2)}
        </pre>
      </div>
    </div>
  );
};
