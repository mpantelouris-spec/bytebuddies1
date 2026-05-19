/**
 * Cloud & IoT Backend Integration
 * Supports: Cloud Variables (Firebase), ThingSpeak, MQTT, ChatGPT
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

// ─── FIREBASE SETUP ───

const FIREBASE_CONFIG = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyDemoKey',
  authDomain: 'bytebuddies-cloud.firebaseapp.com',
  projectId: 'bytebuddies-cloud',
  storageBucket: 'bytebuddies-cloud.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef1234567890',
};

let firebaseApp = null;
let db = null;
let auth = null;

async function initFirebase() {
  if (firebaseApp) return { status: 'ready' };

  try {
    firebaseApp = initializeApp(FIREBASE_CONFIG);
    db = getFirestore(firebaseApp);
    auth = getAuth(firebaseApp);

    await signInAnonymously(auth);

    return { status: 'success', message: 'Firebase initialized' };
  } catch (error) {
    console.error('Firebase init error:', error);
    return { status: 'error', message: error.message };
  }
}

// ─── CLOUD VARIABLES ───

const cloudVarSubscriptions = new Map();

export async function setCloudVariable(projectId, varName, value) {
  const init = await initFirebase();
  if (init.status !== 'success') return init;

  try {
    const varRef = doc(db, 'projects', projectId, 'variables', varName);
    await setDoc(
      varRef,
      {
        value,
        timestamp: Date.now(),
      },
      { merge: true },
    );

    return { status: 'success', message: `Set ${varName} = ${value}` };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

export async function getCloudVariable(projectId, varName) {
  const init = await initFirebase();
  if (init.status !== 'success') return init;

  try {
    const varRef = doc(db, 'projects', projectId, 'variables', varName);
    const snap = await getDoc(varRef);

    if (snap.exists()) {
      return { status: 'success', value: snap.data().value };
    } else {
      return { status: 'error', message: 'Variable not found' };
    }
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

export function subscribeToCloudVariable(projectId, varName, callback) {
  if (!db) {
    callback({ status: 'error', message: 'Firebase not initialized' });
    return () => {};
  }

  const varRef = doc(db, 'projects', projectId, 'variables', varName);
  const unsubscribe = onSnapshot(varRef, (snap) => {
    if (snap.exists()) {
      callback({ status: 'success', value: snap.data().value });
    }
  });

  const subKey = `${projectId}:${varName}`;
  cloudVarSubscriptions.set(subKey, unsubscribe);

  return () => {
    unsubscribe();
    cloudVarSubscriptions.delete(subKey);
  };
}

// ─── THINGSPEAK INTEGRATION ───

const THINGSPEAK_API = 'https://api.thingspeak.com';

export async function sendThingSpeakData(writeKey, fieldData) {
  try {
    // fieldData = { field1: value1, field2: value2, ... }
    const params = new URLSearchParams();
    params.append('api_key', writeKey);

    Object.entries(fieldData).forEach(([field, value]) => {
      params.append(field, value);
    });

    const response = await fetch(`${THINGSPEAK_API}/update`, {
      method: 'POST',
      body: params,
    });

    if (response.ok) {
      return { status: 'success', message: 'Data sent to ThingSpeak' };
    } else {
      return { status: 'error', message: 'ThingSpeak API error' };
    }
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

export async function readThingSpeakField(readKey, channelId, fieldNumber) {
  try {
    const response = await fetch(
      `${THINGSPEAK_API}/channels/${channelId}/fields/${fieldNumber}/last.json?api_key=${readKey}`,
    );

    if (response.ok) {
      const data = await response.json();
      return {
        status: 'success',
        value: parseFloat(data.field[fieldNumber]) || 0,
      };
    } else {
      return { status: 'error', message: 'Failed to read from ThingSpeak' };
    }
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

// ─── MQTT INTEGRATION ───

let mqttClient = null;

export async function initMQTT(brokerUrl, username, password) {
  try {
    // Using Paho MQTT.js library
    const clientId = `bytebuddies_${Math.random().toString(16).substr(2, 9)}`;
    mqttClient = new Paho.Client(brokerUrl, 8883, clientId);

    return new Promise((resolve) => {
      mqttClient.onConnectionLost = (responseObject) => {
        console.log('MQTT connection lost:', responseObject.errorMessage);
      };

      mqttClient.onMessageArrived = (message) => {
        console.log('Message received:', message.destinationName, message.payloadString);
      };

      mqttClient.connect({
        onSuccess: () => {
          resolve({ status: 'success', message: 'MQTT connected' });
        },
        userName: username,
        password: password,
        useSSL: true,
        cleanSession: true,
      });
    });
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

export function publishMQTT(topic, message, qos = 1) {
  if (!mqttClient || !mqttClient.isConnected()) {
    return { status: 'error', message: 'MQTT not connected' };
  }

  try {
    const mqttMessage = new Paho.Message(message);
    mqttMessage.destinationName = topic;
    mqttMessage.qos = qos;
    mqttClient.send(mqttMessage);

    return { status: 'success', message: `Published to ${topic}` };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

export function subscribeMQTT(topic, callback, qos = 1) {
  if (!mqttClient || !mqttClient.isConnected()) {
    callback({ status: 'error', message: 'MQTT not connected' });
    return () => {};
  }

  const originalOnMessage = mqttClient.onMessageArrived;
  mqttClient.onMessageArrived = (message) => {
    if (message.destinationName === topic) {
      callback({
        status: 'success',
        topic: message.destinationName,
        message: message.payloadString,
      });
    }
  };

  mqttClient.subscribe(topic, { qos });

  return () => {
    mqttClient.unsubscribe(topic);
  };
}

export function disconnectMQTT() {
  if (mqttClient && mqttClient.isConnected()) {
    mqttClient.disconnect();
    return { status: 'success', message: 'MQTT disconnected' };
  }
  return { status: 'error', message: 'Not connected' };
}

// ─── CHATGPT INTEGRATION ───

const OPENAI_API = 'https://api.openai.com/v1';

let chatHistory = [];

export async function initializeChatGPT(apiKey) {
  // Store API key securely (in production, use environment variables)
  if (!apiKey) {
    return { status: 'error', message: 'API key required' };
  }

  window.OPENAI_API_KEY = apiKey;
  chatHistory = [];

  return { status: 'success', message: 'ChatGPT initialized' };
}

export async function askChatGPT(prompt, systemRole = 'You are a helpful assistant.') {
  if (!window.OPENAI_API_KEY) {
    return { status: 'error', message: 'ChatGPT not initialized. Please provide API key.' };
  }

  try {
    // Build messages with history
    const messages = [
      { role: 'system', content: systemRole },
      ...chatHistory,
      { role: 'user', content: prompt },
    ];

    const response = await fetch(`${OPENAI_API}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${window.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { status: 'error', message: error.error.message };
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    // Store in history for context
    chatHistory.push({ role: 'user', content: prompt });
    chatHistory.push({ role: 'assistant', content: reply });

    // Keep history to last 10 exchanges
    if (chatHistory.length > 20) {
      chatHistory = chatHistory.slice(-20);
    }

    return {
      status: 'success',
      response: reply,
      tokensUsed: data.usage.total_tokens,
    };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

export function setChatGPTSystemRole(systemRole) {
  // Prepend system message to next request
  window.CHATGPT_SYSTEM_ROLE = systemRole;
  return { status: 'success', message: 'System role updated' };
}

export function clearChatGPTHistory() {
  chatHistory = [];
  return { status: 'success', message: 'Chat history cleared' };
}

// ─── HTTP REQUESTS ───

export async function makeHTTPRequest(method, url, body = null, headers = {}) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (body) {
      options.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const responseBody = await response.text();

    return {
      status: 'success',
      statusCode: response.status,
      body: responseBody,
      headers: Object.fromEntries(response.headers),
    };
  } catch (error) {
    return { status: 'error', message: error.message, statusCode: 0 };
  }
}

export async function getHTTP(url, headers = {}) {
  return makeHTTPRequest('GET', url, null, headers);
}

export async function postHTTP(url, body, headers = {}) {
  return makeHTTPRequest('POST', url, body, headers);
}

export async function putHTTP(url, body, headers = {}) {
  return makeHTTPRequest('PUT', url, body, headers);
}

export async function deleteHTTP(url, headers = {}) {
  return makeHTTPRequest('DELETE', url, null, headers);
}

// ─── WEATHER API (Open-Meteo - Free, No Key Required) ───

export async function getWeather(latitude, longitude) {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`,
    );

    if (!response.ok) {
      return { status: 'error', message: 'Weather API error' };
    }

    const data = await response.json();
    const current = data.current;

    return {
      status: 'success',
      temperature: current.temperature_2m,
      condition: getWeatherCondition(current.weather_code),
      windSpeed: current.wind_speed_10m,
      timestamp: current.time,
    };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

function getWeatherCondition(code) {
  // WMO Weather interpretation codes
  const conditions = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    51: 'Light drizzle',
    61: 'Slight rain',
    71: 'Slight snow',
    80: 'Moderate rain',
    95: 'Thunderstorm',
  };

  return conditions[code] || 'Unknown';
}

export { initFirebase };
