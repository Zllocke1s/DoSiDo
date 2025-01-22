import React, { useState } from 'react';
import { View, Text, Modal, Button, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useTheme } from '../ThemeContext';



export const CustomModal = ({ title, body, options, handleRequest, onClose, closeText, textValue, onTextInput}) => {

  const { theme } = useTheme();

  const styles =
    StyleSheet.create({
      overlay: {
        flex: 1,
        backgroundColor: theme.overlayColor || 'rgba(85, 60, 42, 0.8)', // Theme-based semi-transparent overlay color
        justifyContent: 'center',
        alignItems: 'center',
      },
      modalContent: {
        width: 300,
        backgroundColor: theme.modalBackgroundColor || theme.cardBackgroundColor, // Theme-based modal background color
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: theme.shadowColor || '#000', // Theme-based shadow color
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 5,
      },
      title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.textColor || '#5C4033', // Theme-based title text color
        marginBottom: 10,
      },
      message: {
        fontSize: 16,
        color: theme.secondaryTextColor || '#3E2723', // Theme-based message text color
        marginBottom: 20,
        textAlign: 'center',
      },
      button: {
        backgroundColor: theme.buttonBackgroundColor || '#8B5E3C', // Theme-based button background color
        padding: 10,
        marginVertical: 5,
        width: '100%',
        borderRadius: 5,
        alignItems: 'center',
      },
      buttonText: {
        color: theme.buttonTextColor || '#FFF8E1', // Theme-based button text color
        fontSize: 16,
      },
      cancelButton: {
        marginTop: 10,
      },
      cancelText: {
        color: theme.cancelTextColor || '#7D4E3A', // Theme-based cancel button text color
        fontSize: 16,
      },
      container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.backgroundColor || '#F5F5DC', // Theme-based container background color
      },
      input: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: theme.borderColor || '#8B5E3C', // Theme-based border color
        borderRadius: 5,
        marginBottom: 20,
        backgroundColor: theme.inputBackgroundColor || '#FFF8E1', // Theme-based input background color
        color: theme.inputTextColor || '#5C4033', // Theme-based input text color
      },
    });
  

  return (
    <Modal visible={true} transparent={true} animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{body}</Text>
          {options!=null && options.map((option) => {
            return(
            <TouchableOpacity
            style={styles.button}
            onPress={() => handleRequest(option.value)}
          >
            <Text style={styles.buttonText}>{option.label}</Text>
          </TouchableOpacity>
            )
          })}
          {onTextInput!=null &&
          <TextInput
          style={styles.input}
          value={textValue}
          onChangeText={onTextInput}
          />
          }
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>{closeText==null ? "Cancel" : closeText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

