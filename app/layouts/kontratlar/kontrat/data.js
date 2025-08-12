import API_BASE_URL from "@/config/api";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

// Calculate progress function
export const calculateProgress = (start, end) => {
  const startDate = new Date(start.year, start.month - 1, start.day);
  const endDate = new Date(end.year, end.month - 1, end.day);
  const now = new Date();

  const total = endDate - startDate;
  const elapsed = now - startDate;

  if (now < startDate) return 0;
  if (now > endDate) return 100;

  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
};

// Custom hook for Kontrat data
export const useKontratData = () => {
  const [rows, setRows] = useState([]);
  const [selectedKontrat, setSelectedKontrat] = useState(null);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch all necessary data in parallel
      const [kontratRes, daireRes, usersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/kontrat`),
        axios.get(`${API_BASE_URL}/daire`),
        axios.get(`${API_BASE_URL}/users`),
      ]);

      const kontratData = kontratRes.data;
      const daireData = daireRes.data;
      const usersData = usersRes.data;

      // Create lookup maps for O(1) access
      const daireMap = daireData.reduce((acc, curr) => {
        acc[curr.Daire_ID] = curr;
        return acc;
      }, {});

      const userMap = usersData.reduce((acc, curr) => {
        acc[curr.id] = curr;
        return acc;
      }, {});

      const formattedRows = kontratData.map((item) => {
        const progressValue = calculateProgress(
          {
            day: item.Sozlesme_Baslangic_Gun,
            month: item.Sozlesme_Baslangic_Ay,
            year: item.Sozlesme_Baslangic_Yil,
          },
          {
            day: item.Sozlesme_Bitis_Gun,
            month: item.Sozlesme_Bitis_Ay,
            year: item.Sozlesme_Bitis_Yil,
          }
        );

        // Progress color artık Progress component içinde belirleniyor
        let progressColor = "info";
        if (progressValue > 80) progressColor = "error";
        else if (progressValue > 50) progressColor = "info";
        else progressColor = "success";

        const daireInfo = daireMap[item.Daire_ID];
        const adres = daireInfo
          ? `${daireInfo.Mahalle ?? ""} ${daireInfo.Cadde ?? ""} ${
              daireInfo.Sokak ?? ""
            } ${(daireInfo.Site || daireInfo.Apartman) ?? ""} ${
              daireInfo.Blok ?? ""
            } ${daireInfo.Daire ?? ""} ${daireInfo.Ilce ?? ""} ${
              daireInfo.Il ?? ""
            }`.trim()
          : "Bilinmiyor";

        const evSahibi = userMap[item.Ev_Sahibi_ID];
        const evSahibiAdSoyad = evSahibi
          ? `${evSahibi.Ad} ${evSahibi.Soyad}`
          : "Bilinmiyor";

        const kiraci = userMap[item.Kiraci_ID];
        const kiraciAdSoyad = kiraci
          ? `${kiraci.Ad} ${kiraci.Soyad}`
          : "Bilinmiyor";

        const gecikenOdeme = item.Geciken_Odeme
          ? item.Toplam_Geciken_Odeme
          : "Yok";

        const detailText = `Başlangıç: ${item.Sozlesme_Baslangic_Gun}/${
          item.Sozlesme_Baslangic_Ay
        }/${item.Sozlesme_Baslangic_Yil}
Bitiş: ${item.Sozlesme_Bitis_Gun}/${item.Sozlesme_Bitis_Ay}/${
          item.Sozlesme_Bitis_Yil
        }
Kira: ${item.Sozlesme_Aylik_Bedel} ₺
Aylık Şirket Payı: ${item.Aylik_Sirket_Payi || "-"}
Ödeme Günü: ${item.Odeme_Gunu || "-"}
Geciken Ödeme: ${gecikenOdeme}
Toplam Ödeme: ${item.Toplam_Odeme || 0}
Kira Garantisi: ${item.Kira_Garantisi ? "Evet" : "Hayır"}
Depozito: ${item.Depozito || 0}
Şirket Komisyonu: ${item.Sirket_Komisyonu || 0}
Şirket Komisyonu Ödemesi: ${item.Sirket_Komisyonu_Odemesi ? "Evet" : "Hayır"}`;

        return {
          id: item.Kontrat_ID,
          daire: adres,
          ev_sahibi: evSahibiAdSoyad,
          kiraci: kiraciAdSoyad,
          tamamlanma: progressValue,
          progressColor: progressColor,
          durum: item.Sozlesme_Durumu_Aktif,
          transferler: item.Kontrat_ID,
          detail: detailText,
        };
      });

      // Tamamlanma yüzdesine göre yüksekten düşüğe sırala (default sorting)
      const sortedRows = formattedRows.sort(
        (a, b) => b.tamamlanma - a.tamamlanma
      );

      setRows(sortedRows);
    } catch (err) {
      let errorMessage = "Kontrat listesi yüklenirken hata oluştu";
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.request) {
        errorMessage =
          "Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.";
      } else {
        errorMessage = "Beklenmeyen bir hata oluştu: " + err.message;
      }
      setError(errorMessage);
      Alert.alert("Hata", errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRowClick = async (id) => {
    setSelectedKontrat(id);

    try {
      const res = await axios.get(`${API_BASE_URL}/transfer?Kontrat_ID=${id}`);
      const transferList = res.data;

      if (transferList.length === 0) {
        Alert.alert("Bilgi", "Bu kontrata ait transfer bulunamadı.");
        return;
      }

      const populatedDetails = await Promise.all(
        transferList.map(async (item) => {
          try {
            const [daireRes, gonderenRes, aliciRes] = await Promise.all([
              axios.get(`${API_BASE_URL}/daire`),
              axios.get(`${API_BASE_URL}/user?user_id=${item.Gonderen_ID}`),
              axios.get(`${API_BASE_URL}/user?user_id=${item.Alici_ID}`),
            ]);

            const daireInfo = daireRes.data.find(
              (d) => d.Daire_ID === item.Daire_ID
            );
            const adres = daireInfo
              ? `${daireInfo.Mahalle ?? ""} ${daireInfo.Cadde ?? ""} ${
                  daireInfo.Sokak ?? ""
                } ${(daireInfo.Site || daireInfo.Apartman) ?? ""} ${
                  daireInfo.Blok ?? ""
                } ${daireInfo.Daire ?? ""} ${daireInfo.Ilce ?? ""} ${
                  daireInfo.Il ?? ""
                }`.trim()
              : "Bilinmiyor";

            const gonderenAdSoyad = `${gonderenRes.data.Ad} ${gonderenRes.data.Soyad}`;
            const aliciAdSoyad = `${aliciRes.data.Ad} ${aliciRes.data.Soyad}`;

            return {
              id: item.id || Math.random().toString(),
              gonderen: gonderenAdSoyad,
              alici: aliciAdSoyad,
              transfer_toplam: `${item.Transfer_Toplam} ₺`,
              transfer_tarihi: item.Transfer_Tarihi || "-",
              transfer_aciklama: item.Transfer_Aciklama || "-",
            };
          } catch (error) {
            console.error("Error fetching individual transfer data:", error);
            return {
              id: item.id || Math.random().toString(),
              gonderen: "Hata",
              alici: "Hata",
              transfer_toplam: `${item.Transfer_Toplam} ₺`,
              transfer_tarihi: item.Transfer_Tarihi || "-",
              transfer_aciklama: item.Transfer_Aciklama || "-",
            };
          }
        })
      );

      setDetails(populatedDetails);
    } catch (error) {
      console.error("Error fetching transfer data", error);
      Alert.alert("Hata", "Transfer bilgileri yüklenirken hata oluştu.");
      setDetails([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    rows,
    selectedKontrat,
    details,
    loading,
    error,
    handleRowClick,
    refetch: fetchData,
  };
};

// Default export to fix Expo Router warnings
export default useKontratData;
