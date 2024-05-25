import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { firebase } from '../../../config';
import moment from 'moment';

const AddProjectPage = ({ navigation }) => {
  const [projectName, setProjectName] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [description, setDescription] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleCreate = async () => {
    const db = firebase.firestore();
    const formattedDueDate = moment(dueDate).format('YYYY-MM-DD');
  
    try {
      const user = firebase.auth().currentUser;
  
      if (!user) {
        throw new Error("User not authenticated.");
      }
  
      const userDoc = await db.collection('users').doc(user.uid).get();
      if (!userDoc.exists) {
        throw new Error("User document not found in the 'users' collection.");
      }
      const userData = userDoc.data();
      const { firstName, lastName } = userData;
  
      await db.runTransaction(async (transaction) => {
        const counterDocRef = db.collection('counters').doc('projectCounter');
        const counterDoc = await transaction.get(counterDocRef);
  
        if (!counterDoc.exists) {
          throw new Error("Counter document does not exist!");
        }
  
        const currentCount = counterDoc.data().count;
        if (typeof currentCount !== 'number') {
          throw new Error("Counter value is not a number!");
        }
  
        const newProjectId = currentCount + 1;
  
        transaction.update(counterDocRef, { count: newProjectId });
  
        const newProject = {
          projectId: newProjectId,
          projectName,
          dueDate: formattedDueDate,
          description,
          members: [{ email: user.email, firstName, lastName }],
          creator: user.uid,  // Store creator UID
          access: { [user.uid]: true }
        };
  
        await db.collection('projects').add(newProject);
        navigation.goBack();
      });
    } catch (error) {
      console.error("Error adding project: ", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Project Name:</Text>
      <TextInput style={styles.input} value={projectName} onChangeText={setProjectName} />
      <Text style={styles.label}>Due Date:</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <TextInput
          style={styles.input}
          value={moment(dueDate).format('YYYY-MM-DD')}
          editable={false}
        />
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={dueDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setDueDate(selectedDate);
            }
          }}
        />
      )}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description:</Text>
        <TextInput
          style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
          value={description}
          onChangeText={setDescription}
          multiline={true}
          numberOfLines={6}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Create" onPress={handleCreate} />
        <Button title="Cancel" onPress={() => navigation.goBack()} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 20,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 16,
    borderRadius: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default AddProjectPage;
