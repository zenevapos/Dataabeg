const http = require('http');

async function postJson(url, data) {
  const parsed = new URL(url);
  const body = JSON.stringify(data);
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }
      },
      (res) => {
        let respData = '';
        res.on('data', (chunk) => (respData += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(respData) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: respData });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function getUrl(url) {
  const parsed = new URL(url);
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method: 'GET'
      },
      (res) => {
        let respData = '';
        res.on('data', (chunk) => (respData += chunk));
        res.on('end', () => resolve({ status: res.statusCode, body: respData }));
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function runTest() {
  console.log('--- 1. Testing POST /api/phone-verify (Create Challenge) ---');
  const createRes = await postJson('http://localhost:3000/api/phone-verify', {
    action: 'create',
    phone: '08154276838'
  });
  console.log('Status:', createRes.status);
  console.log('Result:', createRes.body);

  const generatedCode = createRes.body.code;
  console.log(`\nGenerated Code: ${generatedCode}`);
  console.log(`WhatsApp Deep Link: ${createRes.body.whatsappUrl}`);

  console.log('\n--- 2. Testing GET /api/whatsapp/webhook (Meta Handshake) ---');
  const handshakeRes = await getUrl(
    'http://localhost:3000/api/whatsapp/webhook?hub.mode=subscribe&hub.challenge=TEST_META_CHALLENGE_12345&hub.verify_token=dataabeg_webhook_verify_secret'
  );
  console.log('Status:', handshakeRes.status);
  console.log('Challenge Response:', handshakeRes.body);

  console.log('\n--- 3. Testing POST /api/whatsapp/webhook (User sends WhatsApp Message) ---');
  const webhookRes = await postJson('http://localhost:3000/api/whatsapp/webhook', {
    object: 'whatsapp_business_account',
    entry: [
      {
        changes: [
          {
            value: {
              messages: [
                {
                  from: '2348154276838',
                  text: {
                    body: generatedCode
                  }
                }
              ]
            }
          }
        ]
      }
    ]
  });
  console.log('Status:', webhookRes.status);
  console.log('Result:', webhookRes.body);

  console.log('\n--- 4. Testing POST /api/phone-verify (Check Verification Status) ---');
  const checkRes = await postJson('http://localhost:3000/api/phone-verify', {
    action: 'check',
    phone: '08154276838'
  });
  console.log('Status:', checkRes.status);
  console.log('Result:', checkRes.body);

  if (checkRes.body && checkRes.body.verified === true) {
    console.log('\n🏆 ALL TESTS PASSED! Webhook verification succeeded: verified = true');
  } else {
    console.log('\nVerification status:', checkRes.body);
  }

  console.log('\n--- 5. Testing Manual Fallback Code Verification ---');
  const freshChallenge = await postJson('http://localhost:3000/api/phone-verify', {
    action: 'create',
    phone: '08031234567'
  });
  console.log('Created fresh challenge:', freshChallenge.body.code);

  const manualVerifyRes = await postJson('http://localhost:3000/api/phone-verify', {
    action: 'verify_code',
    phone: '08031234567',
    code: freshChallenge.body.code
  });
  console.log('Manual verify response:', manualVerifyRes.body);
  if (manualVerifyRes.body && manualVerifyRes.body.verified === true) {
    console.log('🏆 Manual Code Fallback verification PASSED!');
  }
}

runTest().catch(console.error);
