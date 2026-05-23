import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../firebase';
import { saveDailyMood, getTodayMood } from '../services/firestoreService';
import { MOOD_DATA, getMoodEmoji, getMoodLabel } from '../utils/moodUtils';

export default function MoodSelector({ navigation }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [loading, setLoading] = useState(false);
  const [todayMood, setTodayMood] = useState(null);
  const [checkingToday, setCheckingToday] = useState(true);
  const [useImages, setUseImages] = useState(true); // Always use face images

  const user = auth.currentUser;

  useEffect(() => {
    checkTodayMood();
  }, []);

  const checkTodayMood = async () => {
    try {
      const result = await getTodayMood(user.uid);
      if (result.success) {
        setTodayMood(result.data);
        setSelectedMood(result.data.moodValue);
      }
    } catch (error) {
      console.error('Error checking today mood:', error);
    } finally {
      setCheckingToday(false);
    }
  };

  const handleMoodSelect = async (moodValue) => {
    if (loading) return;

    setSelectedMood(moodValue);
    setLoading(true);

    try {
      const result = await saveDailyMood(user.uid, moodValue);
      
      if (result.success) {
        const selectedMoodData = MOOD_DATA.find(m => m.value === moodValue);
        Alert.alert(
          'Mood Saved! ',
          `Thanks for sharing! You're feeling ${selectedMoodData.label.toLowerCase()} today.`,
          [
            {
              text: 'OK',
              onPress: () => {
                setTodayMood({ moodValue, date: new Date().toISOString().split('T')[0] });
                navigation.goBack();
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to save your mood. Please try again.');
        setSelectedMood(todayMood?.moodValue || null);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
      setSelectedMood(todayMood?.moodValue || null);
    } finally {
      setLoading(false);
    }
  };

  // Using imported utility functions from moodUtils

  if (checkingToday) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFF" />
            <Text style={styles.loadingText}>Loading your mood...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.title}>How are you feeling today?</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          {todayMood && (
            <View style={styles.todayMoodContainer}>
              <Text style={styles.todayMoodTitle}>Today's Mood</Text>
              <View style={styles.todayMoodDisplay}>
                <Image 
                  source={MOOD_DATA.find(m => m.value === todayMood.moodValue)?.image}
                  style={styles.todayMoodImage}
                  resizeMode="contain"
                />
                <Text style={styles.todayMoodLabel}>{getMoodLabel(todayMood.moodValue)}</Text>
              </View>
              <Text style={styles.updateText}>Tap below to update your mood</Text>
            </View>
          )}

          <View style={styles.moodsContainer}>
            {MOOD_DATA.map((mood) => (
              <TouchableOpacity
                key={mood.value}
                style={[
                  styles.moodButton,
                  selectedMood === mood.value && styles.selectedMoodButton,
                  { borderColor: mood.color }
                ]}
                onPress={() => handleMoodSelect(mood.value)}
                disabled={loading}
              >
                <Image 
                  source={mood.image}
                  style={[
                    styles.moodImage,
                    selectedMood === mood.value && styles.selectedMoodImage
                  ]}
                  resizeMode="contain"
                />
                <Text style={[styles.moodLabel, { color: mood.color }]}>
                  {mood.label}
                </Text>
                {loading && selectedMood === mood.value && (
                  <View style={styles.loadingOverlay}>
                    <ActivityIndicator color={mood.color} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              Your mood helps us understand how you're doing and provides valuable insights to your counselors.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 10,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 50,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
  },
  placeholder: {
    width: 36,
    height: 36,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  todayMoodContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 30,
  },
  todayMoodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 10,
  },
  todayMoodDisplay: {
    alignItems: 'center',
  },
  todayMoodEmoji: {
    fontSize: 60,
    marginBottom: 8,
  },
  todayMoodImage: {
    width: 80,
    height: 80,
    marginBottom: 8,
    borderRadius: 40,
    backgroundColor: 'transparent',
    // Remove background effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  todayMoodLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  updateText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 10,
    textAlign: 'center',
  },
  moodsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  moodButton: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#E0E0E0',
    padding: 20,
    alignItems: 'center',
    width: '30%',
    minHeight: 120,
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedMoodButton: {
    borderWidth: 4,
    transform: [{ scale: 1.05 }],
  },
  moodEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  moodImage: {
    width: 50,
    height: 50,
    marginBottom: 8,
    borderRadius: 25,
    backgroundColor: 'transparent',
    // Background removal styling
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedMoodImage: {
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    transform: [{ scale: 1.1 }],
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  infoContainer: {
    marginTop: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
});