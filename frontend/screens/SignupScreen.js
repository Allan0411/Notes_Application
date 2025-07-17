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

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup=async()=>{
    if(!name||!email||!password)
    {
      alert("please enter all fields");
      return;
    }
    try{
      const response=await fetch(API_BASE_URL+"/Auth/register",{
        method:'POST',
        headers:{
          'Content-Type':'application/json',
        },
        body:JSON.stringify(
          {
            username:name,
            email:email,
            passwordHash:password,
          }
        )
      });

      const data=await response.json();

      if (response.ok) {
        alert("Signup successful");
        navigation.navigate('Login');
      } else {
        console.error("Signup error:", data);
        alert('Signup failed');
      }
      
    }
    catch(err){
      console.error("Signup error: ",err);
      alert('Signup failed');
    }
  }
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Create Account 📝</Text>

      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        style={styles.input}
        placeholderTextColor="#888"
      />

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
        onPress={handleSignup}
      >
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>
          Already have an account? <Text style={styles.linkBold}>Login</Text>
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
    backgroundColor: '#9ba5d1ff', // Light background
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
    backgroundColor: '#8932acff', // Gray button for consistent style
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
