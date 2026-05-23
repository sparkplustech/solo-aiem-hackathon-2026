import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../firebase';
import { sendEmergencyAlert, getTrustedFriends } from '../services/firestoreService';

export default function EmergencyButton({ style, onAddFriends, onContactCounselor, refreshTrigger }) {
  const [loading, setLoading] = useState(false);
  const [trustedFriendsCount, setTrustedFriendsCount] = useState(0);
  const [pulseAnim] = useState(new Animated.Value(1));

  const user = auth.currentUser;

  useEffect(() => {
    checkTrustedFriends();
    startPulseAnimation();
  }, []);

  // Re-check trusted friends when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger) {
      checkTrustedFriends();
    }
  }, [refreshTrigger]);

  const checkTrustedFriends = async () => {
    try {
      const result = await getTrustedFriends(user.uid);
      console.log('EmergencyButton: getTrustedFriends result:', result);
      if (result.success) {
        console.log('EmergencyButton: Setting trusted friends count to:', result.data.length);
        setTrustedFriendsCount(result.data.length);
      } else {
        console.warn('EmergencyButton: Failed to get trusted friends:', result.error);
      }
    } catch (error) {
      console.error('Error checking trusted friends:', error);
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleEmergencyPress = () => {
    console.log('EmergencyButton: handleEmergencyPress called, trustedFriendsCount:', trustedFriendsCount);
    if (trustedFriendsCount === 0) {
      Alert.alert(
        'No Trusted Friends',
        'You need to add trusted friends first to use the emergency alert feature. Would you like to add some now?',
        [
          { text: 'Later', style: 'cancel' },
          { 
            text: 'Add Friends', 
            onPress: onAddFriends
          }
        ]
      );
      return;
    }

    Alert.alert(
      '🚨 Emergency Alert',
      `This will send an immediate notification to your ${trustedFriendsCount} trusted friend${trustedFriendsCount > 1 ? 's' : ''} letting them know you're experiencing high stress and need support.\n\nAre you sure you want to send this alert?`,
      [
        { 
          text: 'Cancel', 
          style: 'cancel' 
        },
        { 
          text: 'Send Alert', 
          style: 'destructive',
          onPress: sendAlert
        }
      ]
    );
  };

  const sendAlert = async () => {
    console.log('EmergencyButton: sendAlert called');
    setLoading(true);
    
    try {
      const result = await sendEmergencyAlert(user.uid);
      console.log('EmergencyButton: sendEmergencyAlert result:', result);
      
      if (result.success) {
        Alert.alert(
          'Alert Sent! 📱',
          `Your trusted friend${result.data.notifiedFriends > 1 ? 's have' : ' has'} been notified and will reach out to you soon. Remember, you're not alone.`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Optionally refresh trusted friends count
                checkTrustedFriends();
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Unable to Send Alert',
          result.error || 'There was an issue sending your emergency alert. Please try again or contact a counselor directly.',
          [
            { text: 'OK' },
            { 
              text: 'Contact Counselor', 
              onPress: onContactCounselor
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      Alert.alert(
        'Error',
        'Failed to send emergency alert. Please try again or seek immediate help from a counselor.',
        [
          { text: 'OK' },
          { 
            text: 'Contact Counselor', 
            onPress: onContactCounselor
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View style={[styles.container, style, { transform: [{ scale: pulseAnim }] }]}>
      <TouchableOpacity
        style={[
          styles.emergencyButton,
          loading && styles.emergencyButtonDisabled
        ]}
        onPress={handleEmergencyPress}
        disabled={loading}
        activeOpacity={0.8}
      >
        <View style={styles.buttonContent}>
          {loading ? (
            <ActivityIndicator size="large" color="#FFF" />
          ) : (
            <>
              <View style={styles.iconContainer}>
                <Ionicons name="warning" size={32} color="#FFF" />
              </View>
              <Text style={styles.emergencyText}>EMERGENCY</Text>
              <Text style={styles.emergencySubtext}>Tap for Help</Text>
            </>
          )}
        </View>
        
        {trustedFriendsCount > 0 && !loading && (
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{trustedFriendsCount}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          {trustedFriendsCount === 0 
            ? 'Add trusted friends to enable emergency alerts' 
            : `Will notify ${trustedFriendsCount} trusted friend${trustedFriendsCount > 1 ? 's' : ''}`
          }
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  emergencyButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF4444',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#FFF',
  },
  emergencyButtonDisabled: {
    backgroundColor: '#CC3333',
    shadowOpacity: 0.1,
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 8,
  },
  emergencyText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 1,
    marginBottom: 2,
  },
  emergencySubtext: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.5,
  },
  badgeContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  badge: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF4444',
  },
  infoContainer: {
    marginTop: 12,
    paddingHorizontal: 20,
  },
  infoText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 16,
  },
});