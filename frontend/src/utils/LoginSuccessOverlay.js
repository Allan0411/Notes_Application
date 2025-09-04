import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // <-- Added Ionicons import

const LoginSuccessOverlay = ({ isVisible, onDismiss, colors }) => {
  // Animated value for fading the entire overlay
  const fadeAnim = useRef(new Animated.Value(0)).current;
  // Animated value for scaling the pop-up itself
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Start the animations simultaneously when isVisible changes
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: isVisible ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: isVisible ? 1 : 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isVisible]);

  // If the component is not visible, return null to unmount it from the tree.
  if (!isVisible) {
    return null;
  }

  return (
    // The main overlay container with a fade animation for a smooth appearance/disappearance
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      {/* The pop-up card with the scaling animation applied */}
      <Animated.View 
        style={[
          styles.popup, 
          { 
            backgroundColor: colors.cardBackground, 
            transform: [{ scale: scaleAnim }] 
          }
        ]}
      >
        <Ionicons name="checkmark-circle-outline" size={64} color="#4CAF50" style={styles.icon} />
        <Text style={[styles.popupText, { color: colors.text }]}>Login successful</Text>
        <TouchableOpacity
          style={styles.popupOkButton}
          onPress={onDismiss}
        >
          <Text style={styles.popupOkButtonText}>OK</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // The full-screen overlay for the blur/dim effect
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  // The central pop-up container
  popup: {
    width: 300, // Made it a bit wider
    borderRadius: 30, // Increased border radius for a softer look
    padding: 40, // Increased padding for more internal space
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 20, // More pronounced shadow for depth (Android)
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  icon: {
    color: '#939ab3ff', // Blue color
    marginBottom: 15,
  },
  popupText: {
    fontSize: 20, // Larger font size for emphasis
    fontWeight: 'bold',
    fontStyle: 'normal',
    marginBottom: 30, // More space below the text
    textAlign: 'center',
  },
  popupOkButton: {
    backgroundColor: '#939ab3ff', // Solid green background
    borderRadius: 25, // Very rounded corners
    paddingVertical: 12, // Vertical padding
    paddingHorizontal: 60, // Wider horizontal padding
    alignSelf: 'center', // Center the button horizontally
    elevation: 5, // Add a slight shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  popupOkButtonText: {
    fontWeight: 'bold',
    fontSize: 18, // Slightly larger text
    color: '#fff', // White text color
    textAlign: 'center',
  },
});

export default LoginSuccessOverlay;