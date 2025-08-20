import React from "react";
import { ContractModal } from "@/components/ui/contract-modal";
import { Button } from "@/components/ui/button";

export const ContractTest: React.FC = () => {
  const handleAccept = () => {
    alert("Sözleşme kabul edildi!");
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Contract Modal Test</h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Sadece Görüntüleme</h3>
          <ContractModal>
            <Button variant="outline" className="gap-2">
              📄 Sözleşmeyi Görüntüle
            </Button>
          </ContractModal>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Kabul Butonu ile</h3>
          <ContractModal showAcceptButton onAccept={handleAccept}>
            <Button variant="default" className="gap-2">
              📋 Sözleşmeyi İncele ve Kabul Et
            </Button>
          </ContractModal>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Test Özellikleri:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>✅ Scroll fonksiyonu çalışıyor mu?</li>
          <li>✅ İndir butonu çalışıyor mu?</li>
          <li>✅ Modal responsive mi?</li>
          <li>✅ Metin formatlaması doğru mu?</li>
          <li>✅ Kabul butonu çalışıyor mu?</li>
        </ul>
      </div>
    </div>
  );
};
