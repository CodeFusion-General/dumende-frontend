import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, Download } from "lucide-react";
import {
  USER_SERVICE_CONTRACT,
  BOAT_OWNER_SERVICE_CONTRACT,
  ADDITIONAL_PROTOCOL,
  CONTRACT_VERSION,
} from "@/utils/contractTexts";

interface ContractModalProps {
  children: React.ReactNode;
  onAccept?: () => void;
  showAcceptButton?: boolean;
  contractType?: "user" | "boat-owner";
  title?: string;
}

export const ContractModal: React.FC<ContractModalProps> = ({
  children,
  onAccept,
  showAcceptButton = false,
  contractType = "user",
  title,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAccept = () => {
    onAccept?.();
    setIsOpen(false);
  };

  const getContractContent = () => {
    if (contractType === "boat-owner") {
      return {
        title: "TEKNE SAHİBİ HİZMET SÖZLEŞMESİ",
        content: `${BOAT_OWNER_SERVICE_CONTRACT}\n\n--- EK PROTOKOL ---\n\n${ADDITIONAL_PROTOCOL}`,
        filename: `Dumende_Tekne_Sahibi_Sozlesmesi_${CONTRACT_VERSION}_${
          new Date().toISOString().split("T")[0]
        }.txt`,
      };
    }
    return {
      title: "KULLANICI HİZMET SÖZLEŞMESİ",
      content: USER_SERVICE_CONTRACT,
      filename: `Dumende_Kullanici_Sozlesmesi_${CONTRACT_VERSION}_${
        new Date().toISOString().split("T")[0]
      }.txt`,
    };
  };

  const handleDownload = () => {
    const contract = getContractContent();
    const contractContent = `${contract.title}
Versiyon: ${CONTRACT_VERSION}
Tarih: ${new Date().toLocaleDateString("tr-TR")}

${contract.content}

Bu sözleşme elektronik ortamda onaylanmıştır.
İndirme Tarihi: ${new Date().toLocaleString("tr-TR")}`;

    const blob = new Blob([contractContent], {
      type: "text/plain;charset=utf-8",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = contract.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const formatContractText = (text: string) => {
    return text.split("\n").map((line, index) => {
      // Headers (lines starting with ##)
      if (line.startsWith("## ")) {
        return (
          <h3
            key={index}
            className="text-lg font-semibold text-gray-900 mt-8 mb-4 first:mt-0 border-b border-gray-200 pb-2"
          >
            {line.replace("## ", "")}
          </h3>
        );
      }

      // Main title (single #)
      if (line.startsWith("# ")) {
        return (
          <h2
            key={index}
            className="text-2xl font-bold text-gray-900 mb-6 text-center border-b-2 border-blue-200 pb-4"
          >
            {line.replace("# ", "")}
          </h2>
        );
      }

      // Horizontal line (---)
      if (line.trim() === "---") {
        return <hr key={index} className="my-6 border-gray-300" />;
      }

      // Bold text (**text**)
      if (line.includes("**") && line.trim() !== "") {
        const formattedLine = line.replace(
          /\*\*(.*?)\*\*/g,
          "<strong class='font-semibold text-gray-900'>$1</strong>"
        );
        return (
          <p
            key={index}
            className="mb-3 text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formattedLine }}
          />
        );
      }

      // Special formatted lines (starting with emojis or special chars)
      if (/^[📞🔒📅⏰📋💾✅]/.test(line.trim())) {
        return (
          <p
            key={index}
            className="mb-2 text-sm text-blue-700 font-medium bg-blue-50 p-2 rounded"
          >
            {line.trim()}
          </p>
        );
      }

      // List items (lines starting with numbers or -)
      if (/^\d+\.\d+/.test(line.trim()) || line.trim().startsWith("- ")) {
        return (
          <p key={index} className="mb-2 ml-6 text-gray-700 leading-relaxed">
            {line.trim()}
          </p>
        );
      }

      // Empty lines
      if (line.trim() === "") {
        return <div key={index} className="mb-3" />;
      }

      // Regular paragraphs
      return (
        <p
          key={index}
          className="mb-4 text-gray-700 leading-relaxed text-justify"
        >
          {line}
        </p>
      );
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">
                  {title ||
                    (contractType === "boat-owner"
                      ? "Tekne Sahibi Hizmet Sözleşmesi"
                      : "Kullanıcı Hizmet Sözleşmesi")}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    Versiyon {CONTRACT_VERSION}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {new Date().toLocaleDateString("tr-TR")}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" />
                İndir
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6">
              <div className="prose prose-sm max-w-none">
                {contractType === "boat-owner" ? (
                  <>
                    {formatContractText(BOAT_OWNER_SERVICE_CONTRACT)}
                    <hr className="my-8 border-gray-300" />
                    <h2 className="text-xl font-bold text-gray-900 mb-4 text-center border-b-2 border-blue-200 pb-4">
                      EK PROTOKOL / SÖZLEŞME EKİ
                    </h2>
                    {formatContractText(ADDITIONAL_PROTOCOL)}
                  </>
                ) : (
                  formatContractText(USER_SERVICE_CONTRACT)
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        {showAcceptButton && (
          <div className="p-6 pt-4 border-t bg-gray-50 shrink-0">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Sözleşmeyi okuyup anladığınızı onaylayın
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  İptal
                </Button>
                <Button onClick={handleAccept} className="gap-2">
                  <Eye className="h-4 w-4" />
                  Okudum ve Kabul Ediyorum
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
