import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import {useGlobalContext} from "../context/GlobalProvider";

const VerifyScreen = () => {
    const [otp, setOtp] = useState('');
    const router = useRouter();
    const {phoneNumber, setSessionId, setIsLogged } = useGlobalContext();

    const verifyOtp = async () => {
        if (!otp) {
            Alert.alert('Error', 'Please enter OTP code.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('phone', phoneNumber);
            formData.append('otp', otp);

            const response = await fetch('https://flikapi.one.pl/verify_otp', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setSessionId(data.session_id);
                setIsLogged(true);
                Alert.alert('Success', 'OTP was verified successfully.');
                router.push('/my-files');
            } else {
                Alert.alert('Error', 'Invalid OTP. Try again.');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'There was a problem with the connection.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>OTP Verification</Text>
            <Text style={styles.subtitle}>Phone Number: {phoneNumber}</Text>

            <TextInput
                style={styles.input}
                placeholder="Enter your OTP"
                keyboardType="number-pad"
                value={otp}
                onChangeText={setOtp}
            />

            <TouchableOpacity style={styles.button} onPress={verifyOtp}>
                <Text style={styles.buttonText}>Submit OTP</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => router.replace('/login')}
            >
                <Text style={styles.buttonText}>Return</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 16,
        color: '#555',
        marginBottom: 16,
    },
    input: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 20,
        backgroundColor: '#fff',
    },
    button: {
        backgroundColor: '#28a745',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginBottom: 10,
    },
    secondaryButton: {
        backgroundColor: '#007BFF',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default VerifyScreen;
