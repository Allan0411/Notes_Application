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
    Alert,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from '../config';
import styles from '../styleSheets/ForgotPasswordScreenStyles';

/*
    WHY THE ERROR?
    The error "Request reset error:  [SyntaxError: JSON Parse error: Unexpected character: V]" occurs because
    the code tries to parse the response as JSON (response.json()), but the server actually returns a plain text response
    (e.g., "Verification code sent to your email") instead of a JSON object. The first character 'V' is not valid JSON.

    To fix this, check the response's content-type header. If it's JSON, parse as JSON; otherwise, parse as text and
    handle accordingly.
*/

export default function ForgotPasswordScreen({ navigation }) {
    const [step, setStep] = useState(1); // 1: request code, 2: enter code & new password
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Step 1: Request verification code
    const handleRequestReset = async () => {
        if (!email) {
            setMessage('Please enter your email address.');
            return;
        }

        setLoading(true);
        setMessage('');
        try {
            const response = await fetch(API_BASE_URL + "/Auth/request-reset", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email // as per instruction
                }),
            });

            // Check content-type to decide how to parse
            const contentType = response.headers.get('content-type');
            let data;
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                // fallback: treat as text and wrap in object
                const text = await response.text();
                data = { message: text, status: response.ok ? "success" : "error" };
            }

            if (response.ok && data.status === "success") {
                setMessage('Verification code sent to your email');
                setStep(2);
            } else {
                setMessage(data.message || 'Failed to send verification code. Please try again.');
            }
        } catch (err) {
            console.error("Request reset error: ", err);
            setMessage('An error occurred. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Submit verification code and new password
    

    const handleResetPassword = async () => {
        console.log("hi");
        if (!verificationCode || !newPassword) {
            setMessage('Please enter the verification code and your new password.');
            return;
        }

        setLoading(true);
        setMessage('');
        try {
            // The API expects { code, newPassword }
            const response = await fetch(API_BASE_URL + "/Auth/verify-reset", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: verificationCode,
                    newPassword: newPassword,
                }),
            });

            // The API responds with plain text: "Password has been reset successfully"
            const text = await response.text();
            console.log(text, response);
            if (response.ok && text && text.toLowerCase().includes("password has been reset successfully")) {
                setMessage('Password has been reset successfully.');
                setTimeout(() => {
                    navigation.goBack();
                }, 1500);
            } else {
                setMessage(text || 'Failed to reset password. Please check your code and try again.');
            }
        } catch (err) {
            console.error("Reset password error: ", err);
            setMessage('An error occurred. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={['#adbfd8ff', '#384150ff']}
            style={localStyles.gradientContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
        >
            <StatusBar barStyle="light-content" backgroundColor='transparent' translucent />
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>Forgot Password?</Text>
                    {step === 1 ? (
                        <Text style={styles.subtitle}>
                            Enter your email to receive a 6-digit verification code.
                        </Text>
                    ) : (
                        <Text style={styles.subtitle}>
                            Enter the 6-digit verification code sent to your email and set a new password.
                        </Text>
                    )}
                </View>

                <View style={styles.formContainer}>
                    {step === 1 && (
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
                    )}

                    {step === 2 && (
                        <>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    placeholder="Verification Code"
                                    value={verificationCode}
                                    onChangeText={setVerificationCode}
                                    keyboardType="numeric"
                                    maxLength={6}
                                    style={[
                                        styles.input,
                                        loading && styles.disabledInput
                                    ]}
                                    placeholderTextColor="#999"
                                    editable={!loading}
                                />
                            </View>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    secureTextEntry={!showPassword}
                                    style={[
                                        styles.input,
                                        loading && styles.disabledInput
                                    ]}
                                    placeholderTextColor="#999"
                                    editable={!loading}
                                />
                                <TouchableOpacity
                                    style={localStyles.showPasswordToggle}
                                    onPress={() => setShowPassword((prev) => !prev)}
                                    disabled={loading}
                                >
                                    <Text style={localStyles.showPasswordText}>
                                        {showPassword ? "Hide" : "Show"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    {message ? <Text style={styles.messageText}>{message}</Text> : null}

                    <TouchableOpacity
                        style={[styles.loginButton, loading && { opacity: 0.8 }]}
                        onPress={step === 1 ? handleRequestReset : handleResetPassword}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.loginButtonText}>
                                {step === 1 ? "Send Verification Code" : "Reset Password"}
                            </Text>
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
        </LinearGradient>
    );
}

const localStyles = StyleSheet.create({
    gradientContainer: {
        flex: 1,
    },
    showPasswordToggle: {
        position: 'absolute',
        right: 10,
        top: 12,
        padding: 4,
    },
    showPasswordText: {
        color: '#384150',
        fontWeight: 'bold',
        fontSize: 13,
    },
});