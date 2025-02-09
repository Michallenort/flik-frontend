import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Switch,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useGlobalContext } from "../../context/GlobalProvider";

const AddFile = () => {
    const [recipient, setRecipient] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [isEncrypted, setIsEncrypted] = useState(false);
    const [encryptionPassword, setEncryptionPassword] = useState("");
    const { phoneNumber } = useGlobalContext();

    const pickFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "*/*",
                copyToCacheDirectory: true,
            });

            if (result.canceled) {
                Alert.alert("File selection cancelled.");
                return;
            }

            setSelectedFile(result.assets[0]);
        } catch (error) {
            console.error("File picking error:", error);
            Alert.alert("Error", "Failed to select file. Please try again.");
        }
    };

    const uploadFile = async () => {
        if (!recipient) {
            Alert.alert("Error", "Please enter recipient's phone number.");
            return;
        }

        if (!selectedFile) {
            Alert.alert("Error", "Please select a file to upload.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("file", {
                uri: selectedFile.uri,
                name: selectedFile.name,
                type: selectedFile.mimeType || "application/octet-stream",
            });
            formData.append("recipient", recipient);

            if (isEncrypted && encryptionPassword) {
                formData.append("encryptionPassword", encryptionPassword);
            }

            const response = await fetch("https://flikapi.one.pl/api/files/upload", {
                method: "POST",
                body: formData,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (!response.ok) {
                throw new Error("File upload failed.");
            }

            const result = await response.json();
            const fileGuid = result.fileGuid;

            Alert.alert("Success", "File uploaded successfully.");

            // if (isEncrypted && encryptionPassword) {
            //     await encryptFile(fileGuid);
            // }
        } catch (error) {
            console.error("Upload error:", error);
            Alert.alert("Error", "File upload failed. Please try again.");
        }
    };

    const encryptFile = async (fileGuid) => {
        try {
            const response = await fetch(
                `https://flikapi.one.pl/api/files/${fileGuid}/encrypt?password=${encryptionPassword}`,
                { method: "POST" }
            );

            if (!response.ok) {
                throw new Error("File encryption failed.");
            }

            Alert.alert("Success", "File encrypted successfully.");
        } catch (error) {
            console.error("Encryption error:", error);
            Alert.alert("Error", "File encryption failed. Please try again.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Upload File</Text>

            <TextInput
                style={styles.input}
                placeholder="Enter recipient's phone number"
                keyboardType="phone-pad"
                value={recipient}
                onChangeText={setRecipient}
            />

            <TouchableOpacity style={styles.button} onPress={pickFile}>
                <Text style={styles.buttonText}>
                    {selectedFile ? `Selected: ${selectedFile.name}` : "Choose File"}
                </Text>
            </TouchableOpacity>

            <View style={styles.switchContainer}>
                <Text>Encrypt File?</Text>
                <Switch value={isEncrypted} onValueChange={setIsEncrypted} />
            </View>

            {isEncrypted && (
                <TextInput
                    style={styles.input}
                    placeholder="Enter encryption password"
                    secureTextEntry
                    value={encryptionPassword}
                    onChangeText={setEncryptionPassword}
                />
            )}

            <TouchableOpacity style={styles.uploadButton} onPress={uploadFile}>
                <Text style={styles.buttonText}>Upload File</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
    input: {
        width: "100%",
        padding: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        marginBottom: 15,
        backgroundColor: "#fff",
    },
    button: {
        backgroundColor: "#007BFF",
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
        marginBottom: 15,
        width: "100%",
    },
    buttonText: { color: "#fff", fontWeight: "bold" },
    switchContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        marginBottom: 10,
    },
    uploadButton: {
        backgroundColor: "#28a745",
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
        width: "100%",
    },
});

export default AddFile;
