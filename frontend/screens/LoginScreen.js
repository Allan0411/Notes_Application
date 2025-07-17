import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
<<<<<<< HEAD
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';

import { useNavigation } from '@react-navigation/native'; // 🧭 Add navigation hook
import { API_BASE_URL } from '../config';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation(); // 🧭

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password }),
      });

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch (err) {
        console.error('JSON parse error:', err);
        Alert.alert('Server Error', 'Unexpected response from server');
        return;
      }

      if (!response.ok) {
        console.log('Login failed:', data);
        Alert.alert('Login Failed', JSON.stringify(data));
        return;
      }

      console.log('Login success:', data);
      Alert.alert('Login Successful!', `Token: ${data.token}`);

      // 🧭 TODO: Navigate to Home or store token
    } catch (error) {
      console.error('Fetch error during login:', error);
      Alert.alert('Error', 'Something went wrong while logging in');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        placeholder="Email"
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
        value={email}
=======
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Welcome to NotesApp </Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
        placeholderTextColor="#888"
>>>>>>> 7d907b1 (Updated login and signup screens with modern UI)
      />

      <TextInput
        placeholder="Password"
<<<<<<< HEAD
        style={styles.input}
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />

      <Button title="Login" onPress={handleLogin} />

      <TouchableOpacity
        onPress={() => navigation.navigate('Register')}
        style={styles.registerLink}
      >
        <Text style={styles.registerText}>
          Don't have an account? <Text style={{ color: 'blue' }}>Register</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;
=======
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        placeholderTextColor="#888"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.replace('Home')}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.link}>
          Don't have an account? <Text style={styles.linkBold}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
>>>>>>> 7d907b1 (Updated login and signup screens with modern UI)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
<<<<<<< HEAD
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
  },
  registerLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    color: '#444',
=======
    padding: 24,
    backgroundColor: '#b2b8c2ff', // Very light gray/blue background
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 15,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    color: '#333',
  },
  button: {
    backgroundColor: '#4e4ea1ff', // Soft gray tone for button
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  link: {
    marginTop: 20,
    color: '#555',
    textAlign: 'center',
  },
  linkBold: {
    color: '#58509eff',
    fontWeight: 'bold',
>>>>>>> 7d907b1 (Updated login and signup screens with modern UI)
  },
});
