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
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // <-- Re-import the LinearGradient component
import { API_BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styleSheets/LoginScreenStyles';
import { getUserByEmail } from '../services/userService';
import LoginSuccessOverlay from '../utils/LoginSuccessOverlay'; // Adjust path as needed
import { lightColors, darkColors } from '../utils/themeColors'; // Adjust path as needed

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

    // ADD COLORS (or get from your theme context if you have one)
    const colors = lightColors; // or use your theme system

    const storeUserId = async (id) => {
        try {
            await AsyncStorage.setItem('userId', id.toString());
        } catch (e) {
            console.error('Failed to save userId', e);
        }
    };
    const handleSuccessOverlayDismiss = () => {
        setShowSuccessOverlay(false);
        navigation.navigate('Home', { showLoginSuccess: true });
    };
    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please enter both email and password");
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
                
                setShowSuccessOverlay(true);

            } else {
                console.error("Login error:", data);
                Alert.alert("Login Failed", "Invalid email or password.");
            }
        } catch (err) {
            console.error("Login error: ", err);
            Alert.alert("Login Failed", "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={['#adbfd8ff', '#384150ff']} // The two colors for the gradient
            style={localStyles.gradientBackground}
            start={{ x: 0, y: 0 }} // Starts at the top
            end={{ x: 0, y: 1 }} // Ends at the bottom
        >
            <StatusBar barStyle="light-content" backgroundColor='transparent' translucent />
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                style={styles.innerContainer}
            >
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
            </KeyboardAvoidingView>
            <LoginSuccessOverlay
                isVisible={showSuccessOverlay}
                onDismiss={handleSuccessOverlayDismiss}
                colors={colors}
            />
        </LinearGradient>
    );
}

const localStyles = StyleSheet.create({
    gradientBackground: {
        flex: 1,
    },
});