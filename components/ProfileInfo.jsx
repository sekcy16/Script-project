import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, Button, TextInput, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { firebase } from '../config';

const ProfileInfo = ({ userId }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [image, setImage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    const unsubscribe = firebase.firestore().collection('users').doc(userId)
      .onSnapshot((doc) => {
        const userData = doc.data();
        setFirstName(userData.firstName);
        setLastName(userData.lastName);
        setImage(userData.profilePicture);
      });

    return () => unsubscribe();
  }, [userId]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      try {
        const uri = result.assets[0].uri;
        console.log("Image URI:", uri); // Debugging step to ensure URI is correct

        const response = await fetch(uri);
        if (!response.ok) {
          throw new Error('Failed to fetch the image');
        }

        const blob = await response.blob();
        console.log("Blob:", blob); // Debugging step to ensure blob is created

        const ref = firebase.storage().ref().child(`profilePictures/${userId}`);
        await ref.put(blob);

        const profilePictureUrl = await ref.getDownloadURL();
        console.log("Uploaded Image URL:", profilePictureUrl); // Debugging step to ensure image URL is retrieved

        setImage(profilePictureUrl);
        await firebase.firestore().collection('users').doc(userId).update({ profilePicture: profilePictureUrl });
      } catch (error) {
        console.error("Error uploading image:", error);
        Alert.alert('Upload failed', 'Failed to upload image. Please try again.');
      }
    }
  };

  const handleImageUrlChange = async () => {
    if (!imageUrl) {
      Alert.alert('Invalid URL', 'Please enter a valid image URL');
      return;
    }

    setImage(imageUrl);
    await firebase.firestore().collection('users').doc(userId).update({ profilePicture: imageUrl });
    setImageUrl('');
  };

  return (
    <View style={styles.profileContainer}>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Image source={{ uri: image || 'https://via.placeholder.com/40' }} style={styles.profileImage} />
      </TouchableOpacity>
      <Text style={styles.profileText}>{firstName} {lastName}</Text>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={styles.modalView}>
          <Image source={{ uri: image || 'https://via.placeholder.com/100' }} style={styles.modalImage} />
          <Button title="Upload from Gallery" onPress={pickImage} />
          <View style={styles.inputContainer} />
          <Text style={styles.modalText}>or</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter image URL"
            value={imageUrl}
            onChangeText={setImageUrl}
          />
          <Button title="Use URL" onPress={handleImageUrlChange} />
          <View style={styles.inputContainer} />
          <Button title="Close" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  inputContainer: {
    marginVertical: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
    marginRight: 10,
  },
  profileText: {
    fontSize: 16,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 15,
    width: '80%',
  },
});

export default ProfileInfo;
