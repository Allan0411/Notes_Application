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
    Alert, 
} from 'react-native';
import { API_BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styleSheets/LoginScreenStyles';
import { getUserByEmail } from '../services/userService';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

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

        setLoading(true);

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
                
                const user = await getUserByEmail(email);
                if (user) {
                    storeUserId(user.id);
                    console.log("userId:", user.id);
                }
                
                // === UPDATED CODE HERE ===
                // Instead of showing an alert, we navigate and pass a parameter.
                navigation.navigate('Home', { showLoginSuccess: true });
                // ==========================

            } else {
                console.error("Login error:", data);
                alert('Login failed');
            }
        } catch (err) {
            console.error("Login error: ", err);
            alert('Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor='#a6b7cfff' />
            <KeyboardAvoidingView style={styles.container}>
                <View style={styles.innerContainer}>
                    <View style={styles.headerContainer}>
                        <Text style={styles.title}>Notes</Text>
                        <Text style={styles.subtitle}>Welcome back!</Text>
                    </View>
                    <View style={[styles.formContainer, {marginBottom: 20}]}>
                        <View style={styles.inputContainer}>
                            <TextInput
                                placeholder="Email"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                style={[styles.input, loading && styles.disabledInput]}
                                placeholderTextColor="#999"
                                editable={!loading}
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <TextInput
                                placeholder="Password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                style={[styles.input, loading && styles.disabledInput]}
                                placeholderTextColor="#999"
                                editable={!loading}
                            />
                        </View>
                        <TouchableOpacity
                            style={[styles.loginButton, loading && { opacity: 0.8 }]}
                            onPress={handleLogin}
                            activeOpacity={0.8}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.loginButtonText}>Login</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                    <View style={styles.footerContainer}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('ForgotPassword')}
                            disabled={loading}
                            activeOpacity={loading ? 1 : 0.7}
                        >
                            <Text style={[styles.signupText, loading && { opacity: 0.5 }]}>
                                Forgot password?{' '}
                                <Text style={[styles.signupLink, loading && { opacity: 0.5 }]}>
                                    Click here
                                </Text>
                            </Text>
                        </TouchableOpacity>
                        <View style={{ height: 10 }} />
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Signup')}
                            disabled={loading}
                            activeOpacity={loading ? 1 : 0.7}
                        >
                            <Text style={[styles.signupText, loading && { opacity: 0.5 }]}>
                                Don't have an account?{' '}
                                <Text style={[styles.signupLink, loading && { opacity: 0.5 }]}>
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