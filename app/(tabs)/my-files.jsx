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

const MyFiles = () => {
    const { phoneNumber } = useGlobalContext();
    const [receivedFiles, setReceivedFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReceivedFiles = async () => {
        setLoading(true);
        try {
            const response = await fetch("https://flikapi.one.pl/api/received-files");
            if (!response.ok) throw new Error("Failed to fetch received files.");
            const data = await response.json();
            setReceivedFiles(data.sentFiles || []);
        } catch (error) {
            console.error("Fetch error:", error);
            Alert.alert("Error", "Failed to load received files.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReceivedFiles();
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

    const renderFileItem = ({ item }) => (
        <View style={styles.fileItem}>
            <Text style={styles.fileName}>{item.fileName}</Text>
            <Text style={styles.fileInfo}>Sender: {item.senderPhoneNumber}</Text>
            <Text style={styles.fileInfo}>Uploaded: {new Date(item.uploadedAt).toLocaleString()}</Text>
            <Text style={[styles.fileInfo, item.isEncrypted ? styles.encrypted : styles.notEncrypted]}>
                {item.isEncrypted ? "Encrypted" : "Not Encrypted"}
            </Text>

            <TouchableOpacity style={styles.downloadButton} onPress={() => downloadFile(item)}>
                <Text style={styles.buttonText}>Download</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Files</Text>

            <TouchableOpacity style={styles.refreshButton} onPress={fetchReceivedFiles}>
                <Text style={styles.buttonText}>Refresh</Text>
            </TouchableOpacity>

            {loading ? (
                <ActivityIndicator size="large" color="#007BFF" />
            ) : receivedFiles.length === 0 ? (
                <Text style={styles.noFiles}>No files received yet.</Text>
            ) : (
                <FlatList
                    data={receivedFiles}
                    keyExtractor={(item) => item.storageFileName}
                    renderItem={renderFileItem}
                />
            )}
        </View>
    );
}

export default MyFiles;


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
    buttonText: { color: "#fff", fontWeight: "bold" },
});
