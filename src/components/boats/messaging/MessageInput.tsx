import React, { useState, useRef, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Shield, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  validateMessageContent,
  analyzeMessageSecurity,
} from "@/utils/messagingSecurity";

export interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  loading?: boolean;
  maxLength?: number;
  enableSecurityValidation?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Mesajınızı yazın...",
  loading = false,
  maxLength = 1000,
  enableSecurityValidation = true,
}) => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [securityWarnings, setSecurityWarnings] = useState<string[]>([]);
  const [securityRisk, setSecurityRisk] = useState<"low" | "medium" | "high">(
    "low"
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const validateMessage = (text: string): string | null => {
    if (enableSecurityValidation) {
      const validation = validateMessageContent(text);
      if (!validation.isValid) {
        return validation.errors[0];
      }
      return null;
    } else {
      // Fallback validation
      if (!text.trim()) {
        return "Mesaj boş olamaz";
      }
      if (text.length > maxLength) {
        return `Mesaj ${maxLength} karakterden uzun olamaz`;
      }
      return null;
    }
  };

  const handleSendMessage = () => {
    const trimmedMessage = message.trim();
    const validationError = validateMessage(trimmedMessage);

    if (validationError) {
      setError(validationError);
      return;
    }

    // Use sanitized content if security validation is enabled
    let messageToSend = trimmedMessage;
    if (enableSecurityValidation) {
      const validation = validateMessageContent(trimmedMessage);
      if (validation.sanitizedContent) {
        messageToSend = validation.sanitizedContent;
      }
    }

    setError(null);
    setSecurityWarnings([]);
    onSendMessage(messageToSend);
    setMessage("");

    // Focus back to input after sending
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && !loading && message.trim()) {
        handleSendMessage();
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);

    // Clear error when user starts typing
    if (error) {
      setError(null);
    }

    // Real-time security analysis
    if (enableSecurityValidation && newValue.trim()) {
      const securityAnalysis = analyzeMessageSecurity(newValue);
      setSecurityRisk(securityAnalysis.riskLevel);

      if (
        securityAnalysis.riskLevel === "medium" ||
        securityAnalysis.riskLevel === "high"
      ) {
        setSecurityWarnings(securityAnalysis.issues);
      } else {
        setSecurityWarnings([]);
      }
    } else {
      setSecurityWarnings([]);
      setSecurityRisk("low");
    }
  };

  const isDisabled = disabled || loading || securityRisk === "high";
  const canSend = message.trim() && !isDisabled;
  const remainingChars = maxLength - message.length;
  const isNearLimit = remainingChars <= 100;

  return (
    <div className="border-t bg-white p-4">
      {/* Error Message */}
      {error && (
        <div
          id="message-error"
          className="mb-2 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md p-2"
        >
          {error}
        </div>
      )}

      {/* Security Warnings */}
      {enableSecurityValidation && securityWarnings.length > 0 && (
        <div
          className={cn(
            "mb-2 text-sm rounded-md p-2 flex items-start gap-2",
            securityRisk === "high"
              ? "text-red-600 bg-red-50 border border-red-200"
              : "text-yellow-600 bg-yellow-50 border border-yellow-200"
          )}
        >
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-medium">
              {securityRisk === "high" ? "Güvenlik Riski" : "Güvenlik Uyarısı"}
            </div>
            <ul className="mt-1 space-y-1">
              {securityWarnings.map((warning, index) => (
                <li key={index} className="text-xs">
                  • {warning}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Input Container */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Input
            ref={inputRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={isDisabled}
            className={cn(
              "min-h-[44px] resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500",
              "transition-all duration-200",
              error && "border-red-300 focus:border-red-500 focus:ring-red-500"
            )}
            aria-label="Mesaj yazın"
            aria-describedby={error ? "message-error" : undefined}
          />

          {/* Character Counter */}
          {isNearLimit && (
            <div
              className={cn(
                "text-xs mt-1 text-right",
                remainingChars <= 50 ? "text-red-500" : "text-yellow-600"
              )}
            >
              {remainingChars} karakter kaldı
            </div>
          )}
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSendMessage}
          disabled={!canSend}
          size="sm"
          className={cn(
            "h-[44px] px-4 transition-all duration-200 flex items-center gap-2",
            securityRisk === "high"
              ? "bg-red-500 hover:bg-red-600 disabled:bg-gray-300"
              : securityRisk === "medium"
              ? "bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300"
              : "bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300"
          )}
          aria-label="Mesaj gönder"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : securityRisk === "high" ? (
            <Shield className="w-4 h-4" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">
            {securityRisk === "high" ? "Engellendi" : "Gönder"}
          </span>
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
