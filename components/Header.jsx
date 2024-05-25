import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

const Header = ({ name }) => {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerText}>{name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    marginLeft: 15,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 30,
    maxWidth: '70%',
    // Adjust fontSize for Android
    ...Platform.select({
      android: {
        fontWeight: 'bold',
        fontSize: 20,
        maxWidth: '100%',
      },
    }),
  },
});

export default Header;
