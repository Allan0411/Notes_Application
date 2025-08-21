import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    StatusBar,
} from 'react-native';
import { API_BASE_URL } from '../config';
import styles from '../styleSheets/ForgotPasswordScreenStyles'; // Assuming a new stylesheet

export default function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleForgotPassword = async () => {
        if (!email) {
            setMessage('Please enter your email address.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(API_BASE_URL + "/Auth/forgot-password", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || 'A password reset link has been sent to your email.');
            } else {
                setMessage(data.message || 'Failed to send password reset link. Please try again.');
            }
        } catch (err) {
            console.error("Forgot password error: ", err);
            setMessage('An error occurred. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor='#a6b7cfff' />
            <KeyboardAvoidingView style={styles.container}>
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>Forgot Password?</Text>
                    <Text style={styles.subtitle}>Enter your email to receive a password reset link.</Text>
                </View>

                <View style={styles.formContainer}>
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
                            editable={!loading}
                        />
                    </View>

                    {message ? <Text style={styles.messageText}>{message}</Text> : null}

                    <TouchableOpacity
                        style={[styles.loginButton, loading && { opacity: 0.8 }]}
                        onPress={handleForgotPassword}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.loginButtonText}>Send Reset Link</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.footerContainer}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        disabled={loading}
                        activeOpacity={loading ? 1 : 0.7}
                    >
                        <Text
                            style={[
                                styles.signupText,
                                loading && { opacity: 0.5 }
                            ]}
                        >
                            <Text
                                style={[
                                    styles.signupLink,
                                    loading && { opacity: 0.5 }
                                ]}
                            >
                                Go back to Login
                            </Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </>
    );
}

