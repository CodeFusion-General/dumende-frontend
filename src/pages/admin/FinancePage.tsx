import React, { useEffect, useMemo, useState } from "react";
import CaptainLayout from "@/components/admin/layout/CaptainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { paymentService } from "@/services/paymentService";
import { financeService, FinanceTransactionDTO } from "@/services/financeService";
import { captainProfileService } from "@/services/captainProfile.service";
import { useAuth } from "@/contexts/AuthContext";
import { CreditCard, Download, Info, TrendingUp } from "lucide-react";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

type RevenueItem = {
  id: number;
  date: string;
  tourName: string;
  amount: number;
  status: "PENDING" | "PARTIAL" | "COMPLETED" | "FAILED" | "CANCELLED";
};

const FinancePage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const [revenues, setRevenues] = useState<RevenueItem[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [pendingPayout, setPendingPayout] = useState<number>(0);
  const [revenueSeries, setRevenueSeries] = useState<{ day: string; revenue: number }[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const now = new Date();
        const to = now.toISOString().slice(0, 10);
        const from = new Date(now.getTime() - (period === "7d" ? 7 : period === "30d" ? 30 : 90) * 86400000)
          .toISOString()
          .slice(0, 10);

        // Özet
        const summary = await financeService.getSummary({ from, to });
        const summaryTotal = Number(summary.totalRevenue || 0);
        const summaryPending = Number(summary.pendingPayout || 0);
        setTotalRevenue(isNaN(summaryTotal) ? 0 : summaryTotal);
        setPendingPayout(isNaN(summaryPending) ? 0 : summaryPending);

        // İşlemler
        const txs = await financeService.getTransactions({ from, to });
        const mapped: RevenueItem[] = (txs as FinanceTransactionDTO[]).map((t) => ({
          id: t.id,
          date: t.date,
          tourName: t.tourName,
          amount: Number(t.amount || 0),
          status: t.status === "COMPLETED" ? "COMPLETED" : t.status === "PENDING" ? "PENDING" : "FAILED",
        }));
        setRevenues(mapped);

        // Mock günlük seri (grafik): son 10 gün
        const days = Array.from({ length: 10 }).map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (9 - i));
          return d;
        });
        // Basit seri: günlük toplam (işlemlerden hesapla)
        const dayKey = (d: Date) => d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" });
        const dailyTotals = new Map<string, number>();
        mapped.forEach((r) => {
          const d = new Date(r.date);
          const key = dayKey(d);
          const prev = dailyTotals.get(key) || 0;
          dailyTotals.set(key, prev + (r.status === "COMPLETED" ? r.amount : 0));
        });
        const series = days.map((d) => ({
          day: dayKey(d),
          revenue: dailyTotals.get(dayKey(d)) || 0,
        }));
        setRevenueSeries(series);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [period]);

  const summary = useMemo(() => {
    const completed = revenues.filter((r) => r.status === "COMPLETED").reduce((s, r) => s + r.amount, 0);
    const partial = revenues.filter((r) => r.status === "PARTIAL").reduce((s, r) => s + r.amount, 0);
    const pending = revenues.filter((r) => r.status === "PENDING").reduce((s, r) => s + r.amount, 0);
    return { completed, partial, pending };
  }, [revenues]);

  return (
    <CaptainLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Finans</h1>
            <p className="text-muted-foreground">Gelirler, ödemeler ve tahsilatlarınızı yönetin.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPeriod("7d")}>7 Gün</Button>
            <Button variant="outline" size="sm" onClick={() => setPeriod("30d")}>30 Gün</Button>
            <Button variant="outline" size="sm" onClick={() => setPeriod("90d")}>90 Gün</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paymentService.formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">Seçili dönem</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bekleyen Tahsilat</CardTitle>
              <CreditCard className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paymentService.formatCurrency(pendingPayout)}</div>
              <p className="text-xs text-muted-foreground">Ödeme servisi onayı bekleniyor</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="transactions">
          <TabsList>
            <TabsTrigger value="transactions">İşlemler</TabsTrigger>
            <TabsTrigger value="payouts">Ödemeler</TabsTrigger>
            <TabsTrigger value="reports">Raporlar</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <Card className="lg:col-span-8">
                <CardHeader>
                  <CardTitle>Gelir Trendleri</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    className="aspect-auto h-[360px] sm:h-[420px] md:h-[480px]"
                    config={{
                      revenue: { label: "Gelir", color: "hsl(var(--primary))" },
                    }}
                  >
                    <AreaChart data={revenueSeries} margin={{ left: 12, right: 12 }}>
                      <defs>
                        <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="rgba(59,130,246,0.45)" />
                          <stop offset="95%" stopColor="rgba(59,130,246,0.05)" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="day" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} width={40} />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Area type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} fill="url(#revenueFill)" />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>Gelir Akışı</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-12 gap-3 text-xs text-muted-foreground">
                    <div className="col-span-4 font-medium">Tarih</div>
                    <div className="col-span-4 font-medium">Tur</div>
                    <div className="col-span-2 font-medium">Tutar</div>
                    <div className="col-span-2 font-medium">Durum</div>
                  </div>
                  <Separator />
                  {revenues.map((r) => {
                    // Depozito durumunu kullanıcıya göstermemek için PARTIAL -> Bekliyor
                    const statusText =
                      r.status === "COMPLETED"
                        ? "Başarılı"
                        : r.status === "FAILED" || r.status === "CANCELLED"
                        ? "Başarısız"
                        : "Bekliyor";
                    const statusColor =
                      r.status === "COMPLETED"
                        ? "text-green-600"
                        : r.status === "FAILED" || r.status === "CANCELLED"
                        ? "text-red-600"
                        : "text-amber-600";
                    return (
                      <div key={r.id} className="grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-4 text-sm">{new Date(r.date).toLocaleDateString("tr-TR")}</div>
                        <div className="col-span-4 text-sm truncate" title={r.tourName}>{r.tourName}</div>
                        <div className="col-span-2 text-sm font-medium">{paymentService.formatCurrency(r.amount)}</div>
                        <div className={`col-span-2 text-sm font-medium ${statusColor}`}>{statusText}</div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payouts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ödeme Durumu</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer className="aspect-auto h-[300px] sm:h-[360px]" config={{ paid: { label: "Ödenen", color: "#22c55e" }, pending: { label: "Bekleyen", color: "#f59e0b" } }}>
                  <BarChart data={[{ label: "Tutar", paid: summary.completed, pending: summary.pending + summary.partial }] } margin={{ left: 12, right: 12 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} width={40} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="paid" fill="var(--color-paid)" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="pending" fill="var(--color-pending)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ödeme Talep Et</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Talep Tutarı</Label>
                    <Input type="number" min={0} placeholder="₺" />
                  </div>
                  <div>
                    <Label>Açıklama (opsiyonel)</Label>
                    <Input placeholder="Ek bilgi" />
                  </div>
                  <div className="flex items-end">
                    <Button disabled={loading}>Talep Oluştur</Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Info className="h-4 w-4" />
                  İşlemler ödeme servisinin onay sürecine tabidir.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Raporlar</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Dışa Aktar (CSV)
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Dönemsel gelir, depozito ve bakiye raporlarını buradan indirebilirsiniz.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CaptainLayout>
  );
};

export default FinancePage;


