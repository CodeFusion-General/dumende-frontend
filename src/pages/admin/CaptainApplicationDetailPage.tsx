import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { captainApplicationService } from "@/services/captainApplicationService";
import type { CaptainApplication } from "@/types/captain.types";
import { ArrowLeft, CheckCircle, XCircle, FileText } from "lucide-react";

const CaptainApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [app, setApp] = useState<CaptainApplication | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await captainApplicationService.getById(Number(id));
      setApp(data);
    } catch (e: any) {
      setError(e?.message || "Detay alınamadı");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const approve = async () => {
    if (!id) return;
    try {
      await captainApplicationService.review(Number(id), { status: "APPROVED" });
      await load();
    } catch (e: any) {
      setError(e?.message || "Onay başarısız");
    }
  };

  const reject = async () => {
    if (!id) return;
    const reason = prompt("Red nedeni");
    if (!reason || reason.trim().length < 5) return;
    try {
      await captainApplicationService.review(Number(id), { status: "REJECTED", rejectionReason: reason.trim() });
      await load();
    } catch (e: any) {
      setError(e?.message || "Red işlemi başarısız");
    }
  };

  const download = async (filePath: string) => {
    try {
      // Backend'te signed URL endpoint'i var ise onu kullanın; şimdilik dosya path'ini açıyoruz.
      window.open(`/api/captain-applications/${id}/documents?file=${encodeURIComponent(filePath)}`, "_blank");
    } catch {}
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Geri
          </Button>
          <div className="flex gap-2">
            {app?.status === "PENDING" && (
              <>
                <Button onClick={approve}><CheckCircle className="w-4 h-4 mr-1"/> Onayla</Button>
                <Button variant="destructive" onClick={reject}><XCircle className="w-4 h-4 mr-1"/> Reddet</Button>
              </>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Başvuru Detayı #{id}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-muted-foreground">Yükleniyor...</div>
            ) : app ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4 items-center">
                  <div>
                    <div className="text-sm text-muted-foreground">Kullanıcı</div>
                    <div className="font-medium">{app.fullName || "-"} (UID: {app.userId})</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Durum</div>
                    <div>
                      {app.status === "PENDING" && <Badge variant="secondary">Beklemede</Badge>}
                      {app.status === "APPROVED" && <Badge className="bg-green-600">Onaylandı</Badge>}
                      {app.status === "REJECTED" && <Badge variant="destructive">Reddedildi</Badge>}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Lisans</div>
                    <div className="font-medium">{app.professionalInfo?.licenseNumber}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Lisans Bitiş</div>
                    <div className="font-medium">{app.professionalInfo?.licenseExpiry}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Deneyim (yıl)</div>
                    <div className="font-medium">{app.professionalInfo?.yearsOfExperience}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Uzmanlıklar</div>
                    <div className="font-medium">{app.professionalInfo?.specializations?.join(", ") || "-"}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">Biyografi</div>
                  <div className="whitespace-pre-wrap">{app.professionalInfo?.bio}</div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-2">Belgeler</div>
                  <div className="flex flex-wrap gap-2">
                    {app.documentFilePaths?.length ? (
                      app.documentFilePaths.map((p, idx) => (
                        <Button key={idx} variant="outline" onClick={() => download(p)}>
                          <FileText className="w-4 h-4 mr-1"/> {p.split('/').pop()}
                        </Button>
                      ))
                    ) : (
                      <span className="text-muted-foreground">Belge yok</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">Kayıt bulunamadı</div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CaptainApplicationDetailPage;


