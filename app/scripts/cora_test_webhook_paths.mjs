import axios from 'axios';
import https from 'node:https';
import { Buffer } from 'node:buffer';
import crypto from 'node:crypto';

const CORA_CLIENT_ID = 'int-6IyEG8vrP8SSY6FUzn4VW6';
const CERT_STRING = `-----BEGIN CERTIFICATE-----
MIIFpjCCBI6gAwIBAgIUPq6QzL2GGtedXSs/l9GZ/I4L7VgwDQYJKoZIhvcNAQEL
BQAwgd4xCzAJBgNVBAYTAkJSMQswCQYDVQQIEwJTUDESMBAGA1UEBxMJU2FvIFBh
dWxvMUYwRAYDVQQJDD1Bdi4gQnJpZ2FkZWlybyBGYXJpYSBMaW1hLCAyOTU0IOKA
kyBDai4gNzIsIEphcmRpbSBQYXVsaXN0YW5vMRIwEAYDVQQREwkwMTQ1MS0wMTEx
ETAPBgNVBAoTCENvcmFCYW5rMQ8wDQYDVQQLEwZEZXZPcHMxLjAsBgNVBAMMJUNv
cmEgSW50ZWdyYcOnw6NvIERpcmV0YSBJbnRlcm1lZGlhdGUwHhcNMjYwMzEwMDA0
NTIzWhcNMjcwMzEwMDA0NTUzWjCB0zELMAkGA1UEBhMCQlIxCzAJBgNVBAgTAlNQ
MRIwEAYDVQQHEwlTYW8gUGF1bG8xRjBEBgNVBAkTPUF2ZW5pZGEgQnJpZ2FkZWly
byBGYXJpYSBMaW1hLCAyOTU0LCBjaiA3MiwgSmFyZGltIFBhdWxpc3Rhbm8xEjAQ
BgNVBBETCTAxNDUxLTAxMTERMA8GA1UEChMIQ29yYUJhbmsxDzANBgNVBAsTBkRl
dk9wczEjMCEGA1UEAxMaaW50LTZJeUVHOHZyUDhTU1k2RlV6bjRWVzYwggEiMA0G
CSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDM6eO5KNfcaBzYoIWlbshujvHdRkM2
qio+/tkFoSMCL4SCNgLc9YDZoPTWdpOHjvsXjXzUBlZa8EHod5dDMthm9UcD2z1r
rltEqoN7bTq3PB5hqEp08VnUOLQyNoo16t4X/qkrgu4YAHnJyfMl4uVG4IH0lXEh
LnanUGcMu8TGg2l8wfcC2CwJ9U0qtHfk4vKkEPy1/1SdqMAaMq6059pBi2JvwceZ
DJqrv2s75WeY+hkStb7dh4sQyMo+sq9WC+uEebIUXi1ip1BFSYw+iX3BBE7/0xhH
TaOqN6XhM3kYl2X2HsWnoC4H04YoWLHMUm7nqOtvg0UAsDDCdh3hzd33AgMBAAGj
ggFjMIIBXzAOBgNVHQ8BAf8EBAMCA6gwJwYDVR0lBCAwHgYIKwYBBQUHAwEGCCsG
AQUFBwMCBggrBgEFBQcDAzAdBgNVHQ4EFgQUf9PdHmm9tiX+Py5y4fpD4/8LCJsw
HwYDVR0jBBgwFoAUDY5BTl5UAPbBcNP0D1N9zHd43jowdwYIKwYBBQUHAQEEazBp
MCcGCCsGAQUFBzABhhtodHRwczovL29jc3AtaW50LmNvcmEubG9jYWwwPgYIKwYB
BQUHMAKGMmh0dHBzOi8vdmF1bHQuY29yYS5sb2NhbC92MS9jb3JhX2ludF9kaXJl
dGFfcGtpL2NhMCUGA1UdEQQeMByCGmludC02SXlFRzh2clA4U1NZNkZVem40Vlc2
MEQGA1UdHwQ9MDswOaA3oDWGM2h0dHBzOi8vdmF1bHQuY29yYS5sb2NhbC92MS9j
b3JhX2ludF9kaXJldGFfcGtpL2NybDANBgkqhkiG9w0BAQsFAAOCAQEAecQDr2Hn
y45gB4LaMdzh5NSmDXop8bJm/nR8FXgUB455m5/kWPq6Gjlt9FPNMUrAEEHfoS0v
LhbEeF0Z+8gHxHnV+Vq1IwRMCaQEM6u5o05c3VAv7lfQo6Paq7TqVONkX40KqVtJ
rDjO2fxJDkjPP5LW5+2NBoQTJeL1J5aQPfN3pKx90JNq7awHebgl8oKlfkVAxF4F
YAdhms1Pe+zmksePLa6oBYqPoxU5HeXrMroAf54Y4pmNZ2nlG2ZHag6wPW9IMnHu
dccwSeg9QR2045JBFdjNUwrd5HOBZbeFPRMLBxtI5Js4tFEaRRXvWXfffsJmjM3/
fluKphK4xm/8uQ==
-----END CERTIFICATE-----`;

const KEY_STRING = `-----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQEAzOnjuSjX3Ggc2KCFpW7Ibo7x3UZDNqoqPv7ZBaEjAi+EgjYC
3PWA2aD01naTh477F4181AZWWvBB6HeXQzLYZvVHA9s9a65bRKqDe206tzweYahK
dPFZ1Di0MjaKNereF/6pK4LuGAB5ycnzJeLlRuCB9JVxIS52p1BnDLvExoNpfMH3
AtgsCfVNKrR35OLypBD8tf9UnajAGjKutOfaQYtib8HHmQyaq79rO+VnmPoZErW+
3YeLEMjKPrKvVgvrhHmyFF4tYqdQRUmMPol9wQRO/9MYR02jqjel4TN5GJdl9h7F
p6AuB9OGKFixzFJu56jrb4NFALAwwnYd4c3d9wIDAQABAoIBAEdh2tBvp/LB2fqk
wKnGk8/fv+WjSlrKoHjdcmCBp55lSzXI9upeI4qshV4IZJA+gL3NrgR2SLLZKzx+
HJVuKvCC1UBEqXrPfD/JXpAqlt+p87N1WqquQOqq7irn0PHDZabaMbhUnfiCgeqH
jUpPZitwnhTD0msKso7KdXt8FapJEMziNMvN5M0u3blODWMovQ1Ve4iNnYS7/Ndv
WYH1dXfDuKpA3vcL5/6vxhYaDbdneoJzsFt1YdDMckfdpQCzP9lih+epzc6UapjX
tC1RJR8vmovsirMGNldHg5zldkaUqw508kE0kPS8vXM3TkLzM0x1M4D0sSLJv3Ex
cgdqcmECgYEA+kKF8pU0MtScVcVLLvKmhHcs+RcrGt/exq9UDICD2Qu4z1x3CRMJ
KKUsDOg5aJJSx97UL4wlo/KcmFpp6bZAPZ2Y85qwxblYDQlfOej+2s4rcAmRipw8
KghSG9FN3+bpiKUSis8c03wXqfUaHO8J1uiN9ki0VujwvwA9uiey8ZkCgYEA0Z0a
KBvjQS+Qr7f9F1MvWnBpSS/71IarepQzJiX1oJUlE8g2erTO3Z88gF8ylJhkD4nL
mFfMo6gSMLjYP3EZvYDx0ZSjLy/Scfq9eraLWWhxu96bL4aumm0EKgEVTyQOPF7X
Eh4GxZ5OdgCkOZANYnfMwaLH0d0MJA/w5vU9Jg8CgYA74x1wvpm+LDi5IbxrILAO
dQJzHUM4bChAfYZsc3iZwP9Zx/PIXSDM9DHFaPEMADAFGmLGehAr2ov0vXYo8m8P
D56hdPwmZMMYY4zBK+uI6ttkNTX56IdRO6qCc6TiFrz98Rqt0wA/76suBbRZBi7h
mccXD7DwN1AdNO6QlJ1yyQKBgBIJ+x5IiB4sAb+djeJb/k9CLU1nG70GeetqpZw6
2BChxTcWm9mjhcn80jAaAThYhQPxT9wkcjADXs1imvmauiRc3HK03/ZHn0y/z16o
JwXivybz2VcVuCECEMGspjDRYYhAgTHF878+CHKPS5LImt5GgRCI+blN1KWl2Y2G
vWRxAoGAKoibuKGKTP4zdmFMcbsWa7ei2CvoONPiWvhD0gHBio2VIt6y4x3cpZ9S
1LkxMlNRG4MwIBxyBkQ7Z5SJ9G9H7xmb0HY4XD9lXKICfQNx/bjYV4dGjOQESmYY
F++WyzIcjmiLl9LDt69warrXJmbyjLmFktQgT8IrVURJb7jyu8k=
-----END RSA PRIVATE KEY-----`;

const CORA_BASE_URL = 'https://matls-clients.api.cora.com.br';
const WEBHOOK_API_URL = 'https://api.cora.com.br';
const WEBHOOK_URL = 'https://xeuqtxxhncvechrxerqw.supabase.co/functions/v1/cora-gateway/webhook';

const pathsToTest = ['/endpoints', '/endpoints/'];

const payloadsToTest = [
    { url: WEBHOOK_URL, events: ["INVOICE.PAID"] },
    { url: WEBHOOK_URL, events: ["invoice.paid"] },
    { endpoint: WEBHOOK_URL, events: ["invoice.paid"] },
    { url: WEBHOOK_URL, resource: "invoice", trigger: "paid" },
    { endpoint: WEBHOOK_URL, resource: "invoice", trigger: "paid" },
    { url: WEBHOOK_URL, triggers: ["invoice.paid"] },
    { url: WEBHOOK_URL, event: "invoice.paid" },
    { webhook_url: WEBHOOK_URL, events: ["invoice.paid"] },
    { url: WEBHOOK_URL, resource: { name: "invoice", events: ["paid"] } }
];

async function testPaths() {
    console.log('Obtaining Token...');
    const httpsAgent = new https.Agent({ cert: Buffer.from(CERT_STRING), key: Buffer.from(KEY_STRING) });

    const tokenParams = new URLSearchParams();
    tokenParams.append('grant_type', 'client_credentials');
    tokenParams.append('client_id', CORA_CLIENT_ID);

    const tokenRes = await axios.post(`${CORA_BASE_URL}/token`, tokenParams.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, httpsAgent
    });
    
    const token = tokenRes.data.access_token;

    for (const path of pathsToTest) {
        for (let i = 0; i < payloadsToTest.length; i++) {
            const payload = payloadsToTest[i];
            console.log(`\nTesting path: ${path} with payload #${i+1}...`);
            try {
                const res = await axios.post(`${CORA_BASE_URL}${path}`, payload, {
                    headers: { 
                        'Content-Type': 'application/json', 
                        'Authorization': `Bearer ${token}`,
                        'Idempotency-Key': crypto.randomUUID()
                    },
                    httpsAgent
                });
                console.log(`\n\n🎉 SUCCESS AT PATH ${path} WITH PAYLOAD #${i+1}:`, res.status);
                return;
            } catch (error) {
                console.log(`-> 400/Error. Got:` , error.response?.status, JSON.stringify(error.response?.data || {}));
            }
        }
    }
}
testPaths();
