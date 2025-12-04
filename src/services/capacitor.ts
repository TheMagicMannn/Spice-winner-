// Capacitor Mobile Services
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { PushNotifications } from '@capacitor/push-notifications';

/**
 * Check if app is running on native platform
 */
export const isNative = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Get the current platform (ios, android, web)
 */
export const getPlatform = (): string => {
  return Capacitor.getPlatform();
};

/**
 * Camera Service - Take photo or select from gallery
 */
export const cameraService = {
  /**
   * Take a photo using camera
   */
  takePhoto: async (): Promise<string | null> => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      return image.dataUrl || null;
    } catch (error) {
      console.error('Error taking photo:', error);
      return null;
    }
  },

  /**
   * Select photo from gallery
   */
  selectPhoto: async (): Promise<string | null> => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });

      return image.dataUrl || null;
    } catch (error) {
      console.error('Error selecting photo:', error);
      return null;
    }
  },

  /**
   * Select multiple photos from gallery
   */
  selectMultiplePhotos: async (): Promise<string[]> => {
    try {
      const images = await Camera.pickImages({
        quality: 90,
        limit: 10,
      });

      return images.photos.map(photo => photo.webPath || '').filter(Boolean);
    } catch (error) {
      console.error('Error selecting multiple photos:', error);
      return [];
    }
  },
};

/**
 * Geolocation Service - Get user location
 */
export const geolocationService = {
  /**
   * Get current position
   */
  getCurrentPosition: async (): Promise<{ lat: number; lng: number } | null> => {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });

      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
    } catch (error) {
      console.error('Error getting position:', error);
      return null;
    }
  },

  /**
   * Check if location permissions are granted
   */
  checkPermissions: async (): Promise<boolean> => {
    try {
      const permissions = await Geolocation.checkPermissions();
      return permissions.location === 'granted';
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  },

  /**
   * Request location permissions
   */
  requestPermissions: async (): Promise<boolean> => {
    try {
      const permissions = await Geolocation.requestPermissions();
      return permissions.location === 'granted';
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  },
};

/**
 * App Service - App lifecycle and info
 */
export const appService = {
  /**
   * Get app info
   */
  getInfo: async () => {
    try {
      return await App.getInfo();
    } catch (error) {
      console.error('Error getting app info:', error);
      return null;
    }
  },

  /**
   * Listen to app state changes
   */
  addStateChangeListener: (callback: (state: { isActive: boolean }) => void) => {
    return App.addListener('appStateChange', callback);
  },

  /**
   * Listen to URL open events (deep linking)
   */
  addUrlOpenListener: (callback: (data: { url: string }) => void) => {
    return App.addListener('appUrlOpen', callback);
  },

  /**
   * Exit the app
   */
  exitApp: () => {
    App.exitApp();
  },
};

/**
 * Splash Screen Service
 */
export const splashScreenService = {
  /**
   * Hide splash screen
   */
  hide: async () => {
    try {
      await SplashScreen.hide();
    } catch (error) {
      console.error('Error hiding splash screen:', error);
    }
  },

  /**
   * Show splash screen
   */
  show: async () => {
    try {
      await SplashScreen.show({
        autoHide: false,
      });
    } catch (error) {
      console.error('Error showing splash screen:', error);
    }
  },
};

/**
 * Status Bar Service
 */
export const statusBarService = {
  /**
   * Set status bar style
   */
  setStyle: async (style: 'light' | 'dark') => {
    if (!isNative()) return;

    try {
      await StatusBar.setStyle({
        style: style === 'light' ? Style.Light : Style.Dark,
      });
    } catch (error) {
      console.error('Error setting status bar style:', error);
    }
  },

  /**
   * Set status bar background color
   */
  setBackgroundColor: async (color: string) => {
    if (!isNative() || getPlatform() !== 'android') return;

    try {
      await StatusBar.setBackgroundColor({ color });
    } catch (error) {
      console.error('Error setting status bar background:', error);
    }
  },

  /**
   * Hide status bar
   */
  hide: async () => {
    if (!isNative()) return;

    try {
      await StatusBar.hide();
    } catch (error) {
      console.error('Error hiding status bar:', error);
    }
  },

  /**
   * Show status bar
   */
  show: async () => {
    if (!isNative()) return;

    try {
      await StatusBar.show();
    } catch (error) {
      console.error('Error showing status bar:', error);
    }
  },
};

/**
 * Keyboard Service
 */
export const keyboardService = {
  /**
   * Hide keyboard
   */
  hide: async () => {
    if (!isNative()) return;

    try {
      await Keyboard.hide();
    } catch (error) {
      console.error('Error hiding keyboard:', error);
    }
  },

  /**
   * Show keyboard
   */
  show: async () => {
    if (!isNative()) return;

    try {
      await Keyboard.show();
    } catch (error) {
      console.error('Error showing keyboard:', error);
    }
  },

  /**
   * Listen to keyboard show/hide events
   */
  addShowListener: (callback: (info: { keyboardHeight: number }) => void) => {
    return Keyboard.addListener('keyboardWillShow', callback);
  },

  addHideListener: (callback: () => void) => {
    return Keyboard.addListener('keyboardWillHide', callback);
  },
};

/**
 * Push Notifications Service
 */
export const pushNotificationsService = {
  /**
   * Request permissions for push notifications
   */
  requestPermissions: async (): Promise<boolean> => {
    if (!isNative()) return false;

    try {
      const result = await PushNotifications.requestPermissions();
      return result.receive === 'granted';
    } catch (error) {
      console.error('Error requesting push notification permissions:', error);
      return false;
    }
  },

  /**
   * Register for push notifications
   */
  register: async () => {
    if (!isNative()) return;

    try {
      await PushNotifications.register();
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  },

  /**
   * Add listener for registration
   */
  addRegistrationListener: (callback: (token: { value: string }) => void) => {
    return PushNotifications.addListener('registration', callback);
  },

  /**
   * Add listener for registration error
   */
  addRegistrationErrorListener: (callback: (error: any) => void) => {
    return PushNotifications.addListener('registrationError', callback);
  },

  /**
   * Add listener for push notification received
   */
  addPushNotificationReceivedListener: (callback: (notification: any) => void) => {
    return PushNotifications.addListener('pushNotificationReceived', callback);
  },

  /**
   * Add listener for push notification action performed
   */
  addPushNotificationActionListener: (callback: (notification: any) => void) => {
    return PushNotifications.addListener('pushNotificationActionPerformed', callback);
  },
};

/**
 * Initialize mobile app services
 */
export const initializeMobileApp = async () => {
  if (!isNative()) {
    console.log('Running on web, skipping mobile initialization');
    return;
  }

  console.log(`Initializing SPICE mobile app on ${getPlatform()}`);

  try {
    // Hide splash screen after app is ready
    await splashScreenService.hide();

    // Set status bar style
    await statusBarService.setStyle('light');
    await statusBarService.setBackgroundColor('#000000');

    // Log app info
    const appInfo = await appService.getInfo();
    console.log('App Info:', appInfo);

    // Initialize push notifications (request permissions)
    const pushPermissions = await pushNotificationsService.requestPermissions();
    if (pushPermissions) {
      await pushNotificationsService.register();
    }

    console.log('Mobile app initialized successfully');
  } catch (error) {
    console.error('Error initializing mobile app:', error);
  }
};

/**
 * Handle back button for Android
 */
export const handleBackButton = (callback: () => void) => {
  if (!isNative() || getPlatform() !== 'android') return;

  return App.addListener('backButton', () => {
    callback();
  });
};

export default {
  isNative,
  getPlatform,
  cameraService,
  geolocationService,
  appService,
  splashScreenService,
  statusBarService,
  keyboardService,
  pushNotificationsService,
  initializeMobileApp,
  handleBackButton,
};
