import { useEffect, useState, useCallback } from 'react';

// 🔹 FB SDK Login Response
export interface FbSdkAuthResponse {
  userID: string | null;
  expiresIn: number | null;
  code: string;
}

export interface FbSdkResponse {
  authResponse: FbSdkAuthResponse | null;
  status: 'connected' | 'not_authorized' | 'unknown';
}

// 🔹 WhatsApp Embedded Signup Response
export interface WaEmbeddedSignupData {
  phone_number_id?: string;
  waba_id?: string;
  business_id?: string;
  current_step?: string; // for CANCEL
  error_message?: string; // for ERROR
}

export type WaEmbeddedSignupEvent = 'FINISH' | 'CANCEL' | 'ERROR';

export interface WaEmbeddedSignupResponse {
  data: WaEmbeddedSignupData;
  type: 'WA_EMBEDDED_SIGNUP';
  event: WaEmbeddedSignupEvent;
  version: string;
}

export function useWhatsAppSignup(configId: string, redirectUri: string) {
  const [status, setStatus] = useState<'FINISH' | 'CANCEL' | 'ERROR' | 'Idle'>('Idle');
  const [sdkResponse, setSdkResponse] = useState<FbSdkResponse | null>(null);
  const [sessionInfo, setSessionInfo] = useState<WaEmbeddedSignupResponse | null>(null);

  // 🔹 Capture Embedded Signup events
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.facebook.com' && event.origin !== 'https://web.facebook.com') {
        return;
      }

      try {
        const data = JSON.parse(event.data);

        if (data.type === 'WA_EMBEDDED_SIGNUP') {
          if (data.event === 'FINISH') {
            setStatus('FINISH');
          } else if (data.event === 'CANCEL') {
            setStatus(`CANCEL`);
          } else if (data.event === 'ERROR') {
            setStatus(`ERROR`);
          }
          setSessionInfo(data);
        }
      } catch {
        console.log('Non-JSON message:', event.data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // 🔹 FB.login callback
  const fbLoginCallback = useCallback((response: FbSdkResponse) => {
    setSdkResponse(response);

    if (response?.authResponse?.code) {
      console.log('Auth Code:', response.authResponse.code);
      // send code to backend for token exchange
    }
  }, []);

  // 🔹 Launch WhatsApp Signup
  const launchWhatsAppSignup = useCallback(() => {
    (window as any).FB.login(fbLoginCallback, {
      config_id: configId,
      response_type: 'code',
      override_default_response_type: true,
      extras: { version: 'v3' },
    });
  }, [configId, redirectUri, fbLoginCallback]);

  return {
    status,
    sdkResponse,
    sessionInfo,
    launchWhatsAppSignup,
  };
}
