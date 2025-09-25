import { useEffect, useState } from 'react';

export default function WhatsAppRedirect() {
  const [_, setStatus] = useState('Processing...');
  const [sdkResponse, setSdkResponse] = useState<any>(null);
  const [sessionInfo, setSessionInfo] = useState<any>(null);

  // 🔹 Capture postMessage events (waba_id, phone_number_id, errors, etc.)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.facebook.com' && event.origin !== 'https://web.facebook.com') {
        return;
      }

      try {
        const data = JSON.parse(event.data);
        console.log('=================event===================');
        console.log(data);
        console.log('====================================');
        if (data.type === 'WA_EMBEDDED_SIGNUP') {
          if (data.event === 'FINISH') {
            const { phone_number_id, waba_id } = data.data;
            console.log('Phone number ID:', phone_number_id);
            console.log('WhatsApp Business Account ID:', waba_id);
            setStatus('WhatsApp business connected successfully ✅');
          } else if (data.event === 'CANCEL') {
            const { current_step } = data.data;
            console.warn('Signup cancelled at:', current_step);
            setStatus(`Cancelled at step: ${current_step}`);
          } else if (data.event === 'ERROR') {
            const { error_message } = data.data;
            console.error('Signup error:', error_message);
            setStatus(`Error: ${error_message}`);
          }
        }

        setSessionInfo(data);
      } catch {
        console.log('Non-JSON message:', event.data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Callback for FB.login
  const fbLoginCallback = (response: any) => {
    console.log('FB Login response:', response);
    setSdkResponse(response);

    if (response.authResponse) {
      const code = response.authResponse.code;
      console.log('Auth Code:', code);
      // Send `code` to backend for token exchange
    }
  };

  // Launch WhatsApp signup
  const launchWhatsAppSignup = () => {
    (window as any).FB.login(fbLoginCallback, {
      config_id: '1824425868142842', // your config ID
      response_type: 'code', // required for system user access token
      override_default_response_type: true,
      redirect_uri: 'https://4f7ac4d93d68.ngrok-free.app/app/whatsapp-redirect',
      extras: { version: 'v3' },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-2xl font-bold mb-4">WhatsApp Embedded Signup</h1>

      <button
        onClick={launchWhatsAppSignup}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded"
      >
        Login with Facebook
      </button>

      {sdkResponse && (
        <pre className="mt-6 p-2 bg-gray-100 rounded text-xs text-left w-96">
         sdkResponse {JSON.stringify(sdkResponse, null, 2)}
        </pre>
      )}

         {sessionInfo && (
        <pre className="mt-6 p-2 bg-gray-100 rounded text-xs text-left w-96">
         sessionInfo {JSON.stringify(sessionInfo, null, 2)}
        </pre>
      )}
    </div>
  );
}
