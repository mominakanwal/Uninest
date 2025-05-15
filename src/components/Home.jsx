import React, { useState, useEffect } from "react";
import { MapPin, List, Map } from "lucide-react";
import axios from "axios";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import PropertyCard from "./PropertyCard";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  doc,
  deleteDoc,
  addDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import Button from "./Button";

const initialPropertyTypes = ["Hostel", "Apartment", "Flat", "House"];

const containerStyle = {
  width: "100%",
  height: "500px",
};

const center = {
  lat: 33.6844,
  lng: 73.0479,
};

const validateFields = () => {
  const errors = [];

  if (!university.trim()) {
    errors.push("University name is required");
  }

  if (!selectedType && !customPropertyType.trim()) {
    errors.push("Property type is required");
  }

  if (budget < 10000) {
    errors.push("Minimum budget should be 10,000 PKR");
  }

  if (radius < 1) {
    errors.push("Minimum radius should be 1 KM");
  }

  return errors;
};

const Home = () => {
  const [selectedType, setSelectedType] = useState("");
  const [budget, setBudget] = useState(10000);
  const [radius, setRadius] = useState(5); // Radius in KM
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [selectedNearby, setSelectedNearby] = useState([]);
  const [university, setUniversity] = useState("");
  const [mapView, setMapView] = useState(false);
  const [results, setResults] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [customFacilities, setCustomFacilities] = useState("");
  const [customNearby, setCustomNearby] = useState("");
  const [customPropertyType, setCustomPropertyType] = useState("");
  const [genderPreference, setGenderPreference] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchBox, setSearchBox] = useState(null);

  const [savedListings, setSavedListings] = useState([]);
  const [activeTab, setActiveTab] = useState("search");
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate("/login");
      })
      .catch((error) => {
        console.error("Sign-out error:", error);
      });
  };

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyC3JsdgctjQdwZBVhwwfWHooWrAUBVLtOw",
    libraries: ["places"],
  });

  const toggleSelection = (value, setter, current) => {
    if (current.includes(value)) {
      setter(current.filter((v) => v !== value));
    } else {
      setter([...current, value]);
    }
  };

  const handleAddCustomFacility = () => {
    if (!customFacilities.trim()) {
      alert("Please enter a facility name");
      return;
    }

    if (selectedFacilities.includes(customFacilities.trim())) {
      alert("This facility is already added");
      return;
    }

    setSelectedFacilities([...selectedFacilities, customFacilities.trim()]);
    setCustomFacilities("");
  };

  const handleSearch = async () => {
    // Validate required fields
    if (!university.trim()) {
      alert("Please enter a university name");
      return;
    }

    if (!selectedType && !customPropertyType.trim()) {
      alert("Please select or enter a property type");
      return;
    }

    if (budget < 10000) {
      alert("Please set a valid budget");
      return;
    }

    setLoading(true);
    try {
      const prompt = `
Based on the following preferences:
- University: ${university}
- Max Budget: PKR ${budget}
- Property Type: ${customPropertyType.trim() || selectedType}
- Gender Preference: ${genderPreference || "Any"}
- Desired Facilities: ${
        [
          ...selectedFacilities,
          ...(customFacilities.trim() ? [customFacilities.trim()] : []),
        ].join(", ") || "Any"
      }
- Preferred Nearby Places: ${selectedNearby.join(", ") || "Any"}
- Only show results within ${radius} KM of the university location.

Provide 5 nearby accommodation options **strictly within this radius of university and within the max budget, considering the gender preference (${
        genderPreference || "Any"
      }).**, in the following JSON format:
{
  "results": [
    {
      "title": "Accommodation Name",
      "description": "Description here...",
      "price": 35000,
      "location": { "lat": 33.6844, "lng": 73.0479 },
      "amenities": ["WiFi", "Laundry", "AC"],
      "rating": 4.5,
      "genderPreference": "male/female/any",
      "reviews": ["Clean rooms!", "Great location near university."]
    }
  ]
}`;

      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBj46ORWF251V3spcKzXTq6sHY8q0zKxrU",
        {
          contents: [{ parts: [{ text: prompt }] }],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const rawText =
        response?.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const jsonMatch = rawText.match(/{[\s\S]*}/);
      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[0]);
        const resultsWithIds = (jsonData.results || []).map((item) => ({
          ...item,
          id: crypto.randomUUID(),
        }));
        setResults(resultsWithIds);
        const newMarkers = resultsWithIds
          .map((item) => item.location)
          .filter(Boolean);
        setMarkers(newMarkers);
      } else {
        setResults([
          {
            id: crypto.randomUUID(),
            title: "AI Response",
            description: rawText,
          },
        ]);
        setMarkers([]);
      }
    } catch (error) {
      console.error("Gemini API Error:", error);
      setResults([
        {
          id: crypto.randomUUID(),
          title: "Error",
          description: "Failed to fetch data.",
        },
      ]);
      setMarkers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async (property) => {
    if (!auth.currentUser) {
      alert("Please log in to save properties");
      return;
    }

    try {
      const favoritesRef = collection(db, "favorites");

      const savedQuery = query(
        favoritesRef,
        where("userId", "==", auth.currentUser.uid),
        where("propertyId", "==", property.id)
      );

      const querySnapshot = await getDocs(savedQuery);

      if (!querySnapshot.empty) {
        // If property is already saved, remove it
        const docToDelete = querySnapshot.docs[0];
        await deleteDoc(doc(db, "favorites", docToDelete.id));
        console.log("Property removed from favorites");
      } else {
        // If property is not saved, add it with full property data
        await addDoc(favoritesRef, {
          propertyId: property.id,
          userId: auth.currentUser.uid,
          savedAt: serverTimestamp(),
          propertyData: {
            ...property,
            createdAt: serverTimestamp(),
          },
        });
        console.log("Property saved successfully");
      }
    } catch (error) {
      console.error("Error toggling save:", error);
      alert("Failed to update saved properties");
    }
  };

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "favorites"),
      where("userId", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const savedListingsData = snapshot.docs.map((doc) => ({
        ...doc.data().propertyData,
        favoriteId: doc.id,
        id: doc.data().propertyId,
      }));
      setSavedListings(savedListingsData);
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  return (
    <div className="min-h-screen bg-outerbg p-6">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      <div className="bg-mainbg p-8 shadow-2xl rounded-2xl max-w-6xl mx-auto space-y-6">
        <div className="flex gap-4 justify-center mb-8">
          <Button
            onClick={() => setActiveTab("search")}
            className={`py-2 px-6 rounded-full text-sm font-semibold transition ${
              activeTab === "search"
                ? "bg-accent text-black "
                : " text-zinc-200 "
            }`}
          >
            Search
          </Button>
          <Button
            onClick={() => setActiveTab("saved")}
            className={`py-2 px-6 rounded-full text-sm font-semibold transition ${
              activeTab === "saved"
                ? "bg-accent text-black "
                : " text-zinc-200 "
            }`}
          >
            Search
          </Button>
        </div>

        {activeTab === "search" ? (
          <>
            <h1 className="text-5xl font-bold text-center text-zinc-200 font-rubik">
              Find Your Ideal Property
            </h1>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              <input
                type="text"
                placeholder="University Name..."
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full rounded-xl border-[1.58px] border-zinc-600 bg-zinc-950 px-5 py-3 font-medium text-slate-200 shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-zinc-500"
              />

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full rounded-xl border-[1.58px] border-zinc-600 bg-zinc-950 px-5 py-3 font-medium text-slate-200 shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-zinc-500"
              >
                <option value="">Select Property Type</option>
                {initialPropertyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <div>
                <label className="block mb-2 font-medium text-zinc-200">
                  Budget (PKR):{" "}
                  <span className="text-accent font-semibold">{budget}</span>
                </label>
                <input
                  type="range"
                  min="10000"
                  max="100000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full h-2 bg-[#1A1A1A] rounded-lg appearance-none cursor-pointer accent-[#B1DD40]"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-zinc-200">
                  Radius (KM):{" "}
                  <span className="text-accent font-semibold">{radius}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                  className="w-full h-2 bg-[#1A1A1A] rounded-lg appearance-none cursor-pointer accent-[#B1DD40]"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-zinc-200">
                  Gender Preference:
                </label>
                <select
                  value={genderPreference}
                  onChange={(e) => setGenderPreference(e.target.value)}
                  className="w-full rounded-xl border-[1.58px] border-zinc-600 bg-zinc-950 px-5 py-3 font-medium text-slate-200 shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                >
                  <option value="">Any</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            {/* Facilities */}
            <div className="mt-8">
              <label className="font-semibold text-zinc-200">Facilities:</label>
              <div className="flex gap-3 mt-3">
                <input
                  type="text"
                  value={customFacilities}
                  onChange={(e) => setCustomFacilities(e.target.value)}
                  placeholder="Add facility (e.g., WiFi, AC)"
                  className="w-full rounded-xl border-[1.58px] border-zinc-600 bg-zinc-950 px-5 py-3 font-medium text-slate-200 shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") handleAddCustomFacility();
                  }}
                />
                <Button onClick={handleAddCustomFacility}>Add</Button>
              </div>

              {selectedFacilities.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {selectedFacilities.map((facility, idx) => (
                    <span
                      key={idx}
                      className="flex items-center bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm"
                    >
                      {facility}
                      <button
                        onClick={() =>
                          setSelectedFacilities(
                            selectedFacilities.filter((_, i) => i !== idx)
                          )
                        }
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Nearby Places */}
            <div className="mt-8">
              <label className="font-semibold text-zinc-200">
                Nearby Places:
              </label>
              <div className="flex gap-3 mt-3">
                <input
                  type="text"
                  value={customNearby}
                  onChange={(e) => setCustomNearby(e.target.value)}
                  placeholder="Add nearby place"
                  className="w-full rounded-xl border-[1.58px] border-zinc-600 bg-zinc-950 px-5 py-3 font-medium text-slate-200 shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                />
                <Button
                  onClick={() => {
                    if (customNearby.trim()) {
                      setSelectedNearby([
                        ...selectedNearby,
                        customNearby.trim(),
                      ]);
                      setCustomNearby("");
                    }
                  }}
                >
                  Add
                </Button>
              </div>
              {selectedNearby.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {selectedNearby.map((place, idx) => (
                    <li
                      key={idx}
                      className="flex justify-between items-center bg-gray-100 p-3 rounded-lg"
                    >
                      <span>{place}</span>
                      <button
                        onClick={() =>
                          setSelectedNearby(
                            selectedNearby.filter((_, i) => i !== idx)
                          )
                        }
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Search & Map Toggle */}
            <div className="flex justify-between mt-8">
              <Button onClick={handleSearch}>Search</Button>
              <Button
                onClick={() => setMapView(!mapView)}
                className="flex gap-2 "
              >
                {mapView ? (
                  <List className="w-5 h-5" />
                ) : (
                  <Map className="w-5 h-5" />
                )}
                <span className="text-sm font-medium">
                  {mapView ? "List View" : "Map View"}
                </span>
              </Button>
            </div>

            {/* Results */}
            <div className="mt-8">
              {mapView ? (
                isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={13}
                  >
                    {results.map((result) => (
                      <Marker
                        key={result.id}
                        position={{
                          lat: result.location.lat,
                          lng: result.location.lng,
                        }}
                        onClick={() => setSelectedMarker(result)}
                      >
                        {selectedMarker === result && (
                          <InfoWindow
                            position={{
                              lat: result.location.lat,
                              lng: result.location.lng,
                            }}
                            onCloseClick={() => setSelectedMarker(null)}
                          >
                            <div className="p-2 max-w-xs">
                              <h3 className="font-bold text-lg">
                                {result.title}
                              </h3>
                              <p className="text-sm text-green-600">
                                PKR {result.price}
                              </p>
                              <p className="text-sm text-gray-600">
                                {result.description}
                              </p>
                              {result.rating && (
                                <p className="text-sm">
                                  Rating: {result.rating} ⭐
                                </p>
                              )}
                            </div>
                          </InfoWindow>
                        )}
                      </Marker>
                    ))}
                  </GoogleMap>
                ) : (
                  <p className="text-center text-zinc-200">Loading Map...</p>
                )
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {loading ? (
                    <p className="text-center col-span-full">Loading...</p>
                  ) : results.length === 0 ? (
                    <p className="text-center col-span-full text-zinc-200">
                      No results found
                    </p>
                  ) : (
                    results.map((result) => (
                      <PropertyCard
                        key={result.id}
                        {...result}
                        isSaved={savedListings.some(
                          (saved) => saved.id === result.id
                        )}
                        onToggleSave={() => handleToggleSave(result)}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-center">
              Saved Properties
            </h2>
            {savedListings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">
                  No saved properties yet
                </p>
                <button
                  onClick={() => setActiveTab("search")}
                  className="text-blue-600 hover:underline"
                >
                  Start searching for properties
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedListings.map((listing) => (
                  <PropertyCard
                    key={listing.id}
                    {...listing}
                    isSaved={true}
                    onToggleSave={() => handleToggleSave(listing)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
