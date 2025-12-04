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
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button } from '../../src/components/Button';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import { jobsAPI, quotesAPI, profileAPI } from '../../src/services/api';
import { useAuth } from '../../src/contexts/AuthContext';
import { AddressForm } from '../../src/components/AddressForm';

interface JobRequestForm {
  serviceCategory: string;
  description: string;
  urgency: string;
  maxBudget: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
}
interface PhotoUpload {
  id: string;
  uri: string;
  status: 'uploading' | 'success' | 'failed';
  url?: string;
  error?: string;
}


const serviceCategories = [
  {
    id: 'drywall',
    title: 'Drywall',
    icon: 'hammer-outline',
    color: '#FF6B35',
    shortDesc: 'Patches, repairs, texturing',
    fullDesc: 'Professional drywall installation, repair, patching, and texturing services. We handle everything from small holes to full room installations, including taping, mudding, sanding, and texture matching.',
  },
  {
    id: 'painting',
    title: 'Painting',
    icon: 'brush-outline',
    color: '#4ECDC4',
    shortDesc: 'Interior, exterior, touch-ups',
    fullDesc: 'Expert painting services for interior and exterior projects. Includes surface preparation, priming, finish coats, trim work, and color consultation. Perfect for single rooms, whole homes, or touch-up projects.',
  },
  {
    id: 'electrical',
    title: 'Electrical',
    icon: 'flash-outline',
    color: '#45B7D1',
    shortDesc: 'Outlets, switches, fixtures',
    fullDesc: 'Licensed electrical services including outlet installation, switch replacement, light fixture installation, ceiling fan mounting, GFCI upgrades, and troubleshooting electrical issues. All work meets local building codes.',
  },
  {
    id: 'plumbing',
    title: 'Plumbing',
    icon: 'water-outline',
    color: '#96CEB4',
    shortDesc: 'Faucets, leaks, installations',
    fullDesc: 'Professional plumbing repairs and installations. Services include faucet replacement, leak repairs, toilet installation, sink mounting, garbage disposal installation, and drain cleaning. Emergency repairs available.',
  },
  {
    id: 'carpentry',
    title: 'Carpentry',
    icon: 'construct-outline',
    color: '#FECA57',
    shortDesc: 'Doors, trim, repairs',
    fullDesc: 'Custom carpentry and woodworking services. Specializing in door installation and repair, trim work, crown molding, baseboards, shelving, cabinet repairs, and general wood repairs. Quality craftsmanship guaranteed.',
  },
  {
    id: 'hvac',
    title: 'HVAC',
    icon: 'thermometer-outline',
    color: '#E67E22',
    shortDesc: 'Thermostats, filters, maintenance',
    fullDesc: 'Heating and cooling system services including thermostat installation, air filter replacement, basic maintenance, vent cleaning, and troubleshooting common HVAC issues. Keeping your home comfortable year-round.',
  },
  {
    id: 'flooring',
    title: 'Flooring',
    icon: 'grid-outline',
    color: '#8E44AD',
    shortDesc: 'Hardwood, tile, carpet repairs',
    fullDesc: 'Flooring installation and repair services. From hardwood refinishing to tile replacement, carpet repairs, and vinyl plank installation. We handle minor repairs and small flooring projects with expert craftsmanship.',
  },
  {
    id: 'roofing',
    title: 'Roofing',
    icon: 'home-outline',
    color: '#16A085',
    shortDesc: 'Shingles, gutters, leak repairs',
    fullDesc: 'Residential roofing repairs including shingle replacement, minor leak repairs, gutter cleaning and repair, flashing installation, and roof maintenance. Quick response for emergency roof repairs.',
  },
  {
    id: 'landscaping',
    title: 'Landscaping',
    icon: 'leaf-outline',
    color: '#27AE60',
    shortDesc: 'Fences, decks, outdoor work',
    fullDesc: 'Outdoor handyman services including fence installation and repair, deck maintenance, pressure washing, outdoor lighting, mailbox installation, and general yard improvements. Enhance your outdoor living spaces.',
  },
  {
    id: 'appliance',
    title: 'Appliance',
    icon: 'cube-outline',
    color: '#C0392B',
    shortDesc: 'Installation, repair, hookups',
    fullDesc: 'Appliance installation and hookup services for dishwashers, washing machines, dryers, microwaves, and more. Includes water line connections, electrical hookups, and proper venting. Get your appliances running smoothly.',
  },
  {
    id: 'windows',
    title: 'Windows & Doors',
    icon: 'square-outline',
    color: '#2980B9',
    shortDesc: 'Installation, screens, sealing',
    fullDesc: 'Window and door services including screen repair, weatherstripping, caulking and sealing, minor adjustments, lock replacement, and storm door installation. Improve energy efficiency and home security.',
  },
  {
    id: 'miscellaneous',
    title: 'Other',
    icon: 'build-outline',
    color: '#A29BFE',
    shortDesc: 'TV mounts, honey-do lists',
    fullDesc: 'General handyman services for those odd jobs around the house. TV mounting, furniture assembly, picture hanging, minor home repairs, and honey-do list items. If you need it done, we can help!',
  },
];

const urgencyOptions = [
  { id: 'flexible', title: 'Flexible', description: 'Within 2 weeks' },
  { id: 'normal', title: 'Normal', description: 'Within 1 week' },
  { id: 'urgent', title: 'Urgent', description: 'Within 2-3 days' },
];

// Cross-platform alert helper
const showAlert = (title: string, message: string, buttons?: any[]) => {
  if (Platform.OS === 'web') {
    alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message, buttons);
  }
};

export default function JobRequestScreen() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const { category } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [photos, setPhotos] = useState<PhotoUpload[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<JobRequestForm>({
    defaultValues: {
      serviceCategory: (category as string) || '',
      urgency: 'normal',
      maxBudget: '',
      street: user?.addresses?.[0]?.street || '',
      city: user?.addresses?.[0]?.city || '',
      state: user?.addresses?.[0]?.state || '',
      zipCode: user?.addresses?.[0]?.zipCode || '',
    },
  });
  
  const selectedCategory = watch('serviceCategory');
  const selectedUrgency = watch('urgency');

  // Get the selected service details
  const selectedService = useMemo(() => {
    return serviceCategories.find(s => s.id === selectedCategory);
  }, [selectedCategory]);

  // Upload with 30-second timeout
  const uploadPhotoWithTimeout = async (photoUri: string, photoId: string, fileName: string): Promise<string> => {
    const UPLOAD_TIMEOUT = 30000;

    const uploadPromise = quotesAPI.uploadPhotoImmediate(
      { uri: photoUri, type: 'image/jpeg', name: fileName },
      user?.id || 'guest'
    );

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Upload timed out after 30 seconds')), UPLOAD_TIMEOUT)
    );

    try {
      const result = await Promise.race([uploadPromise, timeoutPromise]);
      return result.url;
    } catch (error: any) {
      throw new Error(error.message || 'Upload failed');
    }
  };

  // Handle photo capture and immediate upload
  const handlePhotoCapture = async (photoUri: string, fileName: string) => {
    const photoId = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newPhoto: PhotoUpload = {
      id: photoId,
      uri: photoUri,
      status: 'uploading',
    };
    
    setPhotos(prev => [...prev, newPhoto]);

    try {
      const url = await uploadPhotoWithTimeout(photoUri, photoId, fileName);
      
      setPhotos(prev =>
        prev.map(p => p.id === photoId ? { ...p, status: 'success', url } : p)
      );
    } catch (error: any) {
      console.error('❌ Photo upload FAILED:', error);
      console.error('Error details:', { 
        message: error.message, 
        response: error.response?.data,
        status: error.response?.status 
      });
      
      setPhotos(prev =>
        prev.map(p => p.id === photoId ? { ...p, status: 'failed', error: error.message } : p)
      );
      
      showAlert(
        'Upload Failed',
        `Failed to upload photo: ${error.message}\n\nYou can retry or continue without this photo.`
      );
    }
  };

  // Retry failed upload
  const retryUpload = async (photoId: string) => {
    const photo = photos.find(p => p.id === photoId);
    if (!photo) return;

    setPhotos(prev =>
      prev.map(p => p.id === photoId ? { ...p, status: 'uploading', error: undefined } : p)
    );

    try {
      const fileName = `photo_${Date.now()}.jpg`;
      const url = await uploadPhotoWithTimeout(photo.uri, photoId, fileName);
      setPhotos(prev =>
        prev.map(p => p.id === photoId ? { ...p, status: 'success', url } : p)
      );
    } catch (error: any) {
      setPhotos(prev =>
        prev.map(p => p.id === photoId ? { ...p, status: 'failed', error: error.message } : p)
      );
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showAlert('Permission needed', 'Please allow access to photos to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,  // CHANGED: No base64!
      });

      if (!result.canceled && result.assets[0].uri) {
        const fileName = result.assets[0].fileName || `photo_${Date.now()}.jpg`;
        await handlePhotoCapture(result.assets[0].uri, fileName);  // CHANGED: Upload immediately!
      }
    } catch (error) {
      showAlert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        showAlert('Permission needed', 'Please allow access to camera to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,  // CHANGED: No base64!
      });

      if (!result.canceled && result.assets[0].uri) {
        const fileName = `photo_${Date.now()}.jpg`;
        await handlePhotoCapture(result.assets[0].uri, fileName);  // CHANGED: Upload immediately!
      }
    } catch (error) {
      showAlert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const removePhoto = (photoId: string) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  const onSubmit = async (data: JobRequestForm) => {
    if (!data.serviceCategory) {
      showAlert('Error', 'Please select a service category');
      return;
    }

    // Validate address fields
    if (!data.street || !data.city || !data.state || !data.zipCode) {
      showAlert('Error', 'Please provide a complete service address');
      return;
    }

    const uploadingPhotos = photos.filter(p => p.status === 'uploading');
    if (uploadingPhotos.length > 0) {
      showAlert(
        'Photos Uploading',
        'Please wait for photos to finish uploading before submitting.'
      );
      return;
    }

    try {
      setIsLoading(true);

      // Check if address matches an existing saved address
      const existingAddress = user?.addresses?.find(
        addr =>
          addr.street === data.street &&
          addr.city === data.city &&
          addr.state === data.state &&
          addr.zipCode === data.zipCode
      );

      // If no matching address, save the new address to profile for future use
      if (!existingAddress) {
        console.log('Saving new address to profile for future use...');
        const addressData = {
          street: data.street,
          city: data.city,
          state: data.state,
          zip_code: data.zipCode,
          is_default: !user?.addresses || user.addresses.length === 0,
        };

        try {
          await profileAPI.addAddress(addressData);
          console.log('Address saved to profile');

          // Try to refresh user data to include new address
          try {
            await refreshUser();
          } catch (refreshError) {
            console.warn('Could not refresh user after saving address');
          }
        } catch (addressError: any) {
          console.warn('Could not save address to profile:', addressError);
          // Continue with job creation even if address save fails
        }
      }

      // Create job request with embedded address (not address_id)
      const jobRequest = {
        service_category: data.serviceCategory,
        address: {
          street: data.street,
          city: data.city,
          state: data.state,
          zip: data.zipCode,
        },
        description: data.description,
        photos: photos.filter(p => p.status === 'success' && p.url).map(p => p.url!),
        preferred_timing: null,
        budget_max: parseFloat(data.maxBudget) || null,
        urgency: data.urgency,
        status: 'published', // Changed from 'requested' to 'published' to match JobStatus enum
      };

      const response = await jobsAPI.createJob(jobRequest);
      console.log('Job response:', response);

      showAlert(
        'Job Request Submitted!',
        `Your job request has been submitted successfully. Job ID: ${response.job_id}.\n\nWe'll match you with an available contractor and send you updates soon.`,
        [
          {
            text: 'View Jobs',
            onPress: () => router.push('/home'),
          },
          {
            text: 'OK',
            onPress: () => router.push('/home'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Job request error:', error);
      showAlert(
        'Request Failed',
        error.response?.data?.detail || error.message || 'Please try again later'
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
            <Text style={styles.title}>Create Job Request</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Selected Service Display */}
          {selectedService && (
            <View style={styles.selectedServiceSection}>
              <View style={[styles.selectedServiceIcon, { backgroundColor: `${selectedService.color}20` }]}>
                <Ionicons
                  name={selectedService.icon as any}
                  size={48}
                  color={selectedService.color}
                />
              </View>
              <Text style={styles.selectedServiceTitle}>{selectedService.title}</Text>
              <Text style={styles.selectedServiceDescription}>{selectedService.fullDesc}</Text>
              
              <TouchableOpacity
                style={styles.changeServiceButton}
                onPress={() => setValue('serviceCategory', '')}
              >
                <Text style={styles.changeServiceText}>Change Service</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Service Category Selection (only show if none selected) */}
          {!selectedService && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What do you need help with?</Text>
              <View style={styles.categoryGrid}>
                {serviceCategories.map((service) => (
                  <TouchableOpacity
                    key={service.id}
                    style={styles.categoryCard}
                    onPress={() => setValue('serviceCategory', service.id)}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: `${service.color}20` }]}>
                      <Ionicons
                        name={service.icon as any}
                        size={24}
                        color={service.color}
                      />
                    </View>
                    <Text style={styles.categoryTitle}>{service.title}</Text>
                    <Text style={styles.categoryDesc}>{service.shortDesc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.serviceCategory && (
                <Text style={styles.errorText}>Please select a service category</Text>
              )}
            </View>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Describe the work needed</Text>
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

          {/* Service Address */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Address</Text>
            <Text style={styles.sectionDescription}>
              Where should the contractor come to do the work?
            </Text>
            <View style={styles.addressFormContainer}>
              <AddressForm
                control={control}
                errors={errors}
                setValue={setValue}
                defaultValues={
                  user?.addresses && user.addresses.length > 0
                    ? {
                        street: user.addresses[0].street,
                        city: user.addresses[0].city,
                        state: user.addresses[0].state,
                        zipCode: user.addresses[0].zipCode,
                      }
                    : undefined
                }
                showUnitNumber={false}
              />
            </View>
          </View>

          {/* Photos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add Photos (Optional)</Text>
            <Text style={styles.sectionDescription}>
              Photos help contractors understand your project better
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
                  <View key={photo.id} style={styles.photoItem}>
                    <TouchableOpacity
                      onPress={() => removePhoto(photo.id)}
                      style={styles.removePhoto}
                    >
                      <Ionicons name="close" size={16} color="#fff" />
                    </TouchableOpacity>
                    
                    <View style={[
                      styles.photoPlaceholder,
                      photo.status === 'success' && styles.photoSuccess,
                      photo.status === 'failed' && styles.photoFailed,
                    ]}>
                      {/* Show the actual image thumbnail */}
                      <Image 
                        source={{ uri: photo.uri }} 
                        style={styles.photoThumbnail}
                        resizeMode="cover"
                      />
                      
                      {/* Overlay status indicators */}
                      {photo.status === 'uploading' && (
                        <View style={styles.photoOverlay}>
                          <ActivityIndicator size="small" color="#fff" />
                          <Text style={styles.photoOverlayText}>Uploading...</Text>
                        </View>
                      )}
                      {photo.status === 'success' && (
                        <View style={styles.photoSuccessOverlay}>
                          <Ionicons name="checkmark-circle" size={20} color="#fff" />
                        </View>
                      )}
                      {photo.status === 'failed' && (
                        <View style={styles.photoOverlay}>
                          <Ionicons name="alert-circle" size={24} color="#fff" />
                          <Text style={styles.photoOverlayText}>Failed</Text>
                          <TouchableOpacity
                            onPress={() => retryUpload(photo.id)}
                            style={styles.retryButton}
                          >
                            <Text style={styles.retryText}>Retry</Text>
                          </TouchableOpacity>
                        </View>
                      )}
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

          {/* Maximum Budget */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Maximum Budget (Optional)</Text>
            <Text style={styles.sectionDescription}>
              Help us provide options within your budget
            </Text>
            <Controller
              control={control}
              name="maxBudget"
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

          {/* Submit */}
          <View style={styles.submitSection}>
            <Button
              title="Submit Job Request"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              fullWidth
              size="large"
              icon={<Ionicons name="hammer" size={20} color="#fff" />}
            />
            <Text style={styles.submitNote}>
              We'll match you with an available contractor and send you updates within 24 hours.
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
  selectedServiceSection: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    alignItems: 'center',
  },
  selectedServiceIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedServiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  selectedServiceDescription: {
    fontSize: 15,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  changeServiceButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  changeServiceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
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
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryDesc: {
    fontSize: 10,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 12,
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
  photoSuccess: {
    backgroundColor: '#E8F8F0',
    borderColor: '#27AE60',
  },
  photoFailed: {
    backgroundColor: '#FDECEA',
    borderColor: '#E74C3C',
  },
  photoTextSuccess: {
    fontSize: 10,
    color: '#27AE60',
    marginTop: 4,
  },
  photoTextFailed: {
    fontSize: 10,
    color: '#E74C3C',
    marginTop: 4,
  },
  retryButton: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#E74C3C',
    borderRadius: 4,
  },
  retryText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: '600',
  },
  photoText: {
    fontSize: 10,
    color: '#7F8C8D',
    marginTop: 4,
  },
  photoThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  photoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoSuccessOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(39, 174, 96, 0.9)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoOverlayText: {
    fontSize: 10,
    color: '#fff',
    marginTop: 4,
    fontWeight: '600',
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
  addressFormContainer: {
    marginTop: 12,
  },
});
