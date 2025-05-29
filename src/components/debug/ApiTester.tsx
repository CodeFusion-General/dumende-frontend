import React, { useState } from "react";
import { boatService } from "@/services/boatService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ApiTester = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("🚀 API Test başlatılıyor...");
      console.log("📍 Base URL:", "/api/boats");

      const boats = await boatService.getBoats();
      console.log("✅ API yanıtı alındı:", boats);

      setResult(boats);
    } catch (err: any) {
      console.error("❌ API Hatası:", err);
      setError(err.message || "Bilinmeyen hata");
    } finally {
      setLoading(false);
    }
  };

  const testSearch = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("🔍 Search API test başlatılıyor...");

      const searchResult = await boatService.searchBoats({
        type: "Motorlu Yat",
        minCapacity: 4,
      });
      console.log("✅ Search API yanıtı:", searchResult);

      setResult(searchResult);
    } catch (err: any) {
      console.error("❌ Search API Hatası:", err);
      setError(err.message || "Bilinmeyen hata");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🧪 API Test Paneli</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testConnection} disabled={loading} variant="outline">
            {loading ? "⏳ Test Ediliyor..." : "📡 Tekneleri Getir"}
          </Button>

          <Button onClick={testSearch} disabled={loading} variant="outline">
            {loading ? "⏳ Test Ediliyor..." : "🔍 Search Test"}
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-semibold text-red-800">❌ Hata:</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800">✅ Başarılı:</h3>
            <pre className="text-sm text-green-700 mt-2 overflow-auto max-h-40">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="text-sm text-gray-500">
          <p>
            💡 <strong>İpucu:</strong> Backend'in http://localhost:8080'de
            çalıştığından emin olun.
          </p>
          <p>🔧 Network tab'ı açık tutun ve API çağrılarını izleyin.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiTester;
