import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // <-- Import LinearGradient
import { API_BASE_URL } from '../config';
import styles from '../styleSheets/SignupScreenStyles'; // Import styles from the stylesheet

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (isLoading)
      return

    if (!name || !email || !password) {
      Alert.alert("Error", "Please enter all fields");
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch(API_BASE_URL + "/Auth/register", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: name,
          email: email,
          passwordHash: password,
        })
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Signup successful! Please log in.");
        navigation.navigate('Login');
      } else {
        console.error("Signup error:", data);
        Alert.alert("Signup Failed", "An account with this email may already exist.");
      }
    } catch (err) {
      console.error("Signup error: ", err);
      Alert.alert("Signup Failed", "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#adbfd8ff', '#384150ff']}
      style={localStyles.gradientContainer}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <StatusBar barStyle="light-content" backgroundColor="#a6b7cfff" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.innerContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Notes</Text>
            <Text style={styles.subtitle}>Create your account 📝</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                style={styles.input}
                placeholderTextColor="#999"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                placeholderTextColor="#999"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                placeholderTextColor="#999"
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              style={[styles.signupButton, isLoading && { opacity: 0.8 }]}
              onPress={handleSignup}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
              ) : (
                  <Text style={styles.signupButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footerContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={isLoading} activeOpacity={isLoading ? 1 : 0.7}>
              <Text style={[styles.loginText, isLoading && { opacity: 0.5 }]}>
                Already have an account?{' '}
                <Text style={[styles.loginLink, isLoading && { opacity: 0.5 }]}>Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

// NEW local styles for the gradient container
const localStyles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
});