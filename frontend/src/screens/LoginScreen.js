import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { API_BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styleSheets/LoginScreenStyles'; // Import styles from the stylesheet
import { getUserByEmail } from '../services/userService';


export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false); // loader state

    const storeUserId = async (id) => {
  try {
    await AsyncStorage.setItem('userId', id.toString());
  } catch (e) {
    console.error('Failed to save userId', e);
  }
};
    const handleLogin = async () => {
        if (!email || !password) {
            alert("Please enter both email and password");
            return;
        }

        setLoading(true); // show loader

        try {
            const response = await fetch(API_BASE_URL + "/Auth/login", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                await AsyncStorage.setItem('authToken', data.token);
                console.log("Token:", data.token);
                alert("Login successful");
                const user=await getUserByEmail(email);
                storeUserId(user.id);
                console.log("userId:", user.id);
                navigation.navigate('Home');
            } else {
                console.error("Login error:", data);
                alert('Login failed');
            }
        } catch (err) {
            console.error("Login error: ", err);
            alert('Login failed');
        } finally {
            setLoading(false); // hide loader after API call finishes
        }
    };

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor='#a6b7cfff' />
            <KeyboardAvoidingView style={styles.container}>
                <View style={styles.innerContainer}>
                    {/* Header Section */}
                    <View style={styles.headerContainer}>
                        <Text style={styles.title}>Notes</Text>
                        <Text style={styles.subtitle}>Welcome back!</Text>
                    </View>

                    {/* Form Section */}
                    <View style={[styles.formContainer, {marginBottom: 20}]}>
                        <View style={styles.inputContainer}>
                            <TextInput
                                placeholder="Email"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                style={[
                                    styles.input,
                                    loading && styles.disabledInput
                                ]}
                                placeholderTextColor="#999"
                                editable={!loading} // disable while loading
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <TextInput
                                placeholder="Password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                style={[
                                    styles.input,
                                    loading && styles.disabledInput
                                ]}
                                placeholderTextColor="#999"
                                editable={!loading} // disable while loading
                            />
                        </View>
                        
                        <TouchableOpacity
                            style={[styles.loginButton, loading && { opacity: 0.8 }]}
                            onPress={handleLogin}
                            activeOpacity={0.8}
                            disabled={loading} // disable button while loading
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.loginButtonText}>Login</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Footer Section */}
                    <View style={styles.footerContainer}>
                        {/* ======================================= */}
                        {/* NEW: Forgot Password Link now in the footer with new text and a space */}
                        {/* ======================================= */}
                        <TouchableOpacity
                            onPress={() => navigation.navigate('ForgotPassword')}
                            disabled={loading}
                            activeOpacity={loading ? 1 : 0.7}
                        >
                            <Text
                                style={[
                                    styles.signupText,
                                    loading && { opacity: 0.5 }
                                ]}
                            >
                                Forgot password?{' '}
                                <Text
                                    style={[
                                        styles.signupLink,
                                        loading && { opacity: 0.5 }
                                    ]}
                                >
                                    Click here
                                </Text>
                            </Text>
                        </TouchableOpacity>
                        
                        <View style={{ height: 10 }} />

                        <TouchableOpacity
                            onPress={() => navigation.navigate('Signup')}
                            disabled={loading} // disable while loading
                            activeOpacity={loading ? 1 : 0.7} // no click feedback if disabled
                        >
                            <Text
                                style={[
                                    styles.signupText,
                                    loading && { opacity: 0.5 }
                                ]}
                            >
                                Don't have an account?{' '}
                                <Text
                                    style={[
                                        styles.signupLink,
                                        loading && { opacity: 0.5 }
                                    ]}
                                >
                                    Sign Up
                                </Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </>
    );
}
