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

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (isLoading) return;

    if (!name || !email || !password) {
      alert("Please enter all fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(API_BASE_URL + "/Auth/register", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: name,
          email: email,
          passwordHash: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Signup successful");
        navigation.navigate('Login');
      } else {
        alert(data?.message || 'Signup failed');
      }
    } catch (err) {
      alert('Signup failed');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#a6b7cfff" />
      <KeyboardAvoidingView style={styles.container}>
        <View style={styles.innerContainer}>
          {/* Form */}
          <View style={styles.formContainer}>
            <TextInput
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              style={[styles.input, isLoading && styles.disabledInput]}
              placeholderTextColor="#999"
              editable={!isLoading} // disable while loading
            />
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              style={[styles.input, isLoading && styles.disabledInput]}
              placeholderTextColor="#999"
              editable={!isLoading} // disable while loading
            />
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={[styles.input, isLoading && styles.disabledInput]}
              placeholderTextColor="#999"
              editable={!isLoading} // disable while loading
            />

            {/* Signup Button with Loader */}
            <TouchableOpacity
              style={[styles.signupButton, isLoading && styles.disabledButton]}
              onPress={handleSignup}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.signupButtonText}>Sign Up</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footerContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              disabled={isLoading} // disable while loading
              activeOpacity={isLoading ? 1 : 0.7}
            >
              <Text
                style={[
                  styles.loginText,
                  isLoading && { opacity: 0.5 }
                ]}
              >
                Already have an account?{' '}
                <Text
                  style={[
                    styles.loginLink,
                    isLoading && { opacity: 0.5 }
                  ]}
                >
                  Login
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#a6b7cfff' },
  innerContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    elevation: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 20,
  },
  disabledInput: {
    opacity: 0.6, // dimmed when disabled
  },
  signupButton: {
    backgroundColor: '#686f88ff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  disabledButton: { opacity: 0.7 },
  signupButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  footerContainer: { alignItems: 'center', marginTop: 32 },
  loginText: { color: '#fff', fontSize: 16, opacity: 0.9 },
  loginLink: {
    color: '#686f88ff',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
