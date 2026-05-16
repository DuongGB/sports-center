import { useState, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { apiCall } from "@/config/api";
import { CheckCircle2, XCircle, RefreshCw, QrCode } from "lucide-react";
import { formatDate } from "@/utils/dateUtils";

export default function ScannerPage() {
  const [scannedData, setScannedData] = useState(null);
  const [isScanning, setIsScanning] = useState(true);
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async (text) => {
    if (!text || !isScanning) return;
    
    // Check if we scanned the text inside the array if library returns array
    const token = Array.isArray(text) ? text[0].rawValue : text;
    
    if (!token) return;

    setIsScanning(false);
    setScannedData(token);
    setLoading(true);

    try {
      const response = await apiCall("/qr/scan", {
        method: "POST",
        body: JSON.stringify({ token }),
      });
      
      if (response.success) {
        setScanResult({
          success: true,
          booking: response.data,
        });
        toast.success("Check-in thành công!");
      } else {
        setScanResult({
          success: false,
          error: response.message || "Quét mã không thành công.",
        });
        toast.error("Check-in thất bại!");
      }
    } catch (error) {
      setScanResult({
        success: false,
        error: error.message || "Lỗi khi quét mã QR.",
      });
      toast.error("Lỗi khi quét mã QR!");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setScannedData(null);
    setScanResult(null);
    setIsScanning(true);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Quét mã QR</h1>
          <p className="text-muted-foreground mt-2">
            Quét mã QR của khách hàng để check-in nhận sân.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <Card className="glass-card overflow-hidden">
          <CardHeader className="glass-header">
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              Camera Quét Mã
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isScanning ? (
              <div className="aspect-square bg-black relative">
                <Scanner
                  onScan={handleScan}
                  onError={(error) => console.log(error?.message)}
                  components={{ audio: false, finder: true }}
                />
              </div>
            ) : (
              <div className="aspect-square bg-muted flex items-center justify-center flex-col gap-4">
                <QrCode className="h-16 w-16 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Đã quét xong</p>
                <Button onClick={handleReset} variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Quét lại
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="glass-header">
            <CardTitle>Kết Quả</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {!scannedData && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-12">
                <p>Vui lòng đưa mã QR vào khung camera</p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p>Đang xử lý...</p>
              </div>
            )}

            {!loading && scanResult && (
              <div className="space-y-6">
                {scanResult.success ? (
                  <>
                    <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 p-4 rounded-lg">
                      <CheckCircle2 className="h-8 w-8" />
                      <div>
                        <h3 className="font-bold text-lg">Check-in Hợp Lệ</h3>
                        <p className="text-sm">Ghi nhận vào hệ thống thành công</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4 text-sm mt-4">
                      <div className="grid grid-cols-3 py-2 border-b">
                        <span className="text-muted-foreground">Khách hàng:</span>
                        <span className="col-span-2 font-medium">{scanResult.booking.customerName}</span>
                      </div>
                      <div className="grid grid-cols-3 py-2 border-b">
                        <span className="text-muted-foreground">SĐT:</span>
                        <span className="col-span-2 font-medium">{scanResult.booking.customerPhone}</span>
                      </div>
                      <div className="grid grid-cols-3 py-2 border-b">
                        <span className="text-muted-foreground">Sân:</span>
                        <span className="col-span-2 font-medium text-primary">{scanResult.booking.courtName}</span>
                      </div>
                      <div className="grid grid-cols-3 py-2 border-b">
                        <span className="text-muted-foreground">Thời gian:</span>
                        <span className="col-span-2 font-medium">
                          {scanResult.booking.startTime?.slice(0,5)} - {scanResult.booking.endTime?.slice(0,5)} ({formatDate(scanResult.booking.bookingDate)})
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-3 text-rose-600 bg-rose-50 p-4 rounded-lg">
                    <XCircle className="h-8 w-8" />
                    <div>
                      <h3 className="font-bold text-lg">Từ chối Check-in</h3>
                      <p className="text-sm">{scanResult.error}</p>
                    </div>
                  </div>
                )}
                
                <div className="pt-4">
                  <Button onClick={handleReset} className="w-full gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Quét Khách Tiếp Theo
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
