import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface FormData {
  email: string;
  password: string;
  name: string;
}

const MicroAnimationsTest: React.FC = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  });

  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", data);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const triggerError = () => {
    form.setError("email", {
      type: "manual",
      message: "This email is already taken",
    });
    setShowError(true);
    setTimeout(() => {
      setShowError(false);
      form.clearErrors("email");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4 animate-fade-in-up">
            Micro-Animations Test
          </h1>
          <p className="text-white/70 animate-fade-in-up animate-delay-200">
            Testing enhanced button and form interactions with glassmorphism
            effects
          </p>
        </div>

        {/* Button Animations Test */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 animate-fade-in-up animate-delay-300">
          <CardHeader>
            <CardTitle className="text-white">Button Animations</CardTitle>
            <CardDescription className="text-white/70">
              Test various button styles with micro-animations and ripple
              effects
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Default Buttons */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Default Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <Button>Primary Button</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link Button</Button>
              </div>
            </div>

            {/* Glass Buttons */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Glass Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="glass">Glass Primary</Button>
                <Button variant="glass" size="sm">
                  Small Glass
                </Button>
                <Button variant="glass" size="lg">
                  Large Glass
                </Button>
                <Button variant="glass" disabled>
                  Disabled Glass
                </Button>
              </div>
            </div>

            {/* Animation Variants */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Animation Variants</h3>
              <div className="flex flex-wrap gap-4">
                <Button animation="ripple">Ripple Effect</Button>
                <Button animation="pulse" variant="outline">
                  Pulse Glow
                </Button>
                <Button animation="none" variant="secondary">
                  No Animation
                </Button>
                <Button enableRipple={false} variant="ghost">
                  No Ripple
                </Button>
              </div>
            </div>

            {/* Interactive Buttons */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Interactive Tests</h3>
              <div className="flex flex-wrap gap-4">
                <Button onClick={() => alert("Button clicked!")}>
                  Click Me
                </Button>
                <Button
                  variant="glass"
                  onClick={() => setShowSuccess(!showSuccess)}
                  className={showSuccess ? "animate-validation-success" : ""}
                >
                  Toggle Success
                </Button>
                <Button
                  variant="destructive"
                  onClick={triggerError}
                  className={showError ? "animate-shake" : ""}
                >
                  Trigger Error
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Animations Test */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 animate-fade-in-up animate-delay-400">
          <CardHeader>
            <CardTitle className="text-white">Form Animations</CardTitle>
            <CardDescription className="text-white/70">
              Test form inputs with glass effects, validation animations, and
              focus states
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Default Input */}
                <FormField
                  control={form.control}
                  name="name"
                  rules={{ required: "Name is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">
                        Name (Default)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your name"
                          {...field}
                          className="animate-input-focus"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Glass Input */}
                <FormField
                  control={form.control}
                  name="email"
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">
                        Email (Glass)
                      </FormLabel>
                      <FormControl>
                        <Input
                          variant="glass"
                          placeholder="Enter your email"
                          {...field}
                          hasError={!!form.formState.errors.email}
                          isValid={
                            field.value &&
                            !form.formState.errors.email &&
                            field.value.includes("@")
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Floating Input */}
                <FormField
                  control={form.control}
                  name="password"
                  rules={{
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">
                        Password (Floating)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          variant="floating"
                          placeholder="Enter your password"
                          {...field}
                          hasError={!!form.formState.errors.password}
                          isValid={field.value && field.value.length >= 6}
                          className="text-white border-white/30 focus:border-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button type="submit" variant="glass" size="lg">
                    Submit Form
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Animation States Demo */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 animate-fade-in-up animate-delay-500">
          <CardHeader>
            <CardTitle className="text-white">Animation States</CardTitle>
            <CardDescription className="text-white/70">
              Visual feedback and state animations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Success State */}
            {showSuccess && (
              <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg animate-validation-success">
                <div className="flex items-center gap-2 text-green-400">
                  <svg
                    className="w-5 h-5 animate-scale-in"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Success! Form submitted successfully.
                </div>
              </div>
            )}

            {/* Error State */}
            {showError && (
              <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg animate-validation-error">
                <div className="flex items-center gap-2 text-red-400">
                  <svg
                    className="w-5 h-5 animate-pulse"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Error! Please check your input.
                </div>
              </div>
            )}

            {/* Loading State */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Loading States</h3>
              <div className="flex gap-4">
                <Button disabled className="animate-pulse">
                  <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"></div>
                  Loading...
                </Button>
                <Button variant="glass" disabled>
                  <span className="animate-dots">Processing</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MicroAnimationsTest;
