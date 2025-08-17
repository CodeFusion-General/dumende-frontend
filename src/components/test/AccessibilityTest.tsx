import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AccessibilityTest: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Form submitted successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header>
          <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
            Accessibility Test Page
          </h1>
        </header>

        <main>
          <section className="bg-white p-8 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-semibold mb-6">Accessible Form</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  aria-describedby="name-help"
                  required
                />
                <p id="name-help" className="text-sm text-gray-600 mt-1">
                  Please enter your full name
                </p>
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  aria-describedby="email-help"
                  required
                />
                <p id="email-help" className="text-sm text-gray-600 mt-1">
                  We'll never share your email with anyone else
                </p>
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <textarea
                  id="message"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  aria-describedby="message-help"
                />
                <p id="message-help" className="text-sm text-gray-600 mt-1">
                  Optional message (max 500 characters)
                </p>
              </div>

              <Button type="submit" className="w-full">
                Submit Form
              </Button>
            </form>
          </section>

          <section className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6">
              Keyboard Navigation Test
            </h2>
            <div className="space-y-4">
              <Button variant="outline">Button 1</Button>
              <Button variant="outline">Button 2</Button>
              <Button variant="outline">Button 3</Button>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Use Tab to navigate between buttons, Enter or Space to activate
              them.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
};

export default AccessibilityTest;
