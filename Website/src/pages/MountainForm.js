import React, { useState, useEffect } from 'react';
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
    status: 'Single'
  });
  const [images, setImages] = useState([null, null, null, null, null]);
  const [thingsToBring, setThingsToBring] = useState(['']);
  const [hikeItinerary, setHikeItinerary] = useState([{ title: '', description: '', location: '', time: '' }]);
  const [transportationGuides, setTransportationGuides] = useState([{ header: '', title: '', description: '' }]);
  const [reminders] = useState([{ description: '' }]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState(null);

  // Load mountain data if editing
  useEffect(() => {
    const loadMountainData = async () => {
      if (!isEdit || !id) return;
      
      try {
        setLoadingData(true);
        const response = await apiService.getMountain(id);
        const mountain = response.mountain;
        
      if (mountain) {
        setFormData({
          name: mountain.name || '',
          description: mountain.description || '',
          elevation: mountain.elevation || '',
          location: mountain.location || '',
          difficulty: mountain.difficulty || 'Easy',
          status: mountain.status || 'Single'
        });
        
        // Load existing image if available
        if (mountain.image_url) {
          setImages([mountain.image_url, null, null, null, null]);
        }
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
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImages = [...images];
        newImages[index] = reader.result;
        setImages(newImages);
      };
      reader.readAsDataURL(file);
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

  const addTransportationGuide = () => {
    setTransportationGuides([...transportationGuides, { header: '', title: '', description: '' }]);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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

      const mountainData = {
        name: formData.name,
        description: formData.description,
        elevation: parseInt(formData.elevation),
        location: formData.location,
        difficulty: formData.difficulty,
        status: formData.status,
        image_url: images[0] // Send the first image as the main image
      };

      // Debug: Log the data being sent
      console.log('Sending mountain data:', {
        ...mountainData,
        image_url: images[0] ? `${images[0].substring(0, 50)}...` : 'No image'
      });

      if (isEdit) {
        await apiService.updateMountain(id, mountainData);
        alert('Mountain updated successfully!');
      } else {
        await apiService.createMountain(mountainData);
        alert('Mountain created successfully!');
      }

      navigate('/admin/mountains');
    } catch (err) {
      console.error('Error saving mountain:', err);
      setError('Failed to save mountain. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          onClick={() => navigate('/admin/mountains')}
        >
          ← Back to manage mountains
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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
                <div className="aspect-video bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-blue-300 hover:border-primary transition-colors">
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
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-primary transition-colors">
                      <span className="text-3xl text-gray-400">+</span>
                    </div>
                  )}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(index + 1, e)}
                  className="hidden"
                  id={`image-${index + 1}`}
                />
              </div>
            ))}
            <div className="text-center text-sm text-gray-500 font-medium">3/5</div>
          </div>
        </div>

        <input 
          type="text" 
          placeholder="Mountain Name *" 
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        />
        
        <textarea 
          placeholder="Description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)} 
          rows="4"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
        ></textarea>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input 
            type="number" 
            placeholder="Elevation (meters) *" 
            value={formData.elevation}
            onChange={(e) => handleInputChange('elevation', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
          <input 
            type="text" 
            placeholder="Location *" 
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
          <select 
            value={formData.difficulty}
            onChange={(e) => handleInputChange('difficulty', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
            <option value="Expert">Expert</option>
          </select>
          <select 
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          >
            <option value="Single">Single</option>
            <option value="Multiple">Multiple</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Things to Bring</h3>
            {thingsToBring.map((item, index) => (
              <input 
                key={index}
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
            ))}
            <button 
              onClick={addThingToBring}
              className="w-12 h-12 bg-gradient-to-r from-secondary to-green-600 hover:from-secondary hover:to-green-700 text-white rounded-lg text-2xl font-bold transition-all shadow-sm hover:shadow-md"
            >
              +
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Fees</h3>
            <input 
              type="text" 
              placeholder="Environmental Fee" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
            <input 
              type="text" 
              placeholder="Registration Fee" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
            <input 
              type="text" 
              placeholder="Guide/Camping Fee" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="space-y-6 pt-6 border-t">
          <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">Hike Itinerary</h2>
          {hikeItinerary.map((item, index) => (
            <div key={index} className="space-y-3 p-6 bg-gray-50 rounded-lg">
              <input 
                type="text" 
                placeholder="Title" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-white"
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input 
                  type="text" 
                  placeholder="Description" 
                  className="md:col-span-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-white"
                />
                <input 
                  type="text" 
                  placeholder="Location" 
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-white"
                />
                <input 
                  type="text" 
                  placeholder="Time" 
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-white"
                />
              </div>
            </div>
          ))}
          <button 
            onClick={addHikeItinerary}
            className="w-12 h-12 bg-gradient-to-r from-secondary to-green-600 hover:from-secondary hover:to-green-700 text-white rounded-lg text-2xl font-bold transition-all shadow-sm hover:shadow-md"
          >
            +
          </button>
        </div>

        <div className="space-y-6 pt-6 border-t">
          <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">Transportation Guide</h2>
          {transportationGuides.map((item, index) => (
            <div key={index} className="space-y-3 p-6 bg-gray-50 rounded-lg">
              <input 
                type="text" 
                placeholder="Header" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-white"
              />
              <input 
                type="text" 
                placeholder="Title" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-white"
              />
              <textarea 
                placeholder="Description" 
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none bg-white"
              ></textarea>
            </div>
          ))}
          <button 
            onClick={addTransportationGuide}
            className="w-12 h-12 bg-gradient-to-r from-secondary to-green-600 hover:from-secondary hover:to-green-700 text-white rounded-lg text-2xl font-bold transition-all shadow-sm hover:shadow-md"
          >
            +
          </button>
        </div>

        <div className="space-y-4 pt-6 border-t">
          <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">Link</h2>
          <input 
            type="text" 
            placeholder="URL" 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </div>

        <div className="space-y-4 pt-6 border-t">
          <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">Reminders</h2>
          {reminders.map((item, index) => (
            <div key={index} className="flex gap-3">
              <textarea 
                placeholder="Description" 
                rows="2"
                defaultValue="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
              ></textarea>
              <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
                🗑️
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-center pt-6">
          <div className="w-48 aspect-video bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex flex-col items-center justify-center">
            <div className="text-4xl">☁️</div>
            <div className="text-4xl">⛰️</div>
          </div>
        </div>

        <div className="flex justify-center pt-6">
          <button 
            onClick={handleSave}
            disabled={loading}
            className="px-12 py-3 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
    </div>
  );
}

export default MountainForm;
