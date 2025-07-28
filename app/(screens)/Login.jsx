import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Keyboard,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import ButtonLayout from "../input/ButtonLayout";
import InputLayout from "../input/InputLayout";

const Login = () => {
  const router = useRouter();

  const onClickSignup = () => {
    router.push("/(screens)/Signup");
  };
  const onClickForget = () => {
    router.push("/(screens)/Forget");
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailInputError, setEmailInputError] = useState(false);
  const [emailInputErrorMessage, setEmailInputErrorMessage] = useState("");

  const [showLoginErrorModal, setShowLoginErrorModal] = useState(false);
  const [loginModalMessage, setLoginModalMessage] = useState("");

  const validateEmailPhone = (text) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!text) {
      setEmailInputError(true);
      setEmailInputErrorMessage("Bu alan boş bırakılamaz.");
      return false;
    }

    if (emailRegex.test(text)) {
      setEmailInputError(false);
      setEmailInputErrorMessage("");
      return true;
    }

    const cleanPhone = text.replace(/[^0-9]/g, "");

    if (cleanPhone.length === 11 && cleanPhone.startsWith("0")) {
      setEmailInputError(false);
      setEmailInputErrorMessage("");
      return true;
    } else if (cleanPhone.length === 10 && !cleanPhone.startsWith("0")) {
      setEmailInputError(false);
      setEmailInputErrorMessage("");
      return true;
    }

    setEmailInputError(true);
    setEmailInputErrorMessage(
      "Geçerli bir e-posta veya telefon numarası giriniz."
    );
    return false;
  };

  const onLogin = () => {
    // Basit validation
    if (!validateEmailPhone(email) || !password) {
      if (!password) {
        setShowLoginErrorModal(true);
        setLoginModalMessage("Şifre alanı boş bırakılamaz.");
      }
      return;
    }

    // Basit test login - gerçek API auth'u eklenecek
    console.log("Login attempt:", { email, password });
    router.replace("/layouts/");
  };

  const CustomLoginErrorModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showLoginErrorModal}
      onRequestClose={() => {
        setShowLoginErrorModal(false);
      }}
    >
      <View style={modalStyles.centeredView}>
        <View style={modalStyles.modalView}>
          <Text style={modalStyles.modalText}>{loginModalMessage}</Text>
          <Pressable
            style={[modalStyles.button, modalStyles.buttonClose]}
            onPress={() => setShowLoginErrorModal(false)}
          >
            <Text style={modalStyles.textStyle}>Tamam</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.top}>
            <Text style={styles.title}>Giriş Yap</Text>
            <Text style={styles.welcome}>Tekrar hoş geldin!</Text>

            <View style={styles.testUsers}>
              <Text style={styles.testTitle}>Test Kullanıcıları:</Text>
              <Text style={styles.testUser}>test@test.com - 123456</Text>
              <Text style={styles.testUser}>ahmet@gmail.com - ahmet123</Text>
              <Text style={styles.testUser}>ayse@hotmail.com - ayse2024</Text>
            </View>
          </View>

          <View style={styles.mid}>
            <InputLayout
              value={email}
              onChangeText={setEmail}
              placeholder="E-Posta ya da Telefon"
              rightIconName="email-outline"
              hasError={emailInputError}
              errorMessage={emailInputErrorMessage}
              onBlur={() => validateEmailPhone(email)}
            />
            <InputLayout
              value={password}
              onChangeText={setPassword}
              placeholder="Şifre"
              secureTextEntry={true}
              rightIconName="lock"
            />

            <View style={styles.buttonContainer}>
              <ButtonLayout
                onClick={onLogin}
                ButtonText={"Giriş Yap"}
                color1={"#09b2e5"}
              />
            </View>

            <Pressable
              onPress={onClickForget}
              style={styles.forgotPasswordButton}
            >
              <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
            </Pressable>
          </View>

          <View style={styles.bottom}>
            <Text style={styles.noAccountText}>Hesabınız yok mu?</Text>
            <View style={styles.buttonContainer}>
              <ButtonLayout
                ButtonText={"Üye Ol"}
                color1={"#fff"}
                onClick={onClickSignup}
              />
            </View>
          </View>
        </View>
        <CustomLoginErrorModal />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  top: {
    marginTop: 60,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  welcome: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  testUsers: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginTop: 10,
  },
  testTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  testUser: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  mid: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 10,
    alignItems: "center",
  },
  buttonContainer: {
    marginTop: 20,
    width: "90%",
  },
  forgotPasswordButton: {
    alignItems: "center",
    marginTop: 15,
  },
  forgotPasswordText: {
    color: "#09b2e5",
    fontSize: 14,
  },
  bottom: {
    marginBottom: 30,
    alignItems: "center",
  },
});

const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    minWidth: 80,
  },
  buttonClose: {
    backgroundColor: "#09b2e5",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 16,
    color: "#333",
  },
});

export default Login;
