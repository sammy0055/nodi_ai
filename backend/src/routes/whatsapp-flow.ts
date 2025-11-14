import express from 'express';
import crypto from 'crypto';
import fs from 'fs';
import { AreaModel } from '../models/area.model';
export const whatsappFlowRoute = express.Router();

whatsappFlowRoute.get('/flow-endpoint', (_req, res) => {
  console.log('🌐 GET /flow-endpoint');
  res.type('text/plain').send(Buffer.from(JSON.stringify({ data: { status: 'active' } }), 'utf8').toString('base64'));
});

whatsappFlowRoute.head('/flow-endpoint', (_req, res) => {
  console.log('🌐 HEAD /flow-endpoint');
  res.sendStatus(200);
});

whatsappFlowRoute.options('/flow-endpoint', (_req, res) => {
  console.log('🌐 OPTIONS /flow-endpoint');
  res.sendStatus(200);
});

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

// Flip IV bytes (required by WhatsApp for the response IV)
function flipIv(iv: any) {
  const out = Buffer.alloc(iv.length);
  for (let i = 0; i < iv.length; i++) {
    out[i] = iv[i] ^ 0xff;
  }
  return out;
}

// Detect if incoming body is the encrypted Flow payload
function isEncryptedFlow(body: any) {
  return (
    body &&
    typeof body.encrypted_flow_data === 'string' &&
    typeof body.encrypted_aes_key === 'string' &&
    typeof body.initial_vector === 'string'
  );
}

// Decrypt incoming WhatsApp Flow request
function decryptFlowRequest(body: any) {
  const encryptedAesKey = Buffer.from(body.encrypted_aes_key, 'base64');
  const iv = Buffer.from(body.initial_vector, 'base64');
  const encryptedFlowData = Buffer.from(body.encrypted_flow_data, 'base64');

  console.log('🔐 decryptFlowRequest() called');
  console.log('   encryptedAesKey length:', encryptedAesKey.length);
  console.log('   iv length:', iv.length);
  console.log('   encryptedFlowData length:', encryptedFlowData.length);

  // 1) Decrypt AES key using RSA-OAEP (SHA-256)
  const PRIVATE_KEY = fs.readFileSync('../keys/private.pem', 'utf8');
  const aesKey = crypto.privateDecrypt(
    {
      key: PRIVATE_KEY,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    encryptedAesKey
  );

  console.log('   Decrypted AES key length:', aesKey.length);

  // 2) Split ciphertext and auth tag (last 16 bytes is GCM tag)
  const tagLength = 16;
  const ciphertext = encryptedFlowData.slice(0, encryptedFlowData.length - tagLength);
  const authTag = encryptedFlowData.slice(encryptedFlowData.length - tagLength);

  console.log('   Ciphertext length:', ciphertext.length);
  console.log('   Auth tag length:', authTag.length);

  // 3) Decrypt with AES-GCM
  const algo = aesKey.length === 16 ? 'aes-128-gcm' : 'aes-256-gcm';
  console.log('   Using cipher algo:', algo);

  const decipher = crypto.createDecipheriv(algo, aesKey, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

  const jsonText = decrypted.toString('utf8');
  console.log('   Decrypted JSON text:', jsonText);

  const decryptedJson = JSON.parse(jsonText);
  return { aesKey, iv, decryptedJson };
}

// Encrypt Flow response using same AES key + flipped IV
function encryptFlowResponse(aesKey: any, iv: any, responseObj: any) {
  console.log('🔒 encryptFlowResponse() called');

  const ivResp = flipIv(iv);
  const plaintext = Buffer.from(JSON.stringify(responseObj), 'utf8');

  console.log('   Response plaintext:', plaintext.toString('utf8'));
  console.log('   AES key length:', aesKey.length);
  console.log('   IV (resp) length:', ivResp.length);

  const algo = aesKey.length === 16 ? 'aes-128-gcm' : 'aes-256-gcm';
  console.log('   Using cipher algo:', algo);

  const cipher = crypto.createCipheriv(algo, aesKey, ivResp);

  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();

  console.log('   Encrypted length:', encrypted.length);
  console.log('   Auth tag length:', authTag.length);

  const payload = Buffer.concat([encrypted, authTag]);
  const b64Payload = payload.toString('base64');

  console.log('   Encrypted base64 payload length:', b64Payload.length);
  return b64Payload;
}

whatsappFlowRoute.post('/flow-endpoint', async (req, res) => {
  try {
    console.log('🌐 POST /flow-endpoint');
    console.log('   Raw req.body from Express:', JSON.stringify(req.body));

    let body = req.body;

    // If body is raw text, try JSON parse
    if (typeof body === 'string') {
      console.log('   Body is string, attempting JSON.parse');
      try {
        body = JSON.parse(body);
        console.log('   Parsed string body:', JSON.stringify(body));
      } catch (err) {
        console.error('   Failed to parse string body as JSON:', err);
      }
    }

    let cryptoCtx = null;

    // If encrypted, decrypt first
    if (isEncryptedFlow(body)) {
      console.log('   Detected encrypted Flow payload');
      try {
        cryptoCtx = decryptFlowRequest(body);
        body = cryptoCtx.decryptedJson;
        console.log('   Decrypted Flow body:', JSON.stringify(body, null, 2));
      } catch (err) {
        console.error('❌ Failed to decrypt incoming Flow request:', err);
        return res.sendStatus(421);
      }
    } else {
      console.log('   Request is NOT encrypted, using body as-is');
      console.log('   Plain body:', JSON.stringify(body, null, 2));
    }

    const action = body?.action || '';
    const screen = body?.screen || '';
    const payload = body?.data || body?.payload || {};

    console.log('   Parsed action:', action);
    console.log('   Parsed screen:', screen);
    console.log('   Parsed payload:', JSON.stringify(payload, null, 2));

    let responseJson;

    // Health ping (encryption monitoring)
    if (action === 'ping') {
      console.log('   Handling action=ping (health check)');
      responseJson = { data: { status: 'active' } };
    } else {
      // For INIT / data_exchange / BACK we respond with { version, screen, data }
      let responseData;
      const screenName = 'ADDRESS_SELECTION';

      // INIT from builder / runtime
      if (action === 'INIT') {
        console.log('   Handling action=INIT');
        const zoneId = payload.zone_id || null;
        if (!zoneId) throw new Error('zoneId from whatsapp-flow is not valid');
        const areas = await AreaModel.findAll({ where: { zoneId: zoneId } });
        if (!areas) throw new Error('no areas retrived for whatsapp flow');
        const filteredAreas = areas.map((a) => ({ id: a.id, title: a.name }));
        responseData = {
          status: 'active',
          areas: filteredAreas || [],
          selected_zone_id: zoneId,
          selected_area_id: null,
        };
      }

      // Final submission (complete)
      else if (screen === 'ADDRESS_SELECTION' && action === 'complete') {
        console.log('   Handling ADDRESS_SELECTION complete');
        const { zone_id, area_id, note } = payload;
        console.log('   FLOW SUBMISSION (ADDRESS_SELECTION):', {
          zone_id,
          area_id,
          note,
        });

        responseData = {
          status: 'completed',
          zone_id,
          area_id,
          note,
        };
      }

      // Normal load / data_exchange for ADDRESS_SELECTION
      else if (screen === 'ADDRESS_SELECTION') {
        console.log('   Handling ADDRESS_SELECTION active/data_exchange');
        const zoneId = payload.zone_id || null;

        if (!zoneId) throw new Error('zoneId from whatsapp-flow is not valid');
        const areas = await AreaModel.findAll({ where: { zoneId: zoneId } });
        if (!areas) throw new Error('no areas retrived for whatsapp flow');
        const filteredAreas = areas.map((a) => ({ id: a.id, title: a.name }));
        responseData = {
          status: 'active',
          areas: filteredAreas || [],
          selected_zone_id: zoneId,
          selected_area_id: null,
        };
      }

      // Fallback
      else {
        console.log('   Fallback handler hit (no specific screen/action match)');
        responseData = { status: 'active' };
      }

      responseJson = {
        version: '3.0',
        screen: screenName,
        data: responseData,
      };
    }

    console.log('   Final responseJson BEFORE encryption:', JSON.stringify(responseJson, null, 2));

    // If this request was encrypted → encrypt response
    if (cryptoCtx) {
      try {
        const encryptedB64 = encryptFlowResponse(cryptoCtx.aesKey, cryptoCtx.iv, responseJson);
        console.log('✅ Sending ENCRYPTED base64 response');
        return res.type('text/plain').send(encryptedB64);
      } catch (err) {
        console.error('❌ Failed to encrypt Flow response:', err);
        return res.sendStatus(500);
      }
    }

    // If not encrypted (e.g., builder INIT / Actions test)
    console.log('✅ Sending UNENCRYPTED JSON response');
    return res.status(200).json(responseJson);
  } catch (error: any) {
    console.error('whatsapp-flow-error', error);
  }
});
