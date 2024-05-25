import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { firebase } from '../../../config';
import { useFocusEffect } from '@react-navigation/native';

const ProjectManagementPage = ({ navigation }) => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchProjects();
    }, [])
  );

  const fetchProjects = async () => {
    try {
      const db = firebase.firestore();
      const currentUser = firebase.auth().currentUser;
      if (!currentUser) {
        console.log("No current user");
        return; // Check if user is logged in
      }

      console.log("Fetching projects for user:", currentUser.uid);
      const projectsSnapshot = await db.collection('projects')
        .where(`access.${currentUser.uid}`, '==', true)
        .get();

      console.log("Projects snapshot size:", projectsSnapshot.size);

      const projectsList = await Promise.all(projectsSnapshot.docs.map(async (doc) => {
        const projectData = doc.data();
        const projectId = doc.id;

        console.log("Fetching members for project:", projectId);
        const membersSnapshot = await db.collection('projects').doc(projectId).collection('members').get();
        const membersList = membersSnapshot.docs.map(doc => doc.data());

        console.log("Members list size:", membersSnapshot.size);

        const memberDetails = await Promise.all(membersList.map(async member => {
          const userQuerySnapshot = await db.collection('users').where('email', '==', member.email).limit(1).get();
          if (!userQuerySnapshot.empty) {
            const userData = userQuerySnapshot.docs[0].data();
            return {
              ...member,
              firstName: userData.firstName,
              lastName: userData.lastName
            };
          }
          return member;
        }));

        return { id: projectId, ...projectData, members: memberDetails };
      }));

      console.log("Projects list:", projectsList);
      setProjects(projectsList);
    } catch (error) {
      console.error("Error fetching projects: ", error);
    }
  };

  const handleDeleteProject = (projectId) => {
    setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
  };

  return (
    <View style={styles.container}>
      <Button
        title="Create a Project"
        onPress={() => navigation.navigate('Add Project', { addProject: (project) => setProjects([...projects, project]) })}
      />
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('Project Management', { project: item, onDeleteProject: handleDeleteProject })}>
            <View style={styles.projectItem}>
              <Text style={styles.projectName}>{item.projectName}</Text>
              <Text>Status: {item.status || 'N/A'}</Text>
              <Text>Due Date: {item.dueDate || 'N/A'}</Text>
              <Text>{item.description || 'No description available'}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  projectItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  projectName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProjectManagementPage;
