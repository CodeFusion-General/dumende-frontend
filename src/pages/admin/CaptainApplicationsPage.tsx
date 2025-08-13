import React, { useEffect, useMemo, useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { captainApplicationService } from "@/services/captainApplicationService";
import type { CaptainApplication, CaptainApplicationStatus } from "@/types/captain.types";
import { CheckCircle, XCircle, RefreshCw, FileText, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
};

const statusOptions: Array<{ value: CaptainApplicationStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "Tümü" },
  { value: "PENDING", label: "Beklemede" },
  { value: "APPROVED", label: "Onaylandı" },
  { value: "REJECTED", label: "Reddedildi" },
];

const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleString("tr-TR") : "-";

const CaptainApplicationsPage: React.FC = () => {
  const [status, setStatus] = useState<CaptainApplicationStatus | "ALL">("PENDING");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [data, setData] = useState<PageResponse<CaptainApplication> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [rejectTarget, setRejectTarget] = useState<CaptainApplication | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [actionLoading, setActionLoading] = useState(false);

  const effectiveStatusParam = useMemo<CaptainApplicationStatus | undefined>(() => (status === "ALL" ? undefined : status), [status]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await captainApplicationService.list({ status: effectiveStatusParam, page, size });
      setData(res);
    } catch (e: any) {
      setError(e?.message || "Liste yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page, size]);

  const approve = async (app: CaptainApplication) => {
    try {
      setActionLoading(true);
      await captainApplicationService.review(app.id, { status: "APPROVED" });
      await load();
    } catch (e: any) {
      setError(e?.message || "Onay işlemi başarısız");
    } finally {
      setActionLoading(false);
    }
  };

  const askReject = (app: CaptainApplication) => {
    setRejectTarget(app);
    setRejectReason("");
  };

  const reject = async () => {
    if (!rejectTarget) return;
    if (!rejectReason || rejectReason.trim().length < 5) {
      setError("Red nedeni en az 5 karakter olmalıdır");
      return;
    }
    try {
      setActionLoading(true);
      await captainApplicationService.review(rejectTarget.id, {
        status: "REJECTED",
        rejectionReason: rejectReason.trim(),
      });
      setRejectTarget(null);
      setRejectReason("");
      await load();
    } catch (e: any) {
      setError(e?.message || "Red işlemi başarısız");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Kaptan Başvuruları</h1>
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Yenile
          </Button>
        </div>

        <Card className="mb-4">
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="w-full md:w-64">
                <Label className="mb-1 block">Durum</Label>
                <select
                  className="w-full border rounded-md h-10 px-3 bg-background"
                  value={status}
                  onChange={(e) => {
                    setPage(0);
                    setStatus(e.target.value as CaptainApplicationStatus | "ALL");
                  }}
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full md:w-32">
                <Label className="mb-1 block">Sayfa Boyutu</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={size}
                  onChange={(e) => {
                    const v = Number(e.target.value) || 10;
                    setSize(v);
                    setPage(0);
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Başvurular</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">ID</th>
                    <th className="py-2 pr-4">Kullanıcı</th>
                    <th className="py-2 pr-4">Lisans</th>
                    <th className="py-2 pr-4">Deneyim</th>
                    <th className="py-2 pr-4">Oluşturulma</th>
                    <th className="py-2 pr-4">Durum</th>
                    <th className="py-2 pr-4">Belgeler</th>
                    <th className="py-2 pr-4">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-muted-foreground">
                        Yükleniyor...
                      </td>
                    </tr>
                  ) : data && data.content.length > 0 ? (
                    data.content.map((app) => (
                      <tr key={app.id} className="border-b hover:bg-muted/30">
                        <td className="py-2 pr-4">
                          <button
                            className="text-primary hover:underline"
                            onClick={() => navigate(`/admin/captain-applications/${app.id}`)}
                            title="Detay"
                          >
                            #{app.id}
                          </button>
                        </td>
                        <td className="py-2 pr-4">
                          <div className="flex flex-col">
                            <span className="font-medium">{app.fullName || "-"}</span>
                            <span className="text-muted-foreground">UID: {app.userId}</span>
                            {app.professionalInfo?.licenseExpiry && (
                              <span className="text-xs text-muted-foreground">
                                Son: {formatDate(app.professionalInfo.licenseExpiry)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2 pr-4">
                          <div className="flex flex-col">
                            <span>{app.professionalInfo?.licenseNumber || "-"}</span>
                          </div>
                        </td>
                        <td className="py-2 pr-4">{app.professionalInfo?.yearsOfExperience ?? "-"}</td>
                        <td className="py-2 pr-4">{formatDate(app.createdAt)}</td>
                        <td className="py-2 pr-4">
                          {app.status === "PENDING" && (
                            <Badge variant="secondary">Beklemede</Badge>
                          )}
                          {app.status === "APPROVED" && (
                            <Badge className="bg-green-600">Onaylandı</Badge>
                          )}
                          {app.status === "REJECTED" && (
                            <Badge variant="destructive">Reddedildi</Badge>
                          )}
                        </td>
                        <td className="py-2 pr-4">
                          <div className="flex gap-2 flex-wrap">
                            {app.documentFilePaths?.length ? (
                              app.documentFilePaths.map((p, idx) => (
                                <Badge key={idx} variant="outline" title={p} className="max-w-[180px] truncate">
                                  <FileText className="w-3 h-3 mr-1" />
                                  {p.split("/").pop()}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </div>
                        </td>
                        <td className="py-2 pr-4">
                          {app.status === "PENDING" ? (
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => approve(app)} disabled={actionLoading}>
                                <CheckCircle className="w-4 h-4 mr-1" /> Onayla
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => askReject(app)} disabled={actionLoading}>
                                <XCircle className="w-4 h-4 mr-1" /> Reddet
                              </Button>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-muted-foreground">
                        Kayıt bulunamadı
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Toplam: {data?.totalElements ?? 0} | Sayfa {((data?.number ?? 0) + 1)} / {data?.totalPages ?? 1}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={!data || data.first || loading}
                  onClick={() => setPage((p) => Math.max(p - 1, 0))}
                >
                  Önceki
                </Button>
                <Button
                  variant="outline"
                  disabled={!data || data.last || loading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Sonraki
                </Button>
              </div>
            </div>

            {/* Reject Panel */}
            {rejectTarget && (
              <Card className="mt-6 border-destructive/30">
                <CardHeader>
                  <CardTitle>Başvuruyu Reddet: #{rejectTarget.id}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Alert>
                    <AlertDescription>
                      Lütfen red nedenini belirtin. Bu mesaj kullanıcıya iletilecektir.
                    </AlertDescription>
                  </Alert>
                  <div className="space-y-2">
                    <Label htmlFor="rejectReason">Red Nedeni</Label>
                    <Textarea
                      id="rejectReason"
                      rows={3}
                      placeholder="Örn: Belgeler eksik, lütfen güncel belgeleri yükleyin."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setRejectTarget(null)} disabled={actionLoading}>
                      İptal
                    </Button>
                    <Button variant="destructive" onClick={reject} disabled={actionLoading}>
                      Reddet
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CaptainApplicationsPage;


