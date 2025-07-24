import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/GlassCard";
import { accessibilityManager } from "@/lib/accessibility-utils";
import { browserCompatibilityManager } from "@/lib/browser-compatibility";

const AccessibilityTest: React.FC = () => {
  const [browserInfo, setBrowserInfo] = useState<any>(null);
  const [featureSupport, setFeatureSupport] = useState<any>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    // Get browser compatibility information
    setBrowserInfo(browserCompatibilityManager.getBrowserInfo());
    setFeatureSupport(browserCompatibilityManager.getFeatureSupport());
  }, []);

  const runAccessibilityTests = () => {
    const results: string[] = [];

    // Test 1: Focus management
    const focusableElements = accessibilityManager.focus.getFocusableElements();
    results.push(`✓ Found ${focusableElements.length} focusable elements`);

    // Test 2: Keyboard detection
    const isKeyboardUser = accessibilityManager.input.isUsingKeyboard();
    results.push(
      `✓ Keyboard user detection: ${
        isKeyboardUser ? "Keyboard" : "Mouse/Touch"
      }`
    );

    // Test 3: Screen reader announcements
    accessibilityManager.announcePageChange("Accessibility Test Page");
    results.push("✓ Screen reader announcement sent");

    // Test 4: Color contrast (mock test)
    const contrastRatio = accessibilityManager.colorContrast.getContrastRatio(
      "#000000",
      "#ffffff"
    );
    results.push(
      `✓ Color contrast ratio (black/white): ${contrastRatio.toFixed(2)}`
    );

    // Test 5: WCAG compliance check
    const meetsWCAG = accessibilityManager.colorContrast.meetsWCAGStandards(
      "#000000",
      "#ffffff"
    );
    results.push(`✓ WCAG AA compliance: ${meetsWCAG ? "Pass" : "Fail"}`);

    setTestResults(results);
  };

  const testFormValidation = () => {
    accessibilityManager.announceFormValidation(
      "Form validation test completed",
      false
    );
  };

  const testLoadingAnnouncement = () => {
    accessibilityManager.announceLoading(true, "test data");
    setTimeout(() => {
      accessibilityManager.announceLoading(false, "test data");
    }, 2000);
  };

  const testFocusManagement = () => {
    const button = document.getElementById("focus-test-button");
    if (button) {
      accessibilityManager.focus.moveFocusTo(
        button as HTMLElement,
        "Focus moved to test button"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-ocean p-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Accessibility & Browser Compatibility Test
        </h1>

        {/* Browser Information */}
        <GlassCard className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">
            Browser Information
          </h2>
          {browserInfo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
              <div>
                <p>
                  <strong>Browser:</strong> {browserInfo.name}{" "}
                  {browserInfo.version}
                </p>
                <p>
                  <strong>Modern Browser:</strong>{" "}
                  {browserInfo.isModern ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Backdrop Filter:</strong>{" "}
                  {browserInfo.supportsBackdropFilter
                    ? "Supported"
                    : "Not Supported"}
                </p>
                <p>
                  <strong>CSS Grid:</strong>{" "}
                  {browserInfo.supportsGridLayout
                    ? "Supported"
                    : "Not Supported"}
                </p>
              </div>
              <div>
                <p>
                  <strong>Flexbox:</strong>{" "}
                  {browserInfo.supportsFlexbox ? "Supported" : "Not Supported"}
                </p>
                <p>
                  <strong>Custom Properties:</strong>{" "}
                  {browserInfo.supportsCustomProperties
                    ? "Supported"
                    : "Not Supported"}
                </p>
                <p>
                  <strong>Intersection Observer:</strong>{" "}
                  {browserInfo.supportsIntersectionObserver
                    ? "Supported"
                    : "Not Supported"}
                </p>
                <p>
                  <strong>Web Animations:</strong>{" "}
                  {browserInfo.supportsWebAnimations
                    ? "Supported"
                    : "Not Supported"}
                </p>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Feature Support */}
        <GlassCard className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">
            Feature Support
          </h2>
          {featureSupport && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-white">
              {Object.entries(featureSupport).map(([feature, supported]) => (
                <div key={feature} className="flex items-center">
                  <span
                    className={`mr-2 ${
                      supported ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {supported ? "✓" : "✗"}
                  </span>
                  <span className="capitalize">
                    {feature.replace(/([A-Z])/g, " $1").toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Accessibility Tests */}
        <GlassCard className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">
            Accessibility Tests
          </h2>
          <div className="space-y-4">
            <Button
              onClick={runAccessibilityTests}
              className="glass-button"
              aria-describedby="accessibility-test-description"
            >
              Run Accessibility Tests
            </Button>
            <p id="accessibility-test-description" className="sr-only">
              This button will run comprehensive accessibility tests and display
              the results
            </p>

            {testResults.length > 0 && (
              <div className="bg-black/20 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Test Results:
                </h3>
                <ul className="text-white space-y-1">
                  {testResults.map((result, index) => (
                    <li key={index}>{result}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Interactive Tests */}
        <GlassCard className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">
            Interactive Tests
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Focus Management Test */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Focus Management
              </h3>
              <div className="space-y-2">
                <Button
                  onClick={testFocusManagement}
                  className="glass-button w-full"
                >
                  Test Focus Movement
                </Button>
                <Button
                  id="focus-test-button"
                  className="glass-button w-full"
                  tabIndex={0}
                >
                  Focus Target Button
                </Button>
              </div>
            </div>

            {/* Screen Reader Tests */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Screen Reader
              </h3>
              <div className="space-y-2">
                <Button
                  onClick={testFormValidation}
                  className="glass-button w-full"
                >
                  Test Form Validation Announcement
                </Button>
                <Button
                  onClick={testLoadingAnnouncement}
                  className="glass-button w-full"
                >
                  Test Loading Announcement
                </Button>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Form Accessibility Test */}
        <GlassCard className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">
            Form Accessibility
          </h2>
          <form className="space-y-4">
            <div>
              <label
                htmlFor="test-input-1"
                className="block text-white mb-2 font-medium"
              >
                Test Input (Required) <span className="required">*</span>
              </label>
              <Input
                id="test-input-1"
                type="text"
                variant="glass"
                placeholder="Enter test text"
                required
                aria-describedby="test-input-1-help"
              />
              <p id="test-input-1-help" className="text-white/70 text-sm mt-1">
                This input demonstrates proper labeling and ARIA attributes
              </p>
            </div>

            <div>
              <label
                htmlFor="test-input-2"
                className="block text-white mb-2 font-medium"
              >
                Email Input
              </label>
              <Input
                id="test-input-2"
                type="email"
                variant="glass"
                placeholder="Enter email address"
                aria-describedby="test-input-2-error"
              />
              <div
                id="test-input-2-error"
                className="error-message mt-1"
                role="alert"
              >
                Please enter a valid email address
              </div>
            </div>

            <div>
              <label
                htmlFor="test-input-3"
                className="block text-white mb-2 font-medium"
              >
                Valid Input
              </label>
              <Input
                id="test-input-3"
                type="text"
                variant="glass"
                placeholder="This input is valid"
                isValid={true}
                aria-describedby="test-input-3-success"
              />
              <div
                id="test-input-3-success"
                className="success-message mt-1"
                role="status"
              >
                Input is valid
              </div>
            </div>

            <Button type="submit" className="glass-button">
              Submit Test Form
            </Button>
          </form>
        </GlassCard>

        {/* Keyboard Navigation Test */}
        <GlassCard className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">
            Keyboard Navigation
          </h2>
          <p className="text-white mb-4">
            Use Tab, Shift+Tab, Enter, and Space to navigate through these
            elements:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="glass-button" tabIndex={0}>
              Button 1
            </Button>
            <Button className="glass-button" tabIndex={0}>
              Button 2
            </Button>
            <Button className="glass-button" tabIndex={0}>
              Button 3
            </Button>
            <Button className="glass-button" tabIndex={0}>
              Button 4
            </Button>
          </div>
          <div className="mt-4">
            <a href="#" className="text-blue-300 underline mr-4" tabIndex={0}>
              Test Link 1
            </a>
            <a href="#" className="text-blue-300 underline mr-4" tabIndex={0}>
              Test Link 2
            </a>
            <button className="text-blue-300 underline" tabIndex={0}>
              Button Link
            </button>
          </div>
        </GlassCard>

        {/* Color Contrast Test */}
        <GlassCard className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">
            Color Contrast Examples
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-white text-black rounded">
              <strong>Good Contrast:</strong> Black text on white background
              (21:1 ratio)
            </div>
            <div className="p-4 bg-gray-200 text-gray-800 rounded">
              <strong>Acceptable Contrast:</strong> Dark gray on light gray (7:1
              ratio)
            </div>
            <div className="p-4 bg-blue-600 text-white rounded">
              <strong>Good Contrast:</strong> White text on blue background
              (8.6:1 ratio)
            </div>
            <div className="p-4 bg-yellow-400 text-black rounded">
              <strong>Good Contrast:</strong> Black text on yellow background
              (19.6:1 ratio)
            </div>
          </div>
        </GlassCard>

        {/* Reduced Motion Test */}
        <GlassCard>
          <h2 className="text-2xl font-semibold mb-4 text-white">
            Reduced Motion Test
          </h2>
          <p className="text-white mb-4">
            These elements should respect the user's reduced motion preferences:
          </p>
          <div className="space-y-4">
            <div className="animate-fade-in-up p-4 bg-white/10 rounded">
              Fade in animation (should be disabled if reduced motion is
              preferred)
            </div>
            <div className="animate-hover-lift p-4 bg-white/10 rounded cursor-pointer">
              Hover to see lift animation (should be static if reduced motion is
              preferred)
            </div>
            <div className="animate-glow-pulse p-4 bg-white/10 rounded">
              Pulsing glow animation (should be static if reduced motion is
              preferred)
            </div>
          </div>
          <p className="text-white/70 text-sm mt-4">
            To test: Enable "Reduce motion" in your system accessibility
            settings and refresh the page.
          </p>
        </GlassCard>

        {/* Skip Links Test */}
        <div className="mt-8 text-center">
          <p className="text-white/70 text-sm">
            Press Tab from the top of the page to see skip links appear. Skip
            links help keyboard users navigate quickly to main content areas.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityTest;
