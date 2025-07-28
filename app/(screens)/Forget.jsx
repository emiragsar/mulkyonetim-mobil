import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Keyboard,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import ButtonLayout from '../input/ButtonLayout';
import InputLayout from '../input/InputLayout';



const Forget = () => {
    const router = useRouter();

    const [email, setEmail] = useState('')


    const handleSendRequest = () => {
        Keyboard.dismiss();
        console.log("Şifre yenileme isteği gönderiliyor:", email);

    };

    return (

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>

                    <View style={styles.imagePlaceholder}><Text>Logo</Text></View>

                    <Text style={styles.title}>Şifre Yenileme</Text>

                    <InputLayout
                        value={email}
                        onChangeText={setEmail}
                        placeholder="E-Posta ya da Telefon"
                        secureTextEntry={false}
                        rightIconName="email-outline"
                    />
                    <View style={styles.buttonContainer}>
                        <ButtonLayout onClick={handleSendRequest} ButtonText={'Gönder'} color1={'#09b2e5'} />
                    </View>

                    <Pressable onPress={() => { router.push("/Login") }} style={styles.loginButton}>
                        <Text style={styles.loginButtonText}>Giriş Yap</Text>
                    </Pressable>

                </View>
            </SafeAreaView>
        </TouchableWithoutFeedback>
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
        justifyContent: 'center',
        paddingBottom: 20,
    },
    imagePlaceholder: {
        width: 100,
        height: 100,
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
        marginBottom: 30,
    },
    title: {

        fontWeight: 'bold',
        fontSize: 20,
        marginBottom: 30,
    },
    buttonContainer: {
        width: '90%',
        marginTop: 20,
    },
    loginButton: {
        marginTop: '5%',
    },
    loginButtonText: {
        color: '#09b2e5',
        textDecorationLine: 'underline',
        fontSize: 14,
    }

});

export default Forget;
