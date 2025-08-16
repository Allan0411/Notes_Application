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
} from 'react-native';
import { API_BASE_URL } from '../config';
import styles from '../styleSheets/SignupScreenStyles'; // Import styles from the stylesheet

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading,setIsLoading]=useState(false);

  const handleSignup = async () => {

    if(isLoading)
        return
    if (!name || !email || !password) {
      alert("Please enter all fields");
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
        alert("Signup successful");
        navigation.navigate('Login');
      } else {
        console.error("Signup error:", data);
        alert('Signup failed');
      }
    } catch (err) {
      console.error("Signup error: ", err);
      alert('Signup failed');
    }
    finally {
      setIsLoading(false); // <-- 3. STOP loading indicator in all cases
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#a6b7cfff" />
      <KeyboardAvoidingView
        style={styles.container}
        // behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.innerContainer}>
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Notes</Text>
            <Text style={styles.subtitle}>Create your account 📝</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                style={styles.input}
                placeholderTextColor="#999"
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
              />
            </View>

            <TouchableOpacity
              style={styles.signupButton}
              onPress={handleSignup}
              activeOpacity={0.8}
            >
              <Text style={styles.signupButtonText}>Create Account</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Section */}
          <View style={styles.footerContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginText}>
                Already have an account?{' '}
                <Text style={styles.loginLink}>Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

