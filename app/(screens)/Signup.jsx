import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Checkbox } from 'react-native-paper';
import ButtonLayout from '../input/ButtonLayout';
import InputLayout from '../input/InputLayout';


const Signup = () => {
    const router = useRouter();

    const [phone, setPhone] = useState('')
    const [isChecked, setIsChecked] = useState(false);
    const [isChecked1, setIsChecked1] = useState(false);

    const onClickLogin = () => {
        router.push("/Login")
    }

    const handleContinue = () => {
        if (phone.length < 10) {
            Alert.alert("Hata", "Lütfen geçerli bir telefon numarası girin (en az 10 hane).");
            return;
        }

        if (!isChecked || !isChecked1) {
            Alert.alert("Hata", "Lütfen tüm sözleşmeleri ve metinleri onaylayın.");
            return;
        }

        console.log("Telefon Numarası:", phone);
        console.log("Kullanıcı Sözleşmesi Onayı:", isChecked);
        console.log("KVKK Metni Onayı:", isChecked1);

        Alert.alert("Başarılı", "Devam etme işlemi başlatıldı!");
    };

    const isContinueButtonEnabled = isChecked && isChecked1;
    const continueButtonColor = isContinueButtonEnabled ? '#09b2e5' : '#a0a0a0';

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.top}>
                    <Text style={styles.titleText}>Üye Ol</Text>
                    <Text style={styles.welcomeText}>Hesap oluşturmak için lütfen cep telefonu numaranızı girin.</Text>
                </View>

                <View style={styles.mid}>
                    <InputLayout
                        value={phone}
                        onChangeText={setPhone}
                        placeholder='Cep Telefonu'
                        keyboardType="number-pad"
                        maxLength={11}
                        rightIconName="phone"
                    />


                    <View style={styles.checkboxContainer}>
                        <Checkbox
                            status={isChecked ? 'checked' : 'unchecked'}
                            onPress={() => setIsChecked(!isChecked)}
                            color="blue"
                            uncheckedColor="black" //
                        />
                        <Pressable onPress={() => setIsChecked(!isChecked)} style={styles.checkboxTextPressable}>
                            <Text style={styles.checkboxText}>Kullanıcı sözleşmesini okudum ve kabul ediyorum.</Text>
                        </Pressable>
                    </View>


                    <View style={styles.checkboxContainer}>
                        <Checkbox
                            status={isChecked1 ? 'checked' : 'unchecked'}
                            onPress={() => setIsChecked1(!isChecked1)}
                            color="blue"
                            uncheckedColor="black"
                        />
                        <Pressable onPress={() => setIsChecked1(!isChecked1)} style={styles.checkboxTextPressable}>
                            <Text style={styles.checkboxText}>KVKK aydınlatma metnini okudum.</Text>
                        </Pressable>
                    </View>

                    <View style={styles.buttonContainer}>
                        <ButtonLayout
                            onClick={handleContinue}
                            ButtonText='Devam Et'
                            color1={continueButtonColor}
                            disabled={!isContinueButtonEnabled}
                        />
                    </View>
                </View>

                <View style={styles.bottom}>
                    <Text style={styles.noAccountText}>Hesabınız var mı?</Text>
                    <View style={styles.buttonContainer}>
                        <ButtonLayout onClick={onClickLogin} ButtonText='Giriş Yap' />
                    </View>
                </View>
            </View>
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
    },
    top: {
        flex: 1.2,
        justifyContent: 'flex-end',
        alignItems: 'center',
        width: '100%',
        paddingBottom: '5%',
    },
    titleText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    welcomeText: {
        textAlign: 'center',
        opacity: 0.7,
        paddingHorizontal: 20,
    },
    mid: {
        flex: 3,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingVertical: 10,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '90%',
        marginBottom: 10,

    },
    checkboxTextPressable: {
        flex: 1,
        paddingVertical: 5,
        paddingLeft: 5,
    },
    checkboxText: {
        fontSize: 14,
        color: 'blue',
        borderBottomWidth: 1,
        borderBottomColor: 'blue',
        flexShrink: 1,
    },
    buttonContainer: {
        width: '90%',
        marginTop: 20,
    },
    bottom: {
        flex: 1,
        width: '100%',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: '8%',
    },

})

export default Signup;
