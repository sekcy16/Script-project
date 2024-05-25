import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useNavigation } from '@react-navigation/native';
import { firebase } from '../config';

const QRScanner = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    const db = firebase.firestore();

    try {
      const projectDoc = await db.collection('projects').doc(data).get();
      if (projectDoc.exists) {
        const user = firebase.auth().currentUser;
        if (user) {
          const userDoc = await db.collection('users').doc(user.uid).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            const userId = user.uid;

            await db.collection('projects').doc(data).update({
              members: firebase.firestore.FieldValue.arrayUnion({
                email: user.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
              }),
              [`access.${userId}`]: true,
            });

            const projectData = projectDoc.data();
            navigation.navigate('Project Management', { project: { id: data, ...projectData } });
          } else {
            alert('User profile not found');
          }
        }
      } else {
        alert('Invalid QR Code');
      }
    } catch (error) {
      console.error("Error joining project: ", error);
      alert("Error joining project. Please try again.");
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default QRScanner;
