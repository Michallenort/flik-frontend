import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import {useGlobalContext} from "../context/GlobalProvider";

export default function LoginScreen() {
    const [phone, setPhone] = useState('');
    const router = useRouter();
    const {setPhoneNumber} = useGlobalContext();

    const sendOtp = async () => {
        if (!phone) {
            Alert.alert('Error', 'Please enter your phone number.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('phone', phone);

            const response = await fetch('https://flikapi.one.pl/send_otp', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                Alert.alert('Success', 'OTP has been sent.');
                setPhoneNumber(phone);
                router.push('/verify');
            } else {
                Alert.alert('Error', 'Failed to send OTP. Please try again.');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'There was a problem with the connection.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Logowanie OTP</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
            />
            <TouchableOpacity style={styles.button} onPress={sendOtp}>
                <Text style={styles.buttonText}>Send OTP</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    input: { width: '100%', padding: 10, borderWidth: 1, borderRadius: 5, marginBottom: 20 },
    button: { backgroundColor: '#007BFF', padding: 10, borderRadius: 5 },
    buttonText: { color: '#fff', fontWeight: 'bold' },
});
