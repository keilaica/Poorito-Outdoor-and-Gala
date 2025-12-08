import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../services/api';

function MountainForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    elevation: '',
    location: '',
    difficulty: 'Easy',
    status: 'backtrail',
    trip_duration: 1,
    duration: '',
    distance_km: '',
    base_price_per_head: 1599.00,
    joiner_capacity: 14,
    exclusive_price: null,
    is_joiner_available: true,
    is_exclusive_available: true
  });
  const [images, setImages] = useState([null, null, null, null]);
  const [thingsToBring, setThingsToBring] = useState(['']);
  const [hikeItinerary, setHikeItinerary] = useState([{ title: '', description: '', location: '', time: '' }]);
  const [fees, setFees] = useState({
    environmentalFee: '',
    registrationFee: '',
    guideCampingFee: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const isInitialLoad = useRef(true);
  const formInitialState = useRef(null);
  const isNavigatingRef = useRef(false);
  const errorRef = useRef(null);

  // Create a wrapper for navigate that checks for unsaved changes
  const navigateWithCheck = (path, options) => {
    if (hasUnsavedChanges && !isNavigatingRef.current) {
      setPendingNavigation({ path, options });
      setShowLeaveConfirm(true);
      return;
    }
    isNavigatingRef.current = true;
    navigate(path, options);
  };

  // Handle confirmation to leave
  const handleConfirmLeave = () => {
    setShowLeaveConfirm(false);
    isNavigatingRef.current = true;
    if (pendingNavigation) {
      if (pendingNavigation.path === 'back') {
        // Handle browser back navigation
        window.history.back();
      } else {
        navigate(pendingNavigation.path, pendingNavigation.options);
      }
      setPendingNavigation(null);
    }
  };

  // Handle cancel leaving
  const handleCancelLeave = () => {
    setShowLeaveConfirm(false);
    setPendingNavigation(null);
  };

  // Track form changes
  useEffect(() => {
    if (isInitialLoad.current) {
      // Set initial state after data is loaded
      setTimeout(() => {
        formInitialState.current = {
          formData: JSON.stringify(formData),
          images: JSON.stringify(images),
          thingsToBring: JSON.stringify(thingsToBring),
          hikeItinerary: JSON.stringify(hikeItinerary),
          fees: JSON.stringify(fees)
        };
        isInitialLoad.current = false;
      }, 100);
      return;
    }

    // Check if form has changed
    const currentState = {
      formData: JSON.stringify(formData),
      images: JSON.stringify(images),
      thingsToBring: JSON.stringify(thingsToBring),
      hikeItinerary: JSON.stringify(hikeItinerary),
      fees: JSON.stringify(fees)
    };

    const hasChanged = formInitialState.current && 
      JSON.stringify(currentState) !== JSON.stringify(formInitialState.current);
    
    setHasUnsavedChanges(hasChanged);
  }, [formData, images, thingsToBring, hikeItinerary, fees]);

  // Handle browser back/close/refresh
  useEffect(() => {
    if (!hasUnsavedChanges) {
      return;
    }

    const handleBeforeUnload = (e) => {
      if (!isNavigatingRef.current) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    // Handle browser back/forward buttons
    const handlePopState = (e) => {
      if (!isNavigatingRef.current) {
        // Immediately push state back to prevent navigation
        window.history.pushState(null, '', window.location.pathname);
        
        // Show custom confirmation modal
        setPendingNavigation({ path: 'back', options: null });
        setShowLeaveConfirm(true);
        // If user cancels, we've already pushed the state back, so they stay on the page
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges]);

  // Set up history state tracking (only once on mount)
  useEffect(() => {
    // Push a state when component mounts to enable popstate detection
    window.history.pushState(null, '', window.location.pathname);
    
    return () => {
      // Reset navigation flag when component unmounts
      isNavigatingRef.current = false;
    };
  }, []);

  // Scroll to top when error occurs
  useEffect(() => {
    if (error && errorRef.current) {
      // Scroll to the error message smoothly
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Also scroll window to top as fallback
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [error]);

  // Load mountain data if editing
  useEffect(() => {
    const loadMountainData = async () => {
      if (!isEdit || !id) {
        // For new mountain, set initial state after component mounts
        setTimeout(() => {
          formInitialState.current = {
            formData: JSON.stringify(formData),
            images: JSON.stringify(images),
            thingsToBring: JSON.stringify(thingsToBring),
            hikeItinerary: JSON.stringify(hikeItinerary),
            fees: JSON.stringify(fees)
          };
          isInitialLoad.current = false;
        }, 100);
        return;
      }
      
      try {
        setLoadingData(true);
        const response = await apiService.getMountain(id);
        const mountain = response.mountain;
        
        console.log('Loaded mountain data:', mountain);
        
      if (mountain) {
        setFormData({
          name: mountain.name || '',
          description: mountain.description || '',
          elevation: mountain.elevation || '',
          location: mountain.location || '',
          difficulty: mountain.difficulty || 'Easy',
          status: mountain.status || 'backtrail',
          trip_duration: mountain.trip_duration || 1,
          duration: mountain.duration || '',
          distance_km: mountain.distance_km != null && mountain.distance_km !== '' ? mountain.distance_km : '',
          base_price_per_head: mountain.base_price_per_head || 1599.00,
          joiner_capacity: mountain.joiner_capacity || 14,
          exclusive_price: mountain.exclusive_price !== undefined && mountain.exclusive_price !== null 
            ? (typeof mountain.exclusive_price === 'number' ? mountain.exclusive_price : parseFloat(mountain.exclusive_price) || null)
            : null,
          is_joiner_available: mountain.is_joiner_available !== undefined ? mountain.is_joiner_available : true,
          is_exclusive_available: mountain.is_exclusive_available !== undefined ? mountain.is_exclusive_available : true
        });
        
        // Load existing images if available
        const loadedImages = [null, null, null, null];
        if (mountain.image_url) {
          loadedImages[0] = mountain.image_url;
          console.log('Loaded main image');
        }
        // Load additional images
        if (mountain.additional_images && Array.isArray(mountain.additional_images)) {
          console.log('Loading additional images:', mountain.additional_images.length);
          mountain.additional_images.forEach((img, index) => {
            if (index < 3) { // Max 3 additional images
              loadedImages[index + 1] = img;
              console.log(`Loaded additional image ${index + 1} to slot ${index + 1}`);
            }
          });
        } else {
          console.log('No additional_images found or not an array:', mountain.additional_images);
        }
        console.log('Final loaded images state:', loadedImages.map((img, i) => ({ slot: i, hasImage: !!img })));
        setImages(loadedImages);

        // Load existing mountain details
        console.log('what_to_bring data:', mountain.what_to_bring);
        if (mountain.what_to_bring && Array.isArray(mountain.what_to_bring)) {
          const items = mountain.what_to_bring.map(item => item.item_name || '');
          console.log('Setting things to bring:', items);
          setThingsToBring(items.length > 0 ? items : ['']);
        }

        console.log('itinerary data:', mountain.itinerary);
        if (mountain.itinerary && Array.isArray(mountain.itinerary)) {
          const itineraryItems = mountain.itinerary.map(item => ({
            title: item.item_name || '',
            description: item.item_description || '',
            location: item.item_location || '', // Load location field
            time: item.item_time || ''
          }));
          console.log('Setting hike itinerary:', itineraryItems);
          setHikeItinerary(itineraryItems.length > 0 ? itineraryItems : [{ title: '', description: '', location: '', time: '' }]);
        }

        console.log('budgeting data:', mountain.budgeting);

        // Load existing fee data
        if (mountain.budgeting && Array.isArray(mountain.budgeting)) {
          const feeData = {
            environmentalFee: '',
            registrationFee: '',
            guideCampingFee: ''
          };
          
          mountain.budgeting.forEach(item => {
            if (item.item_name === 'Environmental Fee') {
              feeData.environmentalFee = (item.item_amount !== null && item.item_amount !== undefined) ? item.item_amount.toString() : '';
            } else if (item.item_name === 'Overtime Fee' || item.item_name === 'Registration Fee') {
              // Support both old "Registration Fee" and new "Overtime Fee" names
              feeData.registrationFee = (item.item_amount !== null && item.item_amount !== undefined) ? item.item_amount.toString() : '';
            } else if (item.item_name === 'Food Stub' || item.item_name === 'Over Time Fee' || item.item_name === 'Guide/Camping Fee') {
              // Support old names: "Over Time Fee" and "Guide/Camping Fee", and new "Food Stub"
              feeData.guideCampingFee = (item.item_amount !== null && item.item_amount !== undefined) ? item.item_amount.toString() : '';
            }
          });
          
          console.log('Setting fees:', feeData);
          setFees(feeData);
        }
        
        console.log('✅ Mountain data loading completed for all sections');
        
        // Set initial state after data is loaded
        setTimeout(() => {
          formInitialState.current = {
            formData: JSON.stringify(formData),
            images: JSON.stringify(images),
            thingsToBring: JSON.stringify(thingsToBring),
            hikeItinerary: JSON.stringify(hikeItinerary),
            fees: JSON.stringify(fees)
          };
          isInitialLoad.current = false;
        }, 100);
      }
      } catch (err) {
        console.error('Error loading mountain:', err);
        setError('Failed to load mountain data');
      } finally {
        setLoadingData(false);
      }
    };

    loadMountainData();
  }, [isEdit, id]);

  const handleImageChange = (index, event) => {
    const file = event.target.files[0];
    if (file) {
      console.log(`Uploading image to slot ${index}:`, {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImages = [...images];
        newImages[index] = reader.result;
        setImages(newImages);
        console.log(`Image ${index} loaded successfully. Total images:`, {
          slot: index,
          hasImage: !!newImages[index],
          imageLength: newImages[index] ? newImages[index].length : 0,
          allImages: newImages.map((img, i) => ({ slot: i, hasImage: !!img }))
        });
      };
      reader.onerror = (error) => {
        console.error(`Error reading image ${index}:`, error);
        setError(`Failed to load image: ${file.name}`);
      };
      reader.readAsDataURL(file);
    } else {
      console.log(`No file selected for slot ${index}`);
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);
  };

  const addThingToBring = () => {
    setThingsToBring([...thingsToBring, '']);
  };

  const addHikeItinerary = () => {
    setHikeItinerary([...hikeItinerary, { title: '', description: '', location: '', time: '' }]);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFeeChange = (feeType, value) => {
    setFees(prev => ({
      ...prev,
      [feeType]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!formData.name || !formData.location || !formData.elevation) {
        setError('Please fill in all required fields (Name, Location, Elevation)');
        setLoading(false);
        return;
      }

      // Validate exclusive_price if provided (must be >= 0)
      if (formData.exclusive_price !== null && formData.exclusive_price !== undefined && formData.exclusive_price !== '') {
        const exclusivePriceValue = parseFloat(formData.exclusive_price);
        if (isNaN(exclusivePriceValue)) {
          setError('Exclusive price must be a valid number');
          setLoading(false);
          return;
        }
        if (exclusivePriceValue < 0) {
          setError('Exclusive price must be greater than or equal to 0');
          setLoading(false);
          return;
        }
      }

      // Prepare all mountain data including details in one call
      const whatToBringData = thingsToBring
        .filter(item => item && item.trim() !== '')
        .map((item, index) => ({
          id: Date.now() + index, // Generate unique ID
          item_name: item.trim(),
          item_description: '',
          item_icon: '📦', // Default icon
          sort_order: index + 1
        }));

      const itineraryData = hikeItinerary
        .filter(item => item && (item.title || item.description || item.location || item.time))
        .map((item, index) => ({
          id: Date.now() + 200 + index,
          item_name: item.title || '',
          item_description: item.description || '',
          item_location: item.location || '',
          item_time: item.time || '',
          item_duration: '2-3 hours', // Default duration
          sort_order: index + 1
        }));

      const mountainDetails = {
        what_to_bring: whatToBringData,
        budgeting: [
          { 
            id: Date.now() + 100, 
            item_name: 'Environmental Fee', 
            item_amount: fees.environmentalFee && fees.environmentalFee.trim() !== '' ? parseFloat(fees.environmentalFee) : 0, 
            item_unit: 'per person', 
            sort_order: 1 
          },
          { 
            id: Date.now() + 101, 
            item_name: 'Overtime Fee', 
            item_amount: fees.registrationFee && fees.registrationFee.trim() !== '' ? parseFloat(fees.registrationFee) : 0, 
            item_unit: 'per person', 
            sort_order: 2 
          },
          { 
            id: Date.now() + 102, 
            item_name: 'Food Stub', 
            item_amount: fees.guideCampingFee && fees.guideCampingFee.trim() !== '' ? parseFloat(fees.guideCampingFee) : 0, 
            item_unit: 'per person', 
            sort_order: 3 
          }
        ],
        itinerary: itineraryData
      };

      // Debug logging for mountain details
      console.log('Mountain details being saved:', {
        what_to_bring: {
          count: whatToBringData.length,
          items: whatToBringData.map(item => item.item_name)
        },
        budgeting: {
          count: mountainDetails.budgeting.length,
          items: mountainDetails.budgeting.map(item => ({ name: item.item_name, amount: item.item_amount }))
        },
        itinerary: {
          count: itineraryData.length,
          items: itineraryData.map(item => ({ title: item.item_name, description: item.item_description, location: item.item_location, time: item.item_time }))
        }
      });

      // Filter out null images and prepare additional images array
      // Keep all images from slots 1-3 (indices 1-3), preserving order
      const additionalImages = images.slice(1, 4).filter(img => img !== null && img !== undefined);
      
      console.log('Images state before save:', {
        total: images.length,
        main: images[0] ? 'Present' : 'Missing',
        additional: additionalImages.length,
          allSlots: images.map((img, idx) => ({
            slot: idx,
            hasImage: !!img,
            isMain: idx === 0,
            isAdditional: idx > 0 && idx < 4,
            imageType: img ? (img.startsWith('data:') ? 'base64' : 'url') : 'null'
          })),
        additionalDetails: additionalImages.map((img, idx) => ({
          index: idx + 1,
          length: img ? img.length : 0,
          preview: img ? img.substring(0, 50) + '...' : 'null',
          startsWithData: img ? img.startsWith('data:') : false
        }))
      });
      
      // Validate that additional images are valid base64 strings
      const invalidImages = additionalImages.filter(img => !img || !img.startsWith('data:'));
      if (invalidImages.length > 0) {
        console.warn('⚠️ Some additional images are not valid base64 strings:', invalidImages.length);
      }
      
      const mountainData = {
        name: formData.name,
        description: formData.description,
        elevation: parseInt(formData.elevation),
        location: formData.location,
        difficulty: formData.difficulty,
        status: formData.status || 'backtrail',
        trip_duration: parseInt(formData.trip_duration) || 1,
        duration: (formData.duration === '' || formData.duration === null || formData.duration === undefined) ? null : formData.duration.trim(),
        distance_km: (formData.distance_km === '' || formData.distance_km === null || formData.distance_km === undefined)
          ? null
          : (isNaN(parseFloat(formData.distance_km)) ? null : parseFloat(formData.distance_km)),
        base_price_per_head: parseFloat(formData.base_price_per_head) || 1599.00,
        joiner_capacity: parseInt(formData.joiner_capacity) || 14,
        exclusive_price: (() => {
          if (formData.exclusive_price === null || formData.exclusive_price === undefined || formData.exclusive_price === '') {
            return null;
          }
          const parsed = parseFloat(formData.exclusive_price);
          return isNaN(parsed) ? null : parsed;
        })(),
        is_joiner_available: formData.is_joiner_available,
        is_exclusive_available: formData.is_exclusive_available,
        image_url: images[0] || null, // Send the first image as the main image
        additional_images: additionalImages, // Send additional images as array (always an array, even if empty)
        ...mountainDetails // Include all details in the same request
      };
      
      // Final validation - ensure additional_images is always an array
      if (!Array.isArray(mountainData.additional_images)) {
        console.error('❌ ERROR: additional_images is not an array!', typeof mountainData.additional_images);
        mountainData.additional_images = [];
      }

      // Debug: Log the data being sent
      console.log('Sending mountain data:', {
        ...mountainData,
        distance_km: mountainData.distance_km,
        distance_km_type: typeof mountainData.distance_km,
        image_url: images[0] ? `${images[0].substring(0, 50)}...` : 'No image',
        exclusive_price: mountainData.exclusive_price,
        exclusive_price_type: typeof mountainData.exclusive_price,
        exclusive_price_raw: formData.exclusive_price,
        additional_images_count: additionalImages.length,
        additional_images_preview: additionalImages.map(img => img ? img.substring(0, 30) + '...' : 'null'),
        rightSideImages: images.slice(1).map((img, idx) => ({
          slot: idx + 1,
          hasImage: !!img,
          willBeSaved: !!img
        })),
        fees_debug: {
          environmentalFee: fees.environmentalFee,
          registrationFee: fees.registrationFee,
          guideCampingFee: fees.guideCampingFee,
          budgeting: mountainData.budgeting
        },
        what_to_bring_debug: {
          original_count: thingsToBring.length,
          original_items: thingsToBring,
          filtered_count: mountainData.what_to_bring ? mountainData.what_to_bring.length : 0,
          filtered_items: mountainData.what_to_bring
        },
        itinerary_debug: {
          original_count: hikeItinerary.length,
          original_items: hikeItinerary,
          filtered_count: mountainData.itinerary ? mountainData.itinerary.length : 0,
          filtered_items: mountainData.itinerary
        }
      });
      
      // Validate that additional images are being sent
      if (additionalImages.length > 0) {
        console.log(`✅ ${additionalImages.length} additional image(s) will be saved to the database`);
      } else {
        console.log('ℹ️ No additional images to save (only main image will be saved)');
      }

      let mountainId;
      if (isEdit) {
        console.log('Calling updateMountain API...');
        const response = await apiService.updateMountain(id, mountainData);
        console.log('Update response:', response);
        
        // Verify the response includes the images
        if (response && response.mountain) {
          console.log('✅ Mountain updated! Response data:', {
            id: response.mountain.id,
            has_image_url: !!response.mountain.image_url,
            additional_images_count: response.mountain.additional_images 
              ? response.mountain.additional_images.length 
              : 0,
            additional_images: response.mountain.additional_images
          });
          
          // Warn if images weren't saved
          if (additionalImages.length > 0 && (!response.mountain.additional_images || response.mountain.additional_images.length === 0)) {
            console.warn('⚠️ WARNING: Additional images were sent but not saved!');
            console.warn('This usually means the database column does not exist.');
            console.warn('Run this SQL in Supabase:');
            console.warn('ALTER TABLE mountains ADD COLUMN IF NOT EXISTS additional_images JSONB DEFAULT \'[]\'::jsonb;');
          }
        }
        mountainId = id;
      } else {
        const response = await apiService.createMountain(mountainData);
        mountainId = response.mountain.id;
      }

      // Reset unsaved changes flag before navigation
      setHasUnsavedChanges(false);
      isNavigatingRef.current = true;
      
      navigate('/admin/mountains', {
        state: {
          success: isEdit
            ? 'Mountain updated successfully!'
            : 'Mountain created successfully!'
        }
      });
    } catch (err) {
      console.error('❌ Error saving mountain:', err);
      console.error('Error details:', err.message);
      console.error('Full error:', err);
      
      // Check if error mentions database column
      if (err.message && (err.message.includes('additional_images') || err.message.includes('column') || err.message.includes('does not exist'))) {
        setError('Database column missing! Please run the migration SQL in Supabase first. Check browser console (F12) for the SQL command.');
        console.error('⚠️ MIGRATION REQUIRED: Run this SQL in Supabase SQL Editor:');
        console.error('ALTER TABLE mountains ADD COLUMN IF NOT EXISTS additional_images JSONB DEFAULT \'[]\'::jsonb;');
        console.error('ALTER TABLE mountains ALTER COLUMN image_url TYPE TEXT;');
      } else {
        setError(err.message || 'Failed to save mountain. Please check console for details and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // saveMountainDetails function removed - details are now saved in the main handleSave function

  if (loadingData) {
    return (
      <div className="space-y-6 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading mountain data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-gray-900">{isEdit ? 'Edit Mountain' : 'Add New Mountain'}</h1>
        <button 
          className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors text-sm font-medium"
          onClick={() => navigateWithCheck('/admin/mountains')}
        >
          ← Back to manage mountains
        </button>
      </div>

      {error && (
        <div ref={errorRef} className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-500 text-2xl mr-3">⚠️</div>
            <div>
              <h3 className="text-red-800 font-semibold">Error</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 space-y-8">
        <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wide border-b pb-3">Title</h2>
        
        {/* Image Upload Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <label htmlFor="image-0" className="cursor-pointer">
              {images[0] ? (
                <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden group">
                  <img src={images[0]} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => { e.preventDefault(); removeImage(0); }}
                  >
                    🗑️
                  </button>
                </div>
              ) : (
                <div className="aspect-video bg-blue-50 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-blue-300 hover:border-primary transition-colors">
                  <div className="text-6xl mb-2">☁️</div>
                  <div className="text-6xl">⛰️</div>
                  <p className="text-gray-500 mt-4">Click to upload main image</p>
                </div>
              )}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(0, e)}
              className="hidden"
              id="image-0"
            />
          </div>
          
          <div className="space-y-4">
            {images.slice(1).map((image, index) => (
              <div key={index + 1}>
                <label htmlFor={`image-${index + 1}`} className="cursor-pointer">
                  {image ? (
                    <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden group">
                      <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                      <button 
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeImage(index + 1); }}
                        type="button"
                      >
                        🗑️
                      </button>
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-primary transition-colors">
                      <span className="text-3xl text-gray-400">+</span>
                    </div>
                  )}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    handleImageChange(index + 1, e);
                    // Reset input so same file can be selected again
                    e.target.value = '';
                  }}
                  className="hidden"
                  id={`image-${index + 1}`}
                />
              </div>
            ))}
            <div className="text-center text-sm text-gray-500 font-medium">
              {images.filter(img => img !== null).length}/4
              {images.slice(1).filter(img => img !== null).length > 0 && (
                <div className="text-xs text-green-600 mt-1">
                  {images.slice(1).filter(img => img !== null).length} additional image{images.slice(1).filter(img => img !== null).length > 1 ? 's' : ''} ready to save
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="mountain-name" className="block text-sm font-medium text-gray-700 mb-2">
            Mountain Name <span className="text-red-500">*</span>
          </label>
          <input 
            id="mountain-name"
            type="text" 
            placeholder="Mountain Name *" 
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </div>
        
        <div>
          <label htmlFor="mountain-description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea 
            id="mountain-description"
            placeholder="Description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)} 
            rows="4"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="mountain-elevation" className="block text-sm font-medium text-gray-700 mb-2">
              Elevation (MASL) <span className="text-red-500">*</span>
            </label>
            <input 
              id="mountain-elevation"
              type="number" 
              placeholder="Elevation (MASL) *" 
              value={formData.elevation}
              onChange={(e) => handleInputChange('elevation', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
          <div>
            <label htmlFor="mountain-location" className="block text-sm font-medium text-gray-700 mb-2">
              Location <span className="text-red-500">*</span>
            </label>
            <input 
              id="mountain-location"
              type="text" 
              placeholder="Location *" 
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
          <div>
            <label htmlFor="mountain-difficulty" className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <select 
              id="mountain-difficulty"
              value={formData.difficulty}
              onChange={(e) => handleInputChange('difficulty', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
              <option value="Expert">Expert</option>
            </select>
          </div>
          <div>
            <label htmlFor="mountain-status" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select 
              id="mountain-status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            >
              <option value="backtrail">backtrail</option>
              <option value="traverse">traverse</option>
              <option value="loop">loop</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="mountain-duration" className="block text-sm font-medium text-gray-700 mb-2">
              Duration
            </label>
            <input 
              id="mountain-duration"
              type="text" 
              placeholder="e.g., 10-14 hours" 
              value={formData.duration}
              onChange={(e) => handleInputChange('duration', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">
              Hike duration (e.g., "10-14 hours" or "10 hours")
            </p>
          </div>

          <div>
            <label htmlFor="mountain-distance-km" className="block text-sm font-medium text-gray-700 mb-2">
              Distance (KM)
            </label>
            <input 
              id="mountain-distance-km"
              type="number" 
              step="0.01"
              name="distance_km"
              placeholder="Distance in kilometers" 
              value={formData.distance_km}
              onChange={(e) => handleInputChange('distance_km', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">
              Distance in kilometers
            </p>
          </div>
        </div>

        {/* Trip Duration */}
        <div className="max-w-sm">
          <label htmlFor="mountain-trip-duration" className="block text-sm font-medium text-gray-700 mb-2">
            Trip Duration (days) <span className="text-red-500">*</span>
          </label>
          <input 
            id="mountain-trip-duration"
            type="number" 
            min="1"
            max="30"
            placeholder="Trip Duration (days)" 
            value={formData.trip_duration}
            onChange={(e) => handleInputChange('trip_duration', parseInt(e.target.value) || 1)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
          <p className="text-xs text-gray-500 mt-1">
            Number of days for the trip. End date will be automatically calculated as Start Date + Trip Duration.
          </p>
        </div>

        {/* Pricing Section */}
        <div className="space-y-4 pt-6 border-t">
          <h3 className="text-lg font-semibold text-gray-700">Pricing & Availability</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="base-price-per-head" className="block text-sm font-medium text-gray-700 mb-2">
                Base Price Per Head (₱) <span className="text-red-500">*</span>
              </label>
              <input 
                id="base-price-per-head"
                type="number" 
                step="0.01"
                min="0"
                placeholder="1599.00" 
                value={formData.base_price_per_head}
                onChange={(e) => handleInputChange('base_price_per_head', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">
                Base price for 1 day, 1 pax (in PHP)
              </p>
            </div>
            <div>
              <label htmlFor="joiner-capacity" className="block text-sm font-medium text-gray-700 mb-2">
                Joiner Capacity (pax) <span className="text-red-500">*</span>
              </label>
              <input 
                id="joiner-capacity"
                type="number" 
                min="1"
                placeholder="14" 
                value={formData.joiner_capacity}
                onChange={(e) => handleInputChange('joiner_capacity', parseInt(e.target.value) || 14)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum number of participants for joiner hikes
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="exclusive-price" className="block text-sm font-medium text-gray-700 mb-2">
                Exclusive Price (₱)
              </label>
              <input 
                id="exclusive-price"
                type="number" 
                step="0.01"
                min="0"
                placeholder="25000.00" 
                value={formData.exclusive_price !== null && formData.exclusive_price !== undefined ? formData.exclusive_price : ''}
                onChange={(e) => {
                  const value = e.target.value;
                  // Keep as string or number, but ensure we can parse it later
                  handleInputChange('exclusive_price', value === '' ? null : value);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">
                Fixed total price for exclusive hike
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <input 
                id="is-joiner-available"
                type="checkbox" 
                checked={formData.is_joiner_available}
                onChange={(e) => handleInputChange('is_joiner_available', e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="is-joiner-available" className="ml-2 text-sm font-medium text-gray-700">
                Joiner hikes available
              </label>
            </div>
            <div className="flex items-center">
              <input 
                id="is-exclusive-available"
                type="checkbox" 
                checked={formData.is_exclusive_available}
                onChange={(e) => handleInputChange('is_exclusive_available', e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="is-exclusive-available" className="ml-2 text-sm font-medium text-gray-700">
                Exclusive hikes available
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Things to Bring</h3>
            {thingsToBring.map((item, index) => (
              <div key={index}>
                <label htmlFor={`thing-to-bring-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                  Item {index + 1}
                </label>
                <input 
                  id={`thing-to-bring-${index}`}
                  type="text" 
                  placeholder="Item" 
                  value={item}
                  onChange={(e) => {
                    const newItems = [...thingsToBring];
                    newItems[index] = e.target.value;
                    setThingsToBring(newItems);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
            ))}
            <button 
              onClick={addThingToBring}
              className="w-12 h-12 bg-secondary hover:bg-green-700 text-white rounded-lg text-2xl font-bold transition-all shadow-sm hover:shadow-md"
            >
              +
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Fees</h3>
            <div>
              <label htmlFor="environmental-fee" className="block text-sm font-medium text-gray-700 mb-2">
                Environmental Fee
              </label>
              <input 
                id="environmental-fee"
                type="number" 
                placeholder="Environmental Fee" 
                value={fees.environmentalFee}
                onChange={(e) => handleFeeChange('environmentalFee', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label htmlFor="registration-fee" className="block text-sm font-medium text-gray-700 mb-2">
                Overtime Fee <span className="text-gray-500 font-normal">(optional)</span>
              </label>
              <input 
                id="registration-fee"
                type="number" 
                placeholder="Overtime Fee (optional)" 
                value={fees.registrationFee}
                onChange={(e) => handleFeeChange('registrationFee', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label htmlFor="guide-camping-fee" className="block text-sm font-medium text-gray-700 mb-2">
                Food Stub <span className="text-gray-500 font-normal">(optional)</span>
              </label>
              <input 
                id="guide-camping-fee"
                type="number" 
                placeholder="Food Stub (optional)" 
                value={fees.guideCampingFee}
                onChange={(e) => handleFeeChange('guideCampingFee', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6 pt-6 border-t">
          <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">Hike Itinerary</h2>
          {hikeItinerary.map((item, index) => (
            <div key={index} className="space-y-3 p-6 bg-gray-50 rounded-lg">
              <div>
                <label htmlFor={`itinerary-title-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input 
                  id={`itinerary-title-${index}`}
                  type="text" 
                  placeholder="Title" 
                  value={item.title}
                  onChange={(e) => {
                    const newItinerary = [...hikeItinerary];
                    newItinerary[index].title = e.target.value;
                    setHikeItinerary(newItinerary);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-white"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label htmlFor={`itinerary-description-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input 
                    id={`itinerary-description-${index}`}
                    type="text" 
                    placeholder="Description" 
                    value={item.description}
                    onChange={(e) => {
                      const newItinerary = [...hikeItinerary];
                      newItinerary[index].description = e.target.value;
                      setHikeItinerary(newItinerary);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-white"
                  />
                </div>
                <div>
                  <label htmlFor={`itinerary-location-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input 
                    id={`itinerary-location-${index}`}
                    type="text" 
                    placeholder="Location" 
                    value={item.location}
                    onChange={(e) => {
                      const newItinerary = [...hikeItinerary];
                      newItinerary[index].location = e.target.value;
                      setHikeItinerary(newItinerary);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-white"
                  />
                </div>
                <div>
                  <label htmlFor={`itinerary-time-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <input 
                    id={`itinerary-time-${index}`}
                    type="text" 
                    placeholder="Time" 
                    value={item.time}
                    onChange={(e) => {
                      const newItinerary = [...hikeItinerary];
                      newItinerary[index].time = e.target.value;
                      setHikeItinerary(newItinerary);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-white"
                  />
                </div>
              </div>
            </div>
          ))}
          <button 
            onClick={addHikeItinerary}
            className="w-12 h-12 bg-secondary hover:bg-green-700 text-white rounded-lg text-2xl font-bold transition-all shadow-sm hover:shadow-md"
          >
            +
          </button>
        </div>

        <div className="flex justify-center pt-6">
          <button 
            onClick={handleSave}
            disabled={loading}
            className="px-12 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                {isEdit ? 'Updating...' : 'Creating...'}
              </div>
            ) : (
              isEdit ? 'UPDATE MOUNTAIN' : 'CREATE MOUNTAIN'
            )}
          </button>
        </div>
      </div>

      {/* Unsaved Changes Confirmation Modal */}
      {showLeaveConfirm && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={handleCancelLeave}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-primary/20 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-semibold">
                !
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Leave this page?
                </h3>
                <p className="text-gray-700 text-base mt-1">
                  Changes you made may not be saved.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelLeave}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLeave}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MountainForm;
