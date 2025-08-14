// in app/(main)/contact.tsx

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useUser } from '@clerk/clerk-expo';

// A reusable component for our modern, icon-based inputs
const ContactInput = ({ icon, value, onChangeText, placeholder, keyboardType = 'default' }) => (
    <View style={styles.inputContainer}>
        <Ionicons name={icon} size={20} color="#9CA3AF" style={styles.inputIcon} />
        <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            keyboardType={keyboardType}
            value={value}
            onChangeText={onChangeText}
        />
    </View>
);

export default function ContactUsScreen() {
  const router = useRouter();
  const { user } = useUser();

  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [phone, setPhone] = useState(user?.primaryPhoneNumber?.phoneNumber || '');
  const [whatsapp, setWhatsapp] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(false);
  const [email, setEmail] = useState(user?.primaryEmailAddress?.emailAddress || '');

  const handleSameAsPhoneToggle = (value: boolean) => {
    setSameAsPhone(value);
    setWhatsapp(value ? phone : '');
  };

  const handleSendEmail = async () => {
    const to = 'divydeepmishra@gmail.com';
    
    if (!subject.trim() || !body.trim()) {
      Alert.alert('Missing Information', 'Please fill out both the subject and your message.');
      return;
    }

    // Nicely format the contact details at the end of the email
    const contactInfo = `
---
Contact Details:
Email: ${email || 'Not provided'}
Phone: ${phone || 'Not provided'}
WhatsApp: ${whatsapp || 'Not provided'}
    `.trim();

    const fullMessage = `${body}\n\n${contactInfo}`;
    const mailtoUrl = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullMessage)}`;

    const canOpen = await Linking.canOpenURL(mailtoUrl);
    if (canOpen) {
      await Linking.openURL(mailtoUrl);
    } else {
      Alert.alert('Cannot Open Email', 'No email app is available on this device.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Contact Us</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.introText}>
          We'd love to hear from you! Please fill out the form below and we'll get back to you as soon as possible.
        </Text>

        {/* Message Card */}
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Message</Text>
            <TextInput
                style={styles.subjectInput}
                placeholder="What is this about?"
                value={subject}
                onChangeText={setSubject}
            />
            <TextInput
                style={[styles.subjectInput, styles.textArea]}
                placeholder="Please describe your query in detail..."
                value={body}
                onChangeText={setBody}
                multiline
            />
        </View>

        {/* Contact Info Card */}
        <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Contact Information </Text>
            <ContactInput icon="mail-outline" placeholder="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <ContactInput icon="call-outline" placeholder="Phone Number" value={phone} onChangeText={text => {
                setPhone(text);
                if (sameAsPhone) setWhatsapp(text);
            }} keyboardType="phone-pad" />
            
            <View style={styles.row}>
                <Text style={styles.switchLabel}>WhatsApp is same as phone</Text>
                <Switch value={sameAsPhone} onValueChange={handleSameAsPhoneToggle} />
            </View>
            {!sameAsPhone && (
                <ContactInput icon="logo-whatsapp" placeholder="WhatsApp Number" value={whatsapp} onChangeText={setWhatsapp} keyboardType="phone-pad" />
            )}
        </View>

        <TouchableOpacity style={styles.sendButton} onPress={handleSendEmail}>
          <Ionicons name="send-outline" size={20} color="white" />
          <Text style={styles.sendButtonText}>Send Message</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  scrollContainer: { padding: 20 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', backgroundColor: 'white',
  },
  title: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
  introText: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  subjectInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 7,
    padding: 16,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    height: 150,
    textAlignVertical: 'top',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
    color: '#374151',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});