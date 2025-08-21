import { StyleSheet } from 'react-native';

const ForgotPasswordScreenStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#a6b7cfff',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 34,
        fontWeight: '700',
        color: '#374151',
        fontFamily: 'sans-serif-light',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 5,
    },
    formContainer: {
        width: '100%',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 30,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    inputContainer: {
        width: '100%',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        height: 55,
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        paddingHorizontal: 25,
        fontSize: 16,
        color: '#333',
        borderColor: '#e0e0e0',
        borderWidth: 1,
    },
    disabledInput: {
        opacity: 0.5,
    },
    messageText: {
        fontSize: 14,
        color: 'red',
        marginBottom: 15,
        textAlign: 'center',
    },
    loginButton: {
        width: '100%',
        height: 55,
        backgroundColor: '#4B5563',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footerContainer: {
        marginTop: 30,
        alignItems: 'center',
    },
    signupText: {
        fontSize: 14,
        color: '#666',
    },
    signupLink: {
        color: '#eceef0ff',
        fontWeight: 'bold',
    },
});

export default ForgotPasswordScreenStyles;
