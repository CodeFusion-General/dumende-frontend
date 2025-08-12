import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddressSection } from "./AddressSection";
import { addressFormDataSchema } from "@/lib/validation/profile.schemas";
import { AddressFormData } from "@/types/profile.types";

interface FormData {
  address: AddressFormData;
}

export const AddressSectionExample: React.FC = () => {
  const form = useForm<FormData>({
    resolver: zodResolver({
      address: addressFormDataSchema,
    }),
    defaultValues: {
      address: {
        street: "",
        city: "",
        district: "",
        postalCode: "",
        country: "Türkiye",
      },
    },
  });

  const onSubmit = (data: FormData) => {
    console.log("Address form data:", data);
    alert("Form submitted! Check console for data.");
  };

  const onReset = () => {
    form.reset();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AddressSection Component Example</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            This example demonstrates the AddressSection component with form
            validation and real-time feedback.
          </p>
        </CardContent>
      </Card>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <AddressSection form={form} />

        <div className="flex gap-4">
          <Button type="submit" className="flex-1">
            Submit Address
          </Button>
          <Button type="button" variant="outline" onClick={onReset}>
            Reset Form
          </Button>
        </div>
      </form>

      {/* Debug Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Form State (Debug)</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-3 rounded overflow-auto">
            {JSON.stringify(
              {
                values: form.watch(),
                errors: form.formState.errors,
                isValid: form.formState.isValid,
                isDirty: form.formState.isDirty,
              },
              null,
              2
            )}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};
