UNINEST APPLICATION  DOCUMENTATION


Uninest is an advanced university accommodation search platform designed to help students and users find ideal housing solutions near universities with personalized preferences. This 
professional-grade application seamlessly integrates user authentication, dynamic property search capabilities, interactive map views, and saved properties management.


OUR TEAM:

Saif Sultan (Computer Science student)

Muhammad Waqar (Mechanical engineering student)

Momina Kanwal (Software engineering student)

Mujtaba Gulzar (Computer Science student)

OVERVIEW


The Uninest platform enables users to perform detailed searches for accommodations near universities based on parameters such as budget, property type, preferred facilities, gender preference, and location proximity. It offers both list and map visualizations of search results. Authenticated users can save favorite properties and request visits, enhancing user engagement and interaction.

KEY FEATURES


Authentication System: Enables secure user signup, login, and logout using Firebase Authentication, ensuring personalized and secure user sessions.

Property Search: Users can search accommodations by specifying university name, budget, property type, radius from university, gender preference, nearby places, and desired facilities.

Customizable Filters: Users can add custom facilities and nearby places to refine their search results.

Interactive Map and List Views: Search results can be viewed either as a list or plotted interactively on Google Maps, showing detailed information on each property marker.

Save and Manage Listings: Authenticated users can save favorite properties, view saved listings, and remove them as needed.

Visit Request System: Users can request property visits by selecting a preferred date using an integrated date picker, facilitating property engagement.

Real-time Data Sync: Utilizes Firestore's real-time update capabilities to synchronize saved listings.

Toast Notifications: Provides users with feedback on operations such as login status and search errors through toast messages.


TECHNOLOGIES USED


React.js: Core framework for building the user interface with a component-based architecture.

React Router DOM: Manages client-side routing for seamless navigation between Login, Signup, and Home routes.

Firebase: Provides backend services including Firebase Authentication for user management and Firestore as a cloud-hosted NoSQL database for storing saved properties and visit requests.

Google Maps API: Renders interactive maps, markers, and info windows to visually display accommodation locations.

Axios: Handles HTTP requests to external APIs—in this case, the Google Gemini language model API to fetch AI-generated accommodation suggestions.

React-Toastify: For user-friendly, non-blocking toast notifications to enhance user experience.

Tailwind CSS: Utility-first CSS framework for rapid and responsive styling of the application interface.

React-Datepicker: Provides a clean date selection UI for scheduling property visits.

Lucide-React Icons: Used for UI icons such as map and list view toggles.

ES6+ JavaScript: Modern JavaScript syntax and features for code modularity and clarity.


COMPONENT BREAKDOWN

APP.JSX


Entry point for the React application. It initializes Firebase Authentication state monitoring with onAuthStateChanged to track the logged-in user status and loading state. It configures the application's routes using React Router:
/login : Login page.
/signup : Registration page.
/home : Main application page with search and saved listings.
/ redirects to the login page by default.
A centralized toast container is rendered for notifications.

HOME.JSX


Core user interface for accommodation searching and saved properties management:
Provides search input fields to define university, property types, budget, radius, gender preference, facilities, and nearby places.
Implements toggling between List View and Map View. Map View utilizes Google Maps API with custom markers and InfoWindow details.
Handles search queries via an integration with Google Gemini Language Model API to produce relevant accommodations based on input preferences. The response is parsed, and results are displayed.
Enables users to save or unsave properties in Firestore with real-time synchronization.
Incorporates logout functionality, returning users to the login page.

LOGIN.JSX


Provides a clean and accessible login form. It handles user login using Firebase Authentication’s signInWithEmailAndPassword method and navigates users to the home page upon success, showing toast notifications accordingly.

SIGNUP.JSX


Allows new users to register by entering their profile details, including first name, last name, age, country selection, email, and password. The component checks to prevent duplicate email registrations by querying Firebase Authentication before account creation.

PROPERTYCARD.JSX


Renders individual accommodation listings with details such as title, description, price, amenities, ratings, and reviews. It supports user interaction features:
Saving/removing the listing as a favorite.
Requesting property visits with a date picker to schedule visits, submitting these requests to Firestore.
Contact owner via email link if available.

USEAUTH.JS

A custom React hook to manage user authentication state globally within the app by leveraging Firebase’s onAuthStateChanged listener.

APPLICATION WORKFLOW


User Registration/Login:
New users create accounts using the Signup form; returning users login via email/password authentication.
Access Home Page: Once authenticated, users reach the Home component where they can conduct detailed searches for accommodations.
Property Search: Users configure search parameters and execute searches. The app sends requests to the AI-driven Google Gemini API for intelligent accommodation suggestions within the specified radius and filters.

View Results:
Search results are viewable as a list or plotted on a map with interactive markers displaying property information.
Save Favorites & Requests: Authenticated users may save preferred listings to a favorites collection in Firestore or request to visit them on a chosen date.
Manage Saved Listings: Users can view and manage saved properties via a dedicated tab.
Logout: Users may securely sign out, returning to the login screen.

SECURITY AND DATA MANAGEMENT


All user authentication information is securely handled by Firebase Authentication with email/password login flow. Sensitive user actions such as saving properties and requesting visits require authentication status verification. Firestore stores user-related data including saved listings and visit requests, using server-generated timestamps for auditability. Firestore real-time listeners update user interfaces in sync with backend changes.

STYLING AND UX

Tailwind CSS enables consistent, responsive, and modern UI styling with utility classes throughout the app, providing an intuitive user experience. The interface includes interactive buttons for tab navigation, inputs, sliders, and map/list toggle, all designed for accessibility and ease of use. Toast notifications inform users of success and error states promptly and non-intrusively.

FUTURE ENHANCEMENTS


Integration with additional third-party accommodation providers or university data sources.
Enhanced filtering options including more granular facility and rating selections.
Support for image galleries and virtual tours within property cards.
Push notifications for visit request updates and new property listings.
