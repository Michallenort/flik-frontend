import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    StyleSheet,
    Alert,
    TouchableOpacity,
} from "react-native";
import { useGlobalContext } from "../../context/GlobalProvider";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

const SentFiles = () => {
    const { phoneNumber } = useGlobalContext();
    const [sentFiles, setSentFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSentFiles = async () => {
        setLoading(true);
        try {
            const response = await fetch("https://flikapi.one.pl/api/sent-files");
            if (!response.ok) throw new Error("Failed to fetch sent files.");
            const data = await response.json();
            setSentFiles(data.sentFiles || []);
        } catch (error) {
            console.error("Fetch error:", error);
            Alert.alert("Error", "Failed to load sent files.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSentFiles();
    }, []);

    const downloadFile = async (file) => {
        let password = "";

        if (file.isEncrypted) {
            password = await new Promise((resolve) => {
                Alert.prompt(
                    "Enter password",
                    "This file is encrypted. Please enter the password to download it.",
                    [
                        { text: "Cancel", style: "cancel", onPress: () => resolve(null) },
                        { text: "OK", onPress: (pwd) => resolve(pwd) },
                    ],
                    "secure-text"
                );
            });

            if (!password) return;
        }

        try {
            const fileUrl = `https://flikapi.one.pl/api/files/${file.storageFileName}${
                file.isEncrypted ? `?password=${encodeURIComponent(password)}` : ""
            }`;

            const testResponse = await fetch(fileUrl, { method: "GET" });

            if (testResponse.status === 401) {
                Alert.alert("Error", "Incorrect password. Please try again.");
                return;
            } else if (!testResponse.ok) {
                throw new Error("File download failed.");
            }

            const fileUri = FileSystem.documentDirectory + file.fileName;
            const { uri } = await FileSystem.downloadAsync(fileUrl, fileUri);

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri);
            } else {
                Alert.alert("Success", "File downloaded but cannot be shared.");
            }
        } catch (error) {
            console.error("Download error:", error);
            Alert.alert("Error", "Failed to download file.");
        }
    };

    const encryptFile = async (file) => {
        const password = await new Promise((resolve) => {
            Alert.prompt(
                "Set Encryption Password",
                "Enter a password to encrypt this file.",
                [
                    { text: "Cancel", style: "cancel", onPress: () => resolve(null) },
                    { text: "OK", onPress: (pwd) => resolve(pwd) },
                ],
                "secure-text"
            );
        });

        if (!password) return;

        try {
            const response = await fetch(
                `https://flikapi.one.pl/api/files/${file.storageFileName}/encrypt?password=${encodeURIComponent(password)}`,
                { method: "POST" }
            );

            if (!response.ok) throw new Error("File encryption failed.");

            Alert.alert("Success", "File encrypted successfully.");
            fetchSentFiles();
        } catch (error) {
            console.error("Encryption error:", error);
            Alert.alert("Error", "File encryption failed.");
        }
    };

    const decryptFile = async (file) => {
        const password = await new Promise((resolve) => {
            Alert.prompt(
                "Enter Decryption Password",
                "Enter the password to decrypt this file.",
                [
                    { text: "Cancel", style: "cancel", onPress: () => resolve(null) },
                    { text: "OK", onPress: (pwd) => resolve(pwd) },
                ],
                "secure-text"
            );
        });

        if (!password) return;

        try {
            const response = await fetch(
                `https://flikapi.one.pl/api/files/${file.storageFileName}/remove-encryption?password=${encodeURIComponent(password)}`,
                { method: "POST" }
            );

            if (response.status === 401) {
                Alert.alert("Error", "Incorrect password. Try again.");
                return;
            } else if (!response.ok) {
                throw new Error("File decryption failed.");
            }

            Alert.alert("Success", "File decrypted successfully.");
            fetchSentFiles();
        } catch (error) {
            console.error("Decryption error:", error);
            Alert.alert("Error", "File decryption failed.");
        }
    };

    const deleteFile = async (fileGuid) => {
        Alert.alert(
            "Delete file",
            "Are you sure you want to delete this file?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const response = await fetch(`https://flikapi.one.pl/api/files/${fileGuid}`, {
                                method: "DELETE",
                            });

                            if (!response.ok) {
                                throw new Error("Failed to delete file.");
                            }

                            setSentFiles((prevFiles) => prevFiles.filter((file) => file.storageFileName !== fileGuid));
                            Alert.alert("Success", "File deleted successfully.");
                        } catch (error) {
                            console.error("Delete error:", error);
                            Alert.alert("Error", "Failed to delete file.");
                        }
                    },
                },
            ]
        );
    };

    const renderFileItem = ({ item }) => (
        <View style={styles.fileItem}>
            <Text style={styles.fileName}>{item.fileName}</Text>
            <Text style={styles.fileInfo}>Recipient: {item.recipientPhoneNumber}</Text>
            <Text style={styles.fileInfo}>Uploaded: {new Date(item.uploadedAt).toLocaleString()}</Text>
            <Text style={[styles.fileInfo, item.isEncrypted ? styles.encrypted : styles.notEncrypted]}>
                {item.isEncrypted ? "Encrypted" : "Not Encrypted"}
            </Text>

            <TouchableOpacity style={styles.downloadButton} onPress={() => downloadFile(item)}>
                <Text style={styles.buttonText}>Download</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.encryptButton} onPress={() => (item.isEncrypted ? decryptFile(item) : encryptFile(item))}>
                <Text style={styles.buttonText}>{item.isEncrypted ? "Decrypt" : "Encrypt"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} onPress={() => deleteFile(item.storageFileName)}>
                <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sent Files</Text>

            <TouchableOpacity style={styles.refreshButton} onPress={fetchSentFiles}>
                <Text style={styles.buttonText}>Refresh</Text>
            </TouchableOpacity>

            {loading ? (
                <ActivityIndicator size="large" color="#007BFF" />
            ) : sentFiles.length === 0 ? (
                <Text style={styles.noFiles}>No files sent yet.</Text>
            ) : (
                <FlatList
                    data={sentFiles}
                    keyExtractor={(item) => item.storageFileName}
                    renderItem={renderFileItem}
                />
            )}
        </View>
    );
}

export default SentFiles;

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
    fileItem: {
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    fileName: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
    fileInfo: { fontSize: 14, color: "#555" },
    encrypted: { color: "red" },
    notEncrypted: { color: "green" },
    noFiles: { textAlign: "center", fontSize: 16, color: "#888", marginTop: 20 },
    refreshButton: {
        backgroundColor: "#FFA500",
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
        alignItems: "center",
    },
    downloadButton: {
        backgroundColor: "#007BFF",
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
        alignItems: "center",
    },
    deleteButton: {
        backgroundColor: "#FF3B30",
        padding: 10,
        borderRadius: 5,
        marginTop: 5,
        alignItems: "center",
    },
    encryptButton: { backgroundColor: "#28a745", padding: 10, borderRadius: 5, marginTop: 5, alignItems: "center" },
    buttonText: { color: "#fff", fontWeight: "bold" },
});
