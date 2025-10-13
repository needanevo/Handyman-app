import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button } from '../../src/components/Button';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import { quotesAPI, profileAPI } from '../../src/services/api';
import { useAuth } from '../../src/contexts/AuthContext';
import { serviceCategories } from '../../src/constants/services';

interface QuoteRequestForm {
  serviceCategory: string;
  description: string;
  urgency: string;
  budgetRange: {
    min: string;
    max: string;
  };
}

const urgencyOptions = [
  { id: 'flexible', title: 'Flexible', description: 'Within 2 weeks' },
  { id: 'normal', title: 'Normal', description: 'Within 1 week' },
  { id: 'urgent', title: 'Urgent', description: 'Within 2-3 days' },
];

export default function QuoteRequestScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { category } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<QuoteRequestForm>({
    defaultValues: {
      serviceCategory: (category as string) || '',
      urgency: 'normal',
      budgetRange: { min: '', max: '' },
    },
  });
  
  const selectedCategory = watch('serviceCategory');
  const selectedUrgency = watch('urgency');
  
  // Get the selected service details
  const selectedService = useMemo(
    () => serviceCategories.find(s => s.id === selectedCategory),
    [selectedCategory]
  );

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to photos to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setPhotos(prev => [...prev, `data:image/jpeg;base64,${result.assets[0].base64}`]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to camera to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setPhotos(prev => [...prev, `data:image/jpeg;base64,${result.assets[0].base64}`]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: QuoteRequestForm) => {
    try {
      setIsLoading(true);
      
      // Get user's default address or create a mock one
      let addressId = user?.addresses?.find(addr => addr.isDefault)?.id;
      if (!addressId && user?.addresses && user.addresses.length > 0) {
        addressId = user.addresses[0].id;
      } else if (!addressId) {
        // Create a temporary address for demo purposes
        addressId = 'temp-address-id';
      }

      const quoteRequest = {
        service_category: data.serviceCategory,
        address_id: addressId,
        description: data.description,
        photos,
        preferred_dates: [], // Will be enhanced later with date picker
        budget_range: {
          min: parseFloat(data.budgetRange.min) || 0,
          max: parseFloat(data.budgetRange.max) || 0,
        },
        urgency: data.urgency,
      };

      const response = await quotesAPI.requestQuote(quoteRequest);
      
      Alert.alert(
        'Quote Requested!',
        `Your quote has been submitted. Estimated total: $${response.estimated_total}. You'll receive the detailed quote soon.`,
        [
          {
            text: 'View Quotes',
            onPress: () => router.push('/quotes'),
          },
          {
            text: 'OK',
            onPress: () => router.push('/home'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Quote request error:', error);
      Alert.alert(
        'Request Failed',
        error.response?.data?.detail || 'Please try again later'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#2C3E50" />
            </TouchableOpacity>
            <Text style={styles.title}>Request Quote</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Service Category - Now showing description instead of grid */}
          {selectedService && (
            <View style={styles.serviceInfoCard}>
              <View style={styles.serviceInfoHeader}>
                <View style={[styles.serviceInfoIcon, { backgroundColor: `${selectedService.color}20` }]}>
                  <Ionicons
                    name={selectedService.icon as any}
                    size={32}
                    color={selectedService.color}
                  />
                </View>
                <View style={styles.serviceInfoText}>
                  <Text style={styles.serviceInfoTitle}>{selectedService.title} Services</Text>
                  <Text style={styles.serviceInfoSubtitle}>{selectedService.description}</Text>
                </View>
              </View>
              <Text style={styles.serviceInfoDescription}>
                {selectedService.fullDescription}
              </Text>
              <TouchableOpacity 
                style={styles.changeServiceButton}
                onPress={() => router.back()}
              >
                <Ionicons name="swap-horizontal-outline" size={16} color="#FF6B35" />
                <Text style={styles.changeServiceText}>Change Service</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Describe the issue</Text>
            <Controller
              control={control}
              name="description"
              rules={{ required: 'Please describe what you need help with' }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.textArea, errors.description && styles.inputError]}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Describe the work needed, any specific requirements, or problems you're experiencing..."
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              )}
            />
            {errors.description && (
              <Text style={styles.errorText}>{errors.description.message}</Text>
            )}
          </View>

          {/* Photos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add Photos (Optional)</Text>
            <Text style={styles.sectionDescription}>
              Photos help us provide more accurate estimates
            </Text>
            
            <View style={styles.photoActions}>
              <Button
                title="Take Photo"
                onPress={takePhoto}
                variant="outline"
                size="small"
                icon={<Ionicons name="camera-outline" size={16} color="#FF6B35" />}
              />
              <Button
                title="Choose from Library"
                onPress={pickImage}
                variant="outline"
                size="small"
                icon={<Ionicons name="image-outline" size={16} color="#FF6B35" />}
              />
            </View>
            
            {photos.length > 0 && (
              <View style={styles.photoPreview}>
                {photos.map((photo, index) => (
                  <View key={index} style={styles.photoItem}>
                    <TouchableOpacity
                      onPress={() => removePhoto(index)}
                      style={styles.removePhoto}
                    >
                      <Ionicons name="close" size={16} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.photoPlaceholder}>
                      <Ionicons name="image" size={24} color="#7F8C8D" />
                      <Text style={styles.photoText}>Photo {index + 1}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Urgency */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>When do you need this done?</Text>
            <View style={styles.urgencyOptions}>
              {urgencyOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.urgencyCard,
                    selectedUrgency === option.id && styles.urgencyCardSelected,
                  ]}
                  onPress={() => setValue('urgency', option.id)}
                >
                  <View style={styles.urgencyContent}>
                    <Text
                      style={[
                        styles.urgencyTitle,
                        selectedUrgency === option.id && styles.urgencyTitleSelected,
                      ]}
                    >
                      {option.title}
                    </Text>
                    <Text style={styles.urgencyDescription}>{option.description}</Text>
                  </View>
                  {selectedUrgency === option.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#FF6B35" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Budget Range */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Budget Range (Optional)</Text>
            <Text style={styles.sectionDescription}>
              Help us provide options within your budget
            </Text>
            <View style={styles.budgetRow}>
              <View style={styles.budgetInput}>
                <Text style={styles.label}>Minimum</Text>
                <Controller
                  control={control}
                  name="budgetRange.min"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.input}
                      onChangeText={onChange}
                      value={value}
                      placeholder="$100"
                      keyboardType="numeric"
                    />
                  )}
                />
              </View>
              <View style={styles.budgetSeparator}>
                <Text style={styles.budgetSeparatorText}>to</Text>
              </View>
              <View style={styles.budgetInput}>
                <Text style={styles.label}>Maximum</Text>
                <Controller
                  control={control}
                  name="budgetRange.max"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.input}
                      onChangeText={onChange}
                      value={value}
                      placeholder="$500"
                      keyboardType="numeric"
                    />
                  )}
                />
              </View>
            </View>
          </View>

          {/* Submit */}
          <View style={styles.submitSection}>
            <Button
              title="Get AI-Powered Quote"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              fullWidth
              size="large"
              icon={<Ionicons name="flash" size={20} color="#fff" />}
            />
            <Text style={styles.submitNote}>
              You'll receive an AI-generated estimate in minutes. Our team will review and send the final quote within 24 hours.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  placeholder: {
    width: 40,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginTop: 8,
  },
  categoryCard: {
    width: '31%',
    margin: 6,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryCardSelected: {
    backgroundColor: '#FFF4F1',
    borderColor: '#FF6B35',
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 8,
  },
  categoryTitleSelected: {
    color: '#FF6B35',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    height: 100,
    backgroundColor: '#fff',
  },
  photoActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  photoPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoItem: {
    position: 'relative',
  },
  photoPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  photoText: {
    fontSize: 10,
    color: '#7F8C8D',
    marginTop: 4,
  },
  removePhoto: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E74C3C',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  urgencyOptions: {
    gap: 12,
    marginTop: 8,
  },
  urgencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  urgencyCardSelected: {
    backgroundColor: '#FFF4F1',
    borderColor: '#FF6B35',
  },
  urgencyContent: {
    flex: 1,
  },
  urgencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  urgencyTitleSelected: {
    color: '#FF6B35',
  },
  urgencyDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 2,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  budgetInput: {
    flex: 1,
  },
  budgetSeparator: {
    width: 40,
    alignItems: 'center',
    paddingBottom: 12,
  },
  budgetSeparatorText: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#E74C3C',
  },
  errorText: {
    fontSize: 14,
    color: '#E74C3C',
    marginTop: 8,
  },
  submitSection: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  submitNote: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 16,
  },
  serviceInfoCard: {
    marginHorizontal: 24,
    marginVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  serviceInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceInfoIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  serviceInfoText: {
    flex: 1,
  },
  serviceInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  serviceInfoSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  serviceInfoDescription: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 16,
  },
  changeServiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  changeServiceText: {
    fontSize: 15,
    color: '#FF6B35',
    fontWeight: '600',
  },
});
