import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { API_BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function LoginScreen({ navigation }) {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin=async()=>{
    if(!email||!password)
    {
      alert("please enter both email and password");
      return;
    }

    try{
      const response=await fetch(API_BASE_URL+"/Auth/login",{
        method:'POST',
        headers:{
          'Content-Type':'application/json',
        },
        body:JSON.stringify(
          {
            email:email,
            password:password,
          }
        )
      });

      const data=await response.json();

       if (response.ok) {
        await AsyncStorage.setItem('authToken', data.token);
      console.log("Token:", data.token);  // ✅ Only printing token
      alert("Login successful");
      navigation.navigate('Home');
    } else {
      console.error("Login error:", data);
      alert('Login failed');
    }

    }
    catch(err){
      console.error("Login error: ",err);
      alert('Login failed');
    }
  };
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Welcome To SwagNotes</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
        placeholderTextColor="#888"
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        placeholderTextColor="#888"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#9ba5d1ff', // Very light gray/blue background
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
    backgroundColor: '#8932acff', // Soft gray tone for button
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
    color: '#8932acff',
    fontWeight: 'bold',
  },
});
