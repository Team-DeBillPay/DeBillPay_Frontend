import { useState } from 'react';

export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadGoogleScript = () => {
    return new Promise((resolve, reject) => {
      if (window.google) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Не вдалося завантажити Google script'));
      document.head.appendChild(script);
    });
  };

  const initializeGoogleAuth = (onSuccess) => {
    if (!window.google) {
      console.error('Google script not loaded');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: '1002467057833-bfi3rn47r0gdekcto3v52uegb64uqb43.apps.googleusercontent.com',
      callback: onSuccess,
      auto_select: false,
      cancel_on_tap_outside: true,
    });
  };

  const promptGoogleLogin = () => {
    if (!window.google) {
      console.error('Google script not loaded');
      return;
    }

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        window.google.accounts.id.prompt();
      }
    });
  };

  const renderGoogleButton = (element, onSuccess, buttonText = "Продовжити з Google") => {
    if (!window.google) {
      console.error('Google script not loaded');
      return;
    }

    window.google.accounts.id.renderButton(element, {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: element.offsetWidth,
    });

    const observer = new MutationObserver(() => {
      const button = element.querySelector('div[role="button"] span');
      if (button && button.textContent !== buttonText) {
        button.textContent = buttonText;
        observer.disconnect();
      }
    });

    observer.observe(element, { childList: true, subtree: true });

    initializeGoogleAuth(onSuccess);
  };


  return {
    isLoading,
    error,
    loadGoogleScript,
    initializeGoogleAuth,
    promptGoogleLogin,
    renderGoogleButton,
    setIsLoading,
    setError,
  };
};