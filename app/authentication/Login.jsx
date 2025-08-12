import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Keyboard,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Switch,
  ScrollView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import MDButton from "../components/MDButton";
import MDInput from "../components/MDInput";
import { useAuth } from "../../context/AuthContext";
import API_BASE_URL from "../../config/api";

const { width, height } = Dimensions.get("window");

const Login = () => {
  const router = useRouter();
  const { login } = useAuth();

  const onClickSignup = () => {
    router.push("/authentication/Signup");
  };
  const onClickForget = () => {
    router.push("/authentication/Forget");
  };

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usernameInputError, setUsernameInputError] = useState(false);
  const [usernameInputErrorMessage, setUsernameInputErrorMessage] =
    useState("");

  const [loginErrorMessage, setLoginErrorMessage] = useState("");

  const validateUsername = (text) => {
    if (!text) {
      setUsernameInputError(true);
      setUsernameInputErrorMessage("Kullanıcı adı boş bırakılamaz.");
      return false;
    }

    if (text.length < 3) {
      setUsernameInputError(true);
      setUsernameInputErrorMessage("Kullanıcı adı en az 3 karakter olmalıdır.");
      return false;
    }

    setUsernameInputError(false);
    setUsernameInputErrorMessage("");
    return true;
  };

  const onLogin = async () => {
    // Validation
    if (!validateUsername(username) || !password) {
      if (!password) {
        setLoginErrorMessage("Şifre alanı boş bırakılamaz.");
      }
      return;
    }

    setLoading(true);
    setLoginErrorMessage("");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        {
          username: username.toLowerCase(),
          password: password,
          remember_me: rememberMe,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-client-type": "mobile",
          },
        }
      );

      if (response.data && response.data.user) {
        const sessionToken = response.data.session_token;

        if (sessionToken) {
          await login(response.data.user, sessionToken);
          router.replace("/layouts/");
        } else {
          throw new Error("Session token alınamadı");
        }
      }
    } catch (err) {
      console.error("Login error:", err);

      // HTTP status code'a göre kullanıcı dostu mesajlar
      let errorMessage = "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.";

      if (err.response) {
        const status = err.response.status;

        if (status === 401) {
          errorMessage =
            "Kullanıcı adı veya şifre hatalı. Lütfen tekrar deneyin.";
        } else if (status === 400) {
          errorMessage = "Geçersiz kullanıcı adı veya şifre formatı.";
        } else if (status === 404) {
          errorMessage = "Kullanıcı bulunamadı.";
        } else if (status === 500) {
          errorMessage = "Sunucu hatası. Lütfen daha sonra tekrar deneyin.";
        } else if (status >= 500) {
          errorMessage = "Sunucu hatası. Lütfen daha sonra tekrar deneyin.";
        } else if (status >= 400) {
          errorMessage = "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.";
        }
      } else if (err.request) {
        // Network hatası
        errorMessage = "İnternet bağlantınızı kontrol edin.";
      } else {
        // Diğer hatalar
        errorMessage = "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.";
      }

      setLoginErrorMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            {/* Card Container */}
            <View style={styles.card}>
              {/* Gradient Header */}
              <LinearGradient
                colors={["#09b2e5", "#0ea5e9"]}
                style={styles.gradientHeader}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.headerTitle}>Giriş Yap</Text>
                <View style={styles.googleButton}>
                  <Ionicons name="logo-google" size={16} color="white" />
                  <Text style={styles.googleButtonText}>
                    Google ile devam et
                  </Text>
                </View>
              </LinearGradient>

              {/* Form Content */}
              <View style={styles.formContent}>
                {loginErrorMessage && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{loginErrorMessage}</Text>
                  </View>
                )}

                <MDInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Kullanıcı Adı"
                  hasError={usernameInputError}
                  errorMessage={usernameInputErrorMessage}
                  onBlur={() => validateUsername(username)}
                />

                <MDInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Şifre"
                  secureTextEntry={true}
                  rightIconName="lock"
                />

                <View style={styles.rememberMeContainer}>
                  <Switch
                    value={rememberMe}
                    onValueChange={setRememberMe}
                    trackColor={{ false: "#767577", true: "#09b2e5" }}
                    thumbColor={rememberMe ? "#fff" : "#f4f3f4"}
                  />
                  <Text style={styles.rememberMeText}>Beni hatırla</Text>
                </View>

                <View style={styles.buttonContainer}>
                  <MDButton
                    variant="contained"
                    onPress={onLogin}
                    loading={loading}
                    color="info"
                    textColor="white"
                  >
                    Giriş Yap
                  </MDButton>
                </View>

                <View style={styles.signupContainer}>
                  <Text style={styles.signupText}>
                    Hesabınız yok mu?{" "}
                    <Text style={styles.signupLink} onPress={onClickSignup}>
                      Kayıt için: renixteknoloji@gmail.com
                    </Text>
                  </Text>
                </View>
              </View>
            </View>

            {/* Test Users Info */}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 20,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
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
    padding: 20,
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#fff",
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
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  rememberMeText: {
    marginLeft: 12,
    fontSize: 14,
    color: "#64748b",
  },
  signupContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  signupText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
  signupLink: {
    color: "#09b2e5",
    fontWeight: "600",
  },
  testUsersContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  testTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  testUser: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
});

export default Login;
