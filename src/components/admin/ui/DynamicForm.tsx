import React, { useState, useCallback, useMemo } from "react";
import { useForm, Controller, FieldValues, Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CalendarIcon,
  Upload,
  X,
  Plus,
  Minus,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

// Types
export type FieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "textarea"
  | "select"
  | "multiselect"
  | "checkbox"
  | "switch"
  | "date"
  | "file"
  | "array"
  | "group";

export interface FieldOption {
  label: string;
  value: string | number | boolean;
  disabled?: boolean;
}

export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | true;
}

export interface FieldSchema {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  description?: string;
  defaultValue?: any;
  options?: FieldOption[];
  validation?: ValidationRule;
  disabled?: boolean;
  hidden?: boolean;
  width?: "full" | "half" | "third" | "quarter";
  dependsOn?: string;
  dependsOnValue?: any;
  fields?: FieldSchema[]; // For group and array types
  accept?: string; // For file type
  multiple?: boolean; // For file type
  showPassword?: boolean; // For password type
}

export interface FormSection {
  title: string;
  description?: string;
  fields: FieldSchema[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export interface FormSchema {
  sections?: FormSection[];
  fields?: FieldSchema[];
}

export interface DynamicFormProps<T extends FieldValues = FieldValues> {
  schema: FormSchema;
  initialValues?: Partial<T>;
  onSubmit: (values: T) => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  showSubmitButton?: boolean;
  showCancelButton?: boolean;
  validationSchema?: z.ZodSchema<T>;
}

export function DynamicForm<T extends FieldValues = FieldValues>({
  schema,
  initialValues = {},
  onSubmit,
  onCancel,
  submitLabel = "Kaydet",
  cancelLabel = "İptal",
  loading = false,
  disabled = false,
  className,
  showSubmitButton = true,
  showCancelButton = true,
  validationSchema,
}: DynamicFormProps<T>) {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set()
  );
  const [showPasswords, setShowPasswords] = useState<Set<string>>(new Set());

  // Create Zod schema from field definitions if not provided
  const zodSchema = useMemo(() => {
    if (validationSchema) return validationSchema;

    const createFieldSchema = (field: FieldSchema): z.ZodTypeAny => {
      let fieldSchema: z.ZodTypeAny;

      switch (field.type) {
        case "email":
          fieldSchema = z.string().email("Geçerli bir email adresi girin");
          break;
        case "number":
          fieldSchema = z.number();
          break;
        case "checkbox":
        case "switch":
          fieldSchema = z.boolean();
          break;
        case "date":
          fieldSchema = z.date();
          break;
        case "multiselect":
          fieldSchema = z.array(z.string());
          break;
        case "array":
          if (field.fields) {
            const arrayItemSchema = z.object(
              field.fields.reduce((acc, subField) => {
                acc[subField.name] = createFieldSchema(subField);
                return acc;
              }, {} as Record<string, z.ZodTypeAny>)
            );
            fieldSchema = z.array(arrayItemSchema);
          } else {
            fieldSchema = z.array(z.string());
          }
          break;
        default:
          fieldSchema = z.string();
      }

      // Apply validation rules
      if (field.validation) {
        const { required, min, max, pattern, custom } = field.validation;

        if (!required) {
          fieldSchema = fieldSchema.optional();
        }

        if (
          field.type === "text" ||
          field.type === "textarea" ||
          field.type === "email"
        ) {
          if (min)
            fieldSchema = (fieldSchema as z.ZodString).min(
              min,
              `En az ${min} karakter olmalı`
            );
          if (max)
            fieldSchema = (fieldSchema as z.ZodString).max(
              max,
              `En fazla ${max} karakter olmalı`
            );
          if (pattern)
            fieldSchema = (fieldSchema as z.ZodString).regex(
              pattern,
              "Geçersiz format"
            );
        }

        if (field.type === "number") {
          if (min)
            fieldSchema = (fieldSchema as z.ZodNumber).min(
              min,
              `En az ${min} olmalı`
            );
          if (max)
            fieldSchema = (fieldSchema as z.ZodNumber).max(
              max,
              `En fazla ${max} olmalı`
            );
        }

        if (custom) {
          fieldSchema = fieldSchema.refine(custom, "Geçersiz değer");
        }
      }

      return fieldSchema;
    };

    const schemaObject: Record<string, z.ZodTypeAny> = {};

    const processFields = (fields: FieldSchema[]) => {
      fields.forEach((field) => {
        if (field.type === "group" && field.fields) {
          processFields(field.fields);
        } else {
          schemaObject[field.name] = createFieldSchema(field);
        }
      });
    };

    if (schema.sections) {
      schema.sections.forEach((section) => processFields(section.fields));
    } else if (schema.fields) {
      processFields(schema.fields);
    }

    return z.object(schemaObject) as z.ZodSchema<T>;
  }, [schema, validationSchema]);

  const form = useForm<T>({
    resolver: zodResolver(zodSchema),
    defaultValues: initialValues as T,
  });

  const { handleSubmit, control, watch, setValue, getValues } = form;

  // Watch all values for dependency checking
  const watchedValues = watch();

  // Check if field should be visible based on dependencies
  const isFieldVisible = useCallback(
    (field: FieldSchema) => {
      if (field.hidden) return false;
      if (!field.dependsOn) return true;

      const dependentValue = watchedValues[field.dependsOn as keyof T];
      return dependentValue === field.dependsOnValue;
    },
    [watchedValues]
  );

  // Toggle section collapse
  const toggleSection = useCallback((sectionTitle: string) => {
    setCollapsedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionTitle)) {
        newSet.delete(sectionTitle);
      } else {
        newSet.add(sectionTitle);
      }
      return newSet;
    });
  }, []);

  // Toggle password visibility
  const togglePasswordVisibility = useCallback((fieldName: string) => {
    setShowPasswords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(fieldName)) {
        newSet.delete(fieldName);
      } else {
        newSet.add(fieldName);
      }
      return newSet;
    });
  }, []);

  // Render field based on type
  const renderField = useCallback(
    (field: FieldSchema) => {
      if (!isFieldVisible(field)) return null;

      const widthClass = {
        full: "col-span-full",
        half: "col-span-6",
        third: "col-span-4",
        quarter: "col-span-3",
      }[field.width || "full"];

      return (
        <FormField
          key={field.name}
          control={control}
          name={field.name as Path<T>}
          render={({ field: formField }) => (
            <FormItem className={widthClass}>
              <FormLabel>
                {field.label}
                {field.validation?.required && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </FormLabel>
              <FormControl>
                {(() => {
                  switch (field.type) {
                    case "text":
                    case "email":
                      return (
                        <Input
                          {...formField}
                          type={field.type}
                          placeholder={field.placeholder}
                          disabled={disabled || field.disabled}
                        />
                      );

                    case "password":
                      const showPassword = showPasswords.has(field.name);
                      return (
                        <div className="relative">
                          <Input
                            {...formField}
                            type={showPassword ? "text" : "password"}
                            placeholder={field.placeholder}
                            disabled={disabled || field.disabled}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => togglePasswordVisibility(field.name)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      );

                    case "number":
                      return (
                        <Input
                          {...formField}
                          type="number"
                          placeholder={field.placeholder}
                          disabled={disabled || field.disabled}
                          onChange={(e) =>
                            formField.onChange(Number(e.target.value))
                          }
                        />
                      );

                    case "textarea":
                      return (
                        <Textarea
                          {...formField}
                          placeholder={field.placeholder}
                          disabled={disabled || field.disabled}
                          rows={4}
                        />
                      );

                    case "select":
                      return (
                        <Select
                          value={formField.value}
                          onValueChange={formField.onChange}
                          disabled={disabled || field.disabled}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={field.placeholder} />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((option) => (
                              <SelectItem
                                key={option.value.toString()}
                                value={option.value.toString()}
                                disabled={option.disabled}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      );

                    case "multiselect":
                      const selectedValues = Array.isArray(formField.value)
                        ? formField.value
                        : [];
                      return (
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1">
                            {selectedValues.map((value: string) => {
                              const option = field.options?.find(
                                (o) => o.value === value
                              );
                              return (
                                <Badge
                                  key={value}
                                  variant="secondary"
                                  className="gap-1"
                                >
                                  {option?.label || value}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-0 ml-1"
                                    onClick={() => {
                                      const newValues = selectedValues.filter(
                                        (v: string) => v !== value
                                      );
                                      formField.onChange(newValues);
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </Badge>
                              );
                            })}
                          </div>
                          <Select
                            value=""
                            onValueChange={(value) => {
                              if (!selectedValues.includes(value)) {
                                formField.onChange([...selectedValues, value]);
                              }
                            }}
                            disabled={disabled || field.disabled}
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={field.placeholder || "Seçiniz"}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options
                                ?.filter(
                                  (option) =>
                                    !selectedValues.includes(
                                      option.value.toString()
                                    )
                                )
                                .map((option) => (
                                  <SelectItem
                                    key={option.value.toString()}
                                    value={option.value.toString()}
                                    disabled={option.disabled}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      );

                    case "checkbox":
                      return (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={formField.value}
                            onCheckedChange={formField.onChange}
                            disabled={disabled || field.disabled}
                          />
                          <span className="text-sm">{field.label}</span>
                        </div>
                      );

                    case "switch":
                      return (
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={formField.value}
                            onCheckedChange={formField.onChange}
                            disabled={disabled || field.disabled}
                          />
                          <span className="text-sm">{field.label}</span>
                        </div>
                      );

                    case "date":
                      return (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !formField.value && "text-muted-foreground"
                              )}
                              disabled={disabled || field.disabled}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formField.value
                                ? format(
                                    new Date(formField.value),
                                    "dd/MM/yyyy",
                                    { locale: tr }
                                  )
                                : field.placeholder || "Tarih seçiniz"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={
                                formField.value
                                  ? new Date(formField.value)
                                  : undefined
                              }
                              onSelect={(date) => formField.onChange(date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      );

                    case "file":
                      return (
                        <div className="space-y-2">
                          <Input
                            type="file"
                            accept={field.accept}
                            multiple={field.multiple}
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              formField.onChange(
                                field.multiple ? files : files[0]
                              );
                            }}
                            disabled={disabled || field.disabled}
                          />
                          {formField.value && (
                            <div className="text-sm text-muted-foreground">
                              {Array.isArray(formField.value)
                                ? `${formField.value.length} dosya seçildi`
                                : formField.value.name}
                            </div>
                          )}
                        </div>
                      );

                    case "array":
                      const arrayValue = Array.isArray(formField.value)
                        ? formField.value
                        : [];
                      return (
                        <div className="space-y-4">
                          {arrayValue.map((item: any, index: number) => (
                            <Card key={index}>
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-sm">
                                    {field.label} {index + 1}
                                  </CardTitle>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const newArray = arrayValue.filter(
                                        (_: any, i: number) => i !== index
                                      );
                                      formField.onChange(newArray);
                                    }}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-12 gap-4">
                                  {field.fields?.map((subField) => (
                                    <Controller
                                      key={`${field.name}.${index}.${subField.name}`}
                                      control={control}
                                      name={
                                        `${field.name}.${index}.${subField.name}` as Path<T>
                                      }
                                      render={({ field: subFormField }) => (
                                        <div
                                          className={
                                            subField.width === "half"
                                              ? "col-span-6"
                                              : "col-span-12"
                                          }
                                        >
                                          <FormLabel>
                                            {subField.label}
                                          </FormLabel>
                                          <FormControl>
                                            <Input
                                              {...subFormField}
                                              placeholder={subField.placeholder}
                                              disabled={
                                                disabled || subField.disabled
                                              }
                                            />
                                          </FormControl>
                                        </div>
                                      )}
                                    />
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const newItem =
                                field.fields?.reduce((acc, subField) => {
                                  acc[subField.name] =
                                    subField.defaultValue || "";
                                  return acc;
                                }, {} as any) || {};
                              formField.onChange([...arrayValue, newItem]);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            {field.label} Ekle
                          </Button>
                        </div>
                      );

                    default:
                      return (
                        <Input
                          {...formField}
                          placeholder={field.placeholder}
                          disabled={disabled || field.disabled}
                        />
                      );
                  }
                })()}
              </FormControl>
              {field.description && (
                <FormDescription>{field.description}</FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      );
    },
    [control, disabled, isFieldVisible, showPasswords, togglePasswordVisibility]
  );

  const onFormSubmit = async (values: T) => {
    try {
      await onSubmit(values);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onFormSubmit)}
        className={cn("space-y-6", className)}
      >
        {schema.sections ? (
          schema.sections.map((section) => {
            const isCollapsed = collapsedSections.has(section.title);
            return (
              <Card key={section.title}>
                <CardHeader
                  className={cn(
                    "cursor-pointer",
                    section.collapsible && "hover:bg-muted/50"
                  )}
                  onClick={() =>
                    section.collapsible && toggleSection(section.title)
                  }
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                      {section.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {section.description}
                        </p>
                      )}
                    </div>
                    {section.collapsible && (
                      <Button variant="ghost" size="sm" type="button">
                        {isCollapsed ? (
                          <Plus className="h-4 w-4" />
                        ) : (
                          <Minus className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                {(!section.collapsible || !isCollapsed) && (
                  <CardContent>
                    <div className="grid grid-cols-12 gap-4">
                      {section.fields.map(renderField)}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })
        ) : (
          <div className="grid grid-cols-12 gap-4">
            {schema.fields?.map(renderField)}
          </div>
        )}

        {(showSubmitButton || showCancelButton) && (
          <>
            <Separator />
            <div className="flex justify-end gap-2">
              {showCancelButton && onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={loading}
                >
                  {cancelLabel}
                </Button>
              )}
              {showSubmitButton && (
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  ) : null}
                  {submitLabel}
                </Button>
              )}
            </div>
          </>
        )}
      </form>
    </Form>
  );
}
