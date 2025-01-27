import { Link, useRouter, Redirect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, {useEffect} from "react";
import { StyleSheet, Text, View } from "react-native";

export default function App() {
    //const router = useRouter();

    // useEffect(() => {
    //     router.replace("/login")
    // }, []);

    return <Redirect href="/login" />;
}
