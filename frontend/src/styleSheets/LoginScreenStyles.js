// LoginScreenStyleSheet.js

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#a6b7cfff',
    },
    innerContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 48,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 16,
        color: '#ffffff',
        opacity: 0.8,
    },
    formContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 32,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 12,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    disabledInput: {
        opacity: 0.6,
    },
    loginButton: {
        backgroundColor: '#686f88ff',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 12,
        shadowColor: '#72809bff',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    loginButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
    },
    footerContainer: {
        alignItems: 'center',
        marginTop: 32,
    },
    signupText: {
        color: '#ffffff',
        fontSize: 16,
        opacity: 0.9,
    },
    signupLink: {
        color: '#656f8fff',
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
});

export default styles;
