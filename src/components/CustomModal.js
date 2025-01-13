import React, { useState } from 'react';
import { View, Text, Modal, Button, TouchableOpacity, StyleSheet, TextInput } from 'react-native';



export const CustomModal = ({ title, body, options, handleRequest, onClose, closeText, textValue, onTextInput}) => {

  

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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(85, 60, 42, 0.8)', // Semi-transparent dark brown
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 300,
    backgroundColor: '#D2B48C', // Light tan
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5C4033', // Medium brown
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#3E2723', // Darker brown
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#8B5E3C', // Rich brown
    padding: 10,
    marginVertical: 5,
    width: '100%',
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF8E1', // Light cream
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 10,
  },
  cancelText: {
    color: '#7D4E3A', // Muted brown
    fontSize: 16,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5DC', // Beige for overall app background
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#8B5E3C', // Rich brown
    borderRadius: 5,
    marginBottom: 20,
    backgroundColor: '#FFF8E1', // Light cream
    color: '#5C4033', // Medium brown for text
  },
});
