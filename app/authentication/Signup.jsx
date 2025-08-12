import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Checkbox } from "react-native-paper";
import ButtonLayout from "../input/ButtonLayout";
import InputLayout from "../input/InputLayout";

const { width, height } = Dimensions.get("window");

const Signup = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    ad: "",
    soyad: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onClickLogin = () => {
    router.push("/authentication/Login");
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setError("");

    if (!agree) {
      setError("Lütfen şartları ve koşulları kabul edin.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Şifreler uyuşmuyor.");
      return;
    }

    if (
      !formData.ad ||
      !formData.soyad ||
      !formData.username ||
      !formData.email ||
      !formData.password
    ) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }

    setLoading(true);

    try {
      // Burada gerçek API çağrısı yapılacak
      console.log("Kayıt verileri:", formData);
      Alert.alert("Başarılı", "Kayıt işlemi başlatıldı!");
      router.push("/authentication/Login");
    } catch (err) {
      console.error(err);
      setError("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Cover Background */}
        <View style={styles.coverBackground}>
          <LinearGradient
            colors={["rgba(0,0,0,0.4)", "rgba(0,0,0,0.4)"]}
            style={styles.coverGradient}
          />
        </View>

        {/* Card Container */}
        <View style={styles.cardContainer}>
          <View style={styles.card}>
            {/* Gradient Header */}
            <LinearGradient
              colors={["#09b2e5", "#0ea5e9"]}
              style={styles.gradientHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.headerTitle}>Hemen Katıl</Text>
              <Text style={styles.headerSubtitle}>
                Kayıt olmak için bilgilerinizi doldurun
              </Text>
              <View style={styles.googleButton}>
                <Ionicons name="logo-google" size={16} color="white" />
                <Text style={styles.googleButtonText}>Google ile devam et</Text>
              </View>
            </LinearGradient>

            {/* Form Content */}
            <View style={styles.formContent}>
              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <InputLayout
                value={formData.ad}
                onChangeText={(value) => handleChange("ad", value)}
                placeholder="Ad"
                rightIconName="person-outline"
              />

              <InputLayout
                value={formData.soyad}
                onChangeText={(value) => handleChange("soyad", value)}
                placeholder="Soyad"
                rightIconName="person-outline"
              />

              <InputLayout
                value={formData.username}
                onChangeText={(value) => handleChange("username", value)}
                placeholder="Kullanıcı Adı"
                rightIconName="person-outline"
              />

              <InputLayout
                value={formData.email}
                onChangeText={(value) => handleChange("email", value)}
                placeholder="E-Posta"
                keyboardType="email-address"
                rightIconName="mail-outline"
              />

              <InputLayout
                value={formData.password}
                onChangeText={(value) => handleChange("password", value)}
                placeholder="Şifre"
                secureTextEntry={true}
                rightIconName="lock"
              />

              <InputLayout
                value={formData.confirmPassword}
                onChangeText={(value) => handleChange("confirmPassword", value)}
                placeholder="Şifre Tekrar"
                secureTextEntry={true}
                rightIconName="lock"
              />

              <View style={styles.checkboxContainer}>
                <Checkbox
                  status={agree ? "checked" : "unchecked"}
                  onPress={() => setAgree(!agree)}
                  color="#09b2e5"
                  uncheckedColor="#64748b"
                />
                <View style={styles.checkboxTextContainer}>
                  <Text style={styles.checkboxText}>
                    Şartları ve{" "}
                    <Text style={styles.checkboxLink}>
                      Koşulları kabul ediyorum
                    </Text>
                  </Text>
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <ButtonLayout
                  onClick={handleSubmit}
                  ButtonText={loading ? "Kayıt Yapılıyor..." : "Kayıt Ol"}
                  color1="#09b2e5"
                  disabled={loading}
                />
              </View>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>
                  Zaten bir hesabınız var mı?{" "}
                  <Text style={styles.loginLink} onPress={onClickLogin}>
                    Giriş Yap
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  coverBackground: {
    height: height * 0.35,
    backgroundColor: "#1e293b",
    position: "relative",
  },
  coverGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContainer: {
    marginTop: -height * 0.18,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    overflow: "hidden",
  },
  gradientHeader: {
    padding: 24,
    paddingTop: 28,
    paddingBottom: 28,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
    marginBottom: 16,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  googleButtonText: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 8,
  },
  formContent: {
    padding: 24,
  },
  errorContainer: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
    textAlign: "center",
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 8,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 16,
    marginBottom: 8,
  },
  checkboxTextContainer: {
    flex: 1,
    marginLeft: 8,
    paddingTop: 2,
  },
  checkboxText: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
  checkboxLink: {
    color: "#09b2e5",
    fontWeight: "600",
  },
  loginContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  loginText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
  loginLink: {
    color: "#09b2e5",
    fontWeight: "600",
  },
});

export default Signup;
