import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, TextInput, StyleSheet, Modal, TouchableOpacity, FlatList, Platform } from 'react-native';
import { firebase } from '../../../config';
import DeleteWarning from '../../../components/DeleteWarning';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import moment from 'moment';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import QRCode from 'react-native-qrcode-svg';

const EditProjectPage = ({ navigation, route }) => {
  const { project, onDeleteProject } = route.params;
  const [projectName, setProjectName] = useState(project.projectName);
  const [dueDate, setDueDate] = useState(new Date(project.dueDate));
  const [description, setDescription] = useState(project.description);
  const [status, setStatus] = useState(project.status);
  const [showWarning, setShowWarning] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [members, setMembers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isCreator, setIsCreator] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const qrCodeRef = useRef();

  useEffect(() => {
    checkIfCreator();
    fetchMembers();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchMembers();
      checkIfCreator();
    }, [])
  );

  const checkIfCreator = async () => {
    const user = firebase.auth().currentUser;
    if (user && project.creator === user.uid) {
      setIsCreator(true);
    } else {
      setIsCreator(false);
    }
  };

  const fetchMembers = async () => {
    const db = firebase.firestore();
    try {
      const projectDoc = await db.collection('projects').doc(project.id).get();
      const projectData = projectDoc.data();
      const membersList = projectData.members || [];
  
      const memberDetailsPromises = membersList.map(async (member) => {
        const userQuerySnapshot = await db.collection('users').where('email', '==', member.email).limit(1).get();
        if (!userQuerySnapshot.empty) {
          const userData = userQuerySnapshot.docs[0].data();
          return {
            email: member.email,
            firstName: member.firstName || 'N/A',
            lastName: member.lastName || 'N/A',
          };
        }
        return { email: member.email, firstName: 'N/A', lastName: 'N/A' };
      });
  
      const creatorQuerySnapshot = await db.collection('users').where('uid', '==', project.creator).limit(1).get();
      let creatorDetails = null;
      if (!creatorQuerySnapshot.empty) {
        const creatorData = creatorQuerySnapshot.docs[0].data();
        creatorDetails = {
          email: creatorData.email,
          firstName: creatorData.firstName || 'N/A',
          lastName: creatorData.lastName || 'N/A',
          isCreator: true,
        };
      }
  
      const completeMembersList = await Promise.all(memberDetailsPromises);
      
      if (creatorDetails) {
        completeMembersList.push(creatorDetails);
      }
  
      setMembers(completeMembersList);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const inviteMember = async () => {
    const db = firebase.firestore();
    const projectRef = db.collection('projects').doc(project.id);
  
    try {
      const userQuerySnapshot = await db.collection('users').where('email', '==', inviteEmail).limit(1).get();
      if (userQuerySnapshot.empty) {
        alert("No user found with the email provided.");
        return;
      }
  
      const userDoc = userQuerySnapshot.docs[0];
      const userData = userDoc.data();
      const userId = userDoc.id;
  
      await projectRef.update({
        members: firebase.firestore.FieldValue.arrayUnion({
          email: inviteEmail,
          firstName: userData.firstName || 'N/A',
          lastName: userData.lastName || 'N/A'
        }),
        [`access.${userId}`]: true
      });
  
      await fetchMembers();
      setInviteEmail('');
    } catch (error) {
      console.error("Error inviting member: ", error);
      alert("Error inviting member. Please try again.");
    }
  };

  const handleSave = async () => {
    try {
      const db = firebase.firestore();
      const formattedDueDate = moment(dueDate).format('YYYY-MM-DD');
      const updatedStatus = status || "Not started yet";
  
      await db.collection('projects').doc(project.id).update({
        projectName,
        dueDate: formattedDueDate,
        description,
        status: updatedStatus,
      });
      navigation.goBack();
    } catch (error) {
      console.error("Error updating project: ", error);
    }
  };

  const handleDelete = () => {
    setShowWarning(true);
  };

  const onCancelDelete = () => {
    setShowWarning(false);
  };

  const onConfirmDelete = async () => {
    try {
      const db = firebase.firestore();
      await db.collection('projects').doc(project.id).delete();
      onDeleteProject(project.id);
      navigation.goBack();
    } catch (error) {
      console.error("Error deleting project: ", error);
    }
  };

  const removeMember = async (member) => {
    const db = firebase.firestore();
    const projectRef = db.collection('projects').doc(project.id);
  
    try {
      const userQuerySnapshot = await db.collection('users').where('email', '==', member.email).limit(1).get();
      if (userQuerySnapshot.empty) {
        console.error("No user found with the email: ", member.email);
        return;
      }
  
      const userDoc = userQuerySnapshot.docs[0];
      const userId = userDoc.id;
  
      await projectRef.update({
        members: firebase.firestore.FieldValue.arrayRemove(member),
        [`access.${userId}`]: firebase.firestore.FieldValue.delete()
      });
  
      fetchMembers();
    } catch (error) {
      console.error("Error removing member: ", error);
      alert("Error removing member. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Status:</Text>
        <Picker
          selectedValue={status}
          style={styles.picker}
          onValueChange={(itemValue) => setStatus(itemValue)}
        >
          <Picker.Item label="Not started yet" value="Not started yet" />
          <Picker.Item label="Progressing" value="Progressing" />
          <Picker.Item label="Pause" value="Pause" />
          <Picker.Item label="Finished" value="Finished" />
        </Picker>
      </View>
      <Text style={styles.label}>Project Name:</Text>
      <TextInput
        style={styles.input}
        value={projectName}
        onChangeText={setProjectName}
      />
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
        <Button title="Save" onPress={handleSave} />
        {isCreator && <Button title="Delete Project" onPress={handleDelete} color="red" />}
        <Button title="Cancel" onPress={() => navigation.goBack()} />
        <Button title="View Members" onPress={() => { setModalVisible(true); fetchMembers(); }} />
      </View>
      {showWarning && (
        <DeleteWarning
          onCancel={onCancelDelete}
          onConfirm={onConfirmDelete}
        />
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Project Members</Text>
          <FlatList
            data={members}
            keyExtractor={(item) => item.email}
            renderItem={({ item }) => (
              <View style={styles.memberContainer}>
                <Text style={styles.memberText}>
                  {item.firstName} {item.lastName}
                  {item.isCreator && " (Creator)"} </Text>
                {isCreator && item.email !== firebase.auth().currentUser.email && (
                  <TouchableOpacity onPress={() => removeMember(item)}>
                    <Icon name="times" size={20} color="red" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          />
          <View style={styles.inputContainer}></View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter email to invite"
              value={inviteEmail}
              onChangeText={setInviteEmail}
            />
            <Button title="Invite" onPress={inviteMember} />
            <View style={styles.inputContainer}></View>
            <Text style={styles.modalText}>or</Text>
            
            <Button title="Create QR Code" onPress={() => setShowQRCode(true)} />
          </View>
          <Button title="Close" onPress={() => setModalVisible(!modalVisible)} />
        </View>
      </Modal>
      {showQRCode && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showQRCode}
          onRequestClose={() => {
            setShowQRCode(!showQRCode);
          }}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Scan this QR code to join the project</Text>
            <QRCode
              value={project.id}
              size={200}
              getRef={(c) => (qrCodeRef.current = c)}
            />
            <View style={styles.inputContainer}></View>
            <Button title="Close" onPress={() => setShowQRCode(!showQRCode)} />
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: '100%',
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
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  memberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  memberText: {
    fontSize: 16,
  },
});

export default EditProjectPage;
