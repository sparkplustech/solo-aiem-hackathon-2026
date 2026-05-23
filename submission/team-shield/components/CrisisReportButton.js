import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  TextInput,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { auth } from '../firebase';
import { createCrisisReport } from '../services/firestoreService';

const CrisisReportButton = ({ style }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [description, setDescription] = useState('');
  const [contactPreference, setContactPreference] = useState('trusted_friends');
  const [loading, setLoading] = useState(false);

  const severityLevels = [
    {
      id: 'mild',
      title: 'Feeling Down',
      subtitle: 'Could use some support',
      color: '#FFA726',
      icon: '😔'
    },
    {
      id: 'moderate',
      title: 'Need Help',
      subtitle: 'Struggling significantly',
      color: '#FF7043',
      icon: '😰'
    },
    {
      id: 'severe',
      title: 'In Distress',
      subtitle: 'Need immediate support',
      color: '#E53935',
      icon: '😱'
    },
    {
      id: 'crisis',
      title: 'Crisis Situation',
      subtitle: 'Emergency intervention needed',
      color: '#C62828',
      icon: '🚨'
    }
  ];

  const reportTypes = [
    { id: 'feeling_unwell', title: 'Feeling Unwell', description: 'General mental health concern' },
    { id: 'anxiety_panic', title: 'Anxiety/Panic', description: 'Experiencing anxiety or panic attacks' },
    { id: 'depression', title: 'Depression', description: 'Feeling depressed or hopeless' },
    { id: 'stress_overwhelm', title: 'Overwhelmed', description: 'Feeling stressed or overwhelmed' },
    { id: 'self_harm', title: 'Self-Harm Thoughts', description: 'Having thoughts of self-harm' },
    { id: 'suicidal_thoughts', title: 'Suicidal Thoughts', description: 'Having suicidal thoughts' },
    { id: 'crisis_situation', title: 'Crisis Situation', description: 'In immediate crisis or danger' }
  ];

  const contactOptions = [
    { id: 'trusted_friends', title: 'Trusted Friends', description: 'Notify my trusted friends' },
    { id: 'counselor', title: 'Professional Counselor', description: 'Connect me with a counselor' },
    { id: 'all', title: 'All Support', description: 'Notify both friends and counselors' }
  ];

  const handleSubmitReport = async () => {
    if (!selectedSeverity || !selectedType) {
      Alert.alert('Missing Information', 'Please select both severity level and report type.');
      return;
    }

    if (!auth.currentUser) {
      Alert.alert('Error', 'You must be logged in to submit a report.');
      return;
    }

    setLoading(true);
    
    try {
      const reportData = {
        userId: auth.currentUser.uid,
        severityLevel: selectedSeverity,
        reportType: selectedType,
        description: description.trim(),
        contactPreference
      };

      const result = await createCrisisReport(reportData);
      
      if (result.success) {
        Alert.alert(
          'Report Submitted',
          result.message,
          [
            {
              text: 'OK',
              onPress: () => {
                setModalVisible(false);
                resetForm();
              }
            }
          ]
        );

        // For crisis level, show additional alert
        if (selectedSeverity === 'crisis') {
          setTimeout(() => {
            Alert.alert(
              'Emergency Resources',
              'If you are in immediate danger, please call:\n\n• Emergency Services: 911\n• Crisis Hotline: 988\n• Campus Safety: [Your Campus Number]',
              [
                { text: 'Call 911', onPress: () => {} },
                { text: 'I\'m Safe', style: 'cancel' }
              ]
            );
          }, 1000);
        }
      } else {
        Alert.alert('Error', result.error || 'Failed to submit report. Please try again.');
      }
    } catch (error) {
      console.error('Crisis report error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedSeverity(null);
    setSelectedType(null);
    setDescription('');
    setContactPreference('trusted_friends');
  };

  const getSeverityColor = (severity) => {
    const level = severityLevels.find(s => s.id === severity);
    return level ? level.color : '#666';
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.emergencyButton, style]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#E53935', '#C62828']}
          style={styles.buttonGradient}
        >
          <Text style={styles.emergencyButtonText}>🆘</Text>
          <Text style={styles.emergencyButtonLabel}>Need Help</Text>
        </LinearGradient>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>How are you feeling?</Text>
              <Text style={styles.modalSubtitle}>
                Your wellbeing matters. Let us know how you're doing so we can provide the right support.
              </Text>
            </View>

            {/* Severity Level Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select your current state</Text>
              <View style={styles.severityContainer}>
                {severityLevels.map((level) => (
                  <TouchableOpacity
                    key={level.id}
                    style={[
                      styles.severityCard,
                      selectedSeverity === level.id && {
                        borderColor: level.color,
                        borderWidth: 2,
                        backgroundColor: level.color + '10'
                      }
                    ]}
                    onPress={() => setSelectedSeverity(level.id)}
                  >
                    <Text style={styles.severityIcon}>{level.icon}</Text>
                    <Text style={[styles.severityTitle, { color: level.color }]}>
                      {level.title}
                    </Text>
                    <Text style={styles.severitySubtitle}>{level.subtitle}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Report Type Selection */}
            {selectedSeverity && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>What's going on?</Text>
                <View style={styles.typeContainer}>
                  {reportTypes.map((type) => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.typeCard,
                        selectedType === type.id && {
                          borderColor: getSeverityColor(selectedSeverity),
                          borderWidth: 2,
                          backgroundColor: getSeverityColor(selectedSeverity) + '10'
                        }
                      ]}
                      onPress={() => setSelectedType(type.id)}
                    >
                      <Text style={styles.typeTitle}>{type.title}</Text>
                      <Text style={styles.typeDescription}>{type.description}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Description */}
            {selectedType && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Additional details (optional)</Text>
                <TextInput
                  style={styles.descriptionInput}
                  placeholder="Tell us more about how you're feeling or what's happening..."
                  multiline
                  numberOfLines={4}
                  value={description}
                  onChangeText={setDescription}
                  textAlignVertical="top"
                />
              </View>
            )}

            {/* Contact Preference */}
            {selectedType && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Who should we contact?</Text>
                <View style={styles.contactContainer}>
                  {contactOptions.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.contactCard,
                        contactPreference === option.id && {
                          borderColor: getSeverityColor(selectedSeverity),
                          borderWidth: 2,
                          backgroundColor: getSeverityColor(selectedSeverity) + '10'
                        }
                      ]}
                      onPress={() => setContactPreference(option.id)}
                    >
                      <Text style={styles.contactTitle}>{option.title}</Text>
                      <Text style={styles.contactDescription}>{option.description}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!selectedSeverity || !selectedType || loading) && styles.submitButtonDisabled,
                  { backgroundColor: selectedSeverity ? getSeverityColor(selectedSeverity) : '#ccc' }
                ]}
                onPress={handleSubmitReport}
                disabled={!selectedSeverity || !selectedType || loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Report</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.emergencyNote}>
              <Text style={styles.emergencyNoteText}>
                🚨 If you're in immediate danger, call emergency services (911) or go to your nearest emergency room.
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  emergencyButton: {
    borderRadius: 50,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyButtonText: {
    fontSize: 20,
    marginRight: 8,
  },
  emergencyButtonLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalHeader: {
    marginBottom: 30,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  severityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  severityCard: {
    width: '48%',
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    marginBottom: 10,
  },
  severityIcon: {
    fontSize: 30,
    marginBottom: 8,
  },
  severityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  severitySubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  typeContainer: {
    gap: 10,
  },
  typeCard: {
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  typeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 14,
    color: '#666',
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    minHeight: 100,
  },
  contactContainer: {
    gap: 10,
  },
  contactCard: {
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 20,
    marginBottom: 30,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  emergencyNote: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 12,
    borderColor: '#ffeaa7',
    borderWidth: 1,
    marginBottom: 20,
  },
  emergencyNoteText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default CrisisReportButton;